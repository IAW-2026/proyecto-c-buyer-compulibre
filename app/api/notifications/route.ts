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

  // Buscar las notificaciones del usuario
  const notifications = await prisma.buyerNotification.findMany({
    where: { 
      buyerId: userId,
    },
    orderBy: { createdAt: 'desc' },
    take: 15
  });

  return NextResponse.json(notifications);
}
