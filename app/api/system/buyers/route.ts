import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateControlPlaneToken } from "@/lib/auth";

/**
 * GET /api/system/buyers
 * Retorna el listado consolidado de todos los compradores locales.
 */
export async function GET(request: NextRequest) {
  if (!validateControlPlaneToken(request)) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED", message: "Token de Control Plane inválido o ausente" },
      { status: 401 }
    );
  }

  try {
    const buyers = await prisma.buyerProfile.findMany({
      select: {
        id: true,
        fullName: true,
        defaultShippingAddress: true,
        defaultPostalCode: true,
        isActive: true,
        _count: {
          select: { orders: true, carts: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: buyers
    });
  } catch (error) {
    console.error("Error fetching buyers for Control Plane:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Error interno" },
      { status: 500 }
    );
  }
}
