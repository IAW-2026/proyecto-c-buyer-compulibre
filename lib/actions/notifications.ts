"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";

export async function markAllNotificationsAsReadAction() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "No autorizado" };
  }

  try {
    await prisma.$transaction([
      // 1. Marcar como leídas
      prisma.buyerNotification.updateMany({
        where: {
          buyerId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      }),
      // 2. Borrar las viejas (Limpieza silenciosa de notificaciones leídas de más de 30 días)
      prisma.buyerNotification.deleteMany({
        where: {
          buyerId: userId,
          isRead: true,
          createdAt: {
            lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
          },
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error al marcar notificaciones como leídas:", error);
    return { success: false, error: "Error interno" };
  }
}
