import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateAnalyticsToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Validación del Token del Analytics Dashboard
    if (!validateAnalyticsToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "Acceso denegado a métricas. Token inválido.",
        },
        { status: 401 }
      );
    }

    // Ejecutar múltiples consultas en paralelo
    const [
      stuckOrders,
      inTransitOrders,
      totalCarts,
      convertedCarts,
      cancelledCarts,
      rejectedCarts,
      activeCarts,
      totalRevenueAggr,
      retainedRevenueAggr,
      lostRevenueAggr,
      paidOrdersCount,
      latestTransactions,
      totalUsers,
    ] = await prisma.$transaction([
      // Órdenes Estancadas (Pagadas pero sin despachar)
      prisma.buyerOrder.count({ where: { status: "PAID", shipmentStatus: null } }),
      // Envíos en tránsito
      prisma.buyerOrder.count({ where: { shipmentStatus: "IN_TRANSIT" } }),
      // Análisis de Carritos
      prisma.cart.count(),
      prisma.cart.count({ where: { status: "CONVERTED" } }),
      prisma.cart.count({ where: { status: "CANCELLED" } }),
      prisma.cart.count({ where: { status: "REJECTED" } }),
      prisma.cart.count({ where: { status: "ACTIVE" } }),
      // Ingresos Totales
      prisma.buyerOrder.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { totalAmount: true },
      }),
      // Ingresos Retenidos (Pagadas pero no entregadas aún)
      prisma.buyerOrder.aggregate({
        where: { status: { in: ["PAID", "SHIPPED"] }, shipmentStatus: { not: "DELIVERED" } },
        _sum: { totalAmount: true },
      }),
      // Fuga de Capital
      prisma.buyerOrder.aggregate({
        where: { status: { in: ["CANCELLED", "PAYMENT_FAILED"] } },
        _sum: { totalAmount: true },
      }),
      // Cantidad de órdenes pagadas para el ticket promedio
      prisma.buyerOrder.count({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
      // Últimas transacciones
      prisma.buyerOrder.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalAmount: true,
          buyer: { select: { fullName: true } },
        },
      }),
      // Cantidad de usuarios registrados
      prisma.buyerProfile.count(),
    ]);

    const totalRevenue = Number(totalRevenueAggr._sum.totalAmount || 0);
    const retainedRevenue = Number(retainedRevenueAggr._sum.totalAmount || 0);
    const lostRevenue = Number(lostRevenueAggr._sum.totalAmount || 0);
    const ticketPromedio = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;
    const conversionRate = totalCarts > 0 ? ((convertedCarts / totalCarts) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
        },
        logistics: {
          stuckOrders,
          inTransitOrders,
        },
        carts: {
          total: totalCarts,
          active: activeCarts,
          converted: convertedCarts,
          cancelledManual: cancelledCarts,
          rejectedGateway: rejectedCarts,
          conversionRate: `${conversionRate}%`,
        },
        financial: {
          totalRevenue,
          averageTicket: ticketPromedio,
          retainedRevenue,
          lostCapital: lostRevenue,
        },
        recentTransactions: latestTransactions.map((tx) => ({
          id: tx.id,
          date: tx.createdAt.toISOString(),
          buyer: tx.buyer.fullName,
          status: tx.status,
          amount: Number(tx.totalAmount),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error al calcular las métricas del sistema.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
