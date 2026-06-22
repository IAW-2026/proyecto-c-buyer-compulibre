import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateControlPlaneToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!validateControlPlaneToken(request)) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED", message: "Token de Control Plane inválido o ausente" },
      { status: 401 }
    );
  }

  try {
    // Carritos abandonados: asumiendo que son los que quedaron ACTIVE o CANCELLED sin convertirse en compra.
    const abandonedCarts = await prisma.cart.count({
      where: { status: { in: ['ACTIVE', 'CANCELLED'] } }
    });

    const pendingOrders = await prisma.buyerOrder.count({
      where: { status: 'PENDING_PAYMENT' }
    });

    const paidOrders = await prisma.buyerOrder.count({
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } }
    });

    const totalMoneyResult = await prisma.buyerOrder.aggregate({
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
      _sum: { totalAmount: true }
    });

    const totalMoneySpent = Number(totalMoneyResult._sum.totalAmount || 0);

    return NextResponse.json({
      success: true,
      data: {
        abandonedCarts,
        pendingOrders,
        paidOrders,
        totalMoneySpent
      }
    });
  } catch (error) {
    console.error("Error en metrics:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Error interno" },
      { status: 500 }
    );
  }
}
