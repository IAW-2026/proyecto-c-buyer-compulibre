import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// Evitar cacheo en esta ruta de polling
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json([]);
  }

  // Buscar órdenes activas que puedan tener actualizaciones de envío
  const orders = await prisma.buyerOrder.findMany({
    where: { 
      buyerId: userId,
      status: { in: ["PAID", "SHIPPED"] } 
    },
    select: { 
      id: true, 
      shipmentStatus: true 
    },
    orderBy: { updatedAt: 'desc' },
    take: 10
  });

  return NextResponse.json(orders);
}
