"use server";

import { prisma as db } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleBuyerStatus(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;
  const currentStatusStr = formData.get("currentStatus") as string;
  const currentStatus = currentStatusStr === "true";

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
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

  // Borrar primero los ítems de las órdenes
  const orders = await db.buyerOrder.findMany({ where: { buyerId }, select: { id: true } });
  const orderIds = orders.map(o => o.id);

  if (orderIds.length > 0) {
    await db.buyerOrderItem.deleteMany({
      where: { buyerOrderId: { in: orderIds } }
    });
    
    // Luego borrar las órdenes
    await db.buyerOrder.deleteMany({
      where: { id: { in: orderIds } }
    });
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
    data: { defaultShippingAddress: null },
  });

  revalidatePath("/admin");
}
