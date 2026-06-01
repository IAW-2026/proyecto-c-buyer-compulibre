"use server";

import { prisma as db } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleBuyerStatus(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;
  const currentStatusStr = formData.get("currentStatus") as string;
  const currentStatus = currentStatusStr === "true";

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role || (sessionClaims?.metadata as { role?: string })?.role;
  
  if (role !== "admin") {
    throw new Error("No autorizado");
  }

  await db.buyerProfile.update({
    where: { id: buyerId },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin");
}

export async function clearUserOrders(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role || (sessionClaims?.metadata as { role?: string })?.role;
  
  if (role !== "admin") {
    throw new Error("No autorizado");
  }

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

  revalidatePath("/admin");
}

export async function resetUser(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role || (sessionClaims?.metadata as { role?: string })?.role;
  
  if (role !== "admin") {
    throw new Error("No autorizado");
  }

  // 1. Borrar Órdenes
  const orders = await db.buyerOrder.findMany({ where: { buyerId }, select: { id: true } });
  const orderIds = orders.map(o => o.id);
  if (orderIds.length > 0) {
    await db.buyerOrderItem.deleteMany({ where: { buyerOrderId: { in: orderIds } } });
    await db.buyerOrder.deleteMany({ where: { id: { in: orderIds } } });
  }

  // 2. Borrar Carritos
  const carts = await db.cart.findMany({ where: { buyerId }, select: { id: true } });
  const cartIds = carts.map(c => c.id);
  if (cartIds.length > 0) {
    await db.cartItem.deleteMany({ where: { cartId: { in: cartIds } } });
    await db.cart.deleteMany({ where: { id: { in: cartIds } } });
  }

  // 3. Resetear el Perfil
  await db.buyerProfile.update({
    where: { id: buyerId },
    data: { 
      fullName: "",
      defaultShippingAddress: null,
      defaultPostalCode: null,
    },
  });

  revalidatePath("/admin");
}

export async function resetUserOnboarding(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role || (sessionClaims?.metadata as { role?: string })?.role;
  
  if (role !== "admin") {
    throw new Error("No autorizado");
  }

  await db.buyerProfile.update({
    where: { id: buyerId },
    data: {
      fullName: "",
      defaultShippingAddress: null,
      defaultPostalCode: null,
    },
  });

  revalidatePath("/admin");
}
