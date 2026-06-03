"use server";

import { prisma as db } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ─── Funciones internas ──────────────────────────────────────────────────

async function checkAdmin() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role || (sessionClaims?.metadata as { role?: string })?.role;
  
  if (role !== "admin") {
    throw new Error("No autorizado");
  }
}

async function deleteOrdersAndCarts(buyerId: string) {

  // 1. Borrar órdenes y sus ítems
  const orders = await db.buyerOrder.findMany({ where: { buyerId }, select: { id: true } });
  const orderIds = orders.map(o => o.id);

  if (orderIds.length > 0) {
    await db.buyerOrderItem.deleteMany({
      where: { buyerOrderId: { in: orderIds } }
    });
    
    await db.buyerOrder.deleteMany({
      where: { id: { in: orderIds } }
    });
  }
    

  // 2. Limpiar el historial de carritos (Convertidos, Cancelados, Rechazados) para evitar métricas fantasma.
  // Mantenemos intacto el carrito "ACTIVE" para no interrumpir compras en curso.
  const historicalCarts = await db.cart.findMany({
    where: { buyerId, status: { not: "ACTIVE" } },
    select: { id: true }
  });

  if (historicalCarts.length > 0) {
    const historicalCartIds = historicalCarts.map(c => c.id);
    await db.cartItem.deleteMany({ where: { cartId: { in: historicalCartIds } } });
    await db.cart.deleteMany({ where: { id: { in: historicalCartIds } } });
  }
}

// Resetea los datos del formulario onboarding
async function resetUserProfile(buyerId: string) {
  await db.buyerProfile.update({
    where: { id: buyerId },
    data: { 
      fullName: "",
      defaultShippingAddress: null,
      defaultPostalCode: null,
    },
  });
}

// ─── Funciones Públicas ──────────────────────────────────────────────────

export async function toggleBuyerStatus(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;
  const currentStatusStr = formData.get("currentStatus") as string;
  const currentStatus = currentStatusStr === "true";

  await checkAdmin();

  await db.buyerProfile.update({
    where: { id: buyerId },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin");
}

export async function clearUserOrders(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;

  await checkAdmin();

  await deleteOrdersAndCarts(buyerId);

  revalidatePath("/admin");
}

export async function resetUser(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;

  await checkAdmin();

  await deleteOrdersAndCarts(buyerId);

  await resetUserProfile(buyerId);

  revalidatePath("/admin");
}

export async function resetUserOnboarding(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;

  await checkAdmin();

  await resetUserProfile(buyerId);

  revalidatePath("/admin");
}

//Simulacion del envio del paquete (TODO: ver si es necesario cambiarlo para etapa 3)
export async function simulateShippingAction(
  orderId: string,
  status: "LABEL_CREATED" | "IN_TRANSIT" | "DELIVERED"
): Promise<{ success: boolean; error?: string; message?: string }> {
  await checkAdmin();

  // ── 2. Construir payload del webhook de envío ─────────────────────
    //HOTFIX se agrego funcionalidad para Vercel para appURL
  const appUrl = 
    process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const trackingId = `TRK-MOCK-${Date.now()}`;

  const body: Record<string, string> = {
    courier: "Andreani", 
    status,
  };
  if (status === "LABEL_CREATED") {
    body.trackingId = trackingId;
  }

  // ── 3. Llamar al shipping-webhook internamente ────────────────────
  try {
    const res = await fetch(`${appUrl}/api/orders/${orderId}/shipping-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-token": process.env.SERVICE_TOKEN ?? "",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("simulateShippingAction error:", err);
      return {
        success: false,
        error: "WEBHOOK_ERROR",
        message: err?.message ?? "Error al simular el envío.",
      };
    }

    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (err) {
    console.error("simulateShippingAction network error:", err);
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: "Error de red al llamar al webhook de envío.",
    };
  }
}
