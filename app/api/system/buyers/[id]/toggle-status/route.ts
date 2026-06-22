import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateControlPlaneToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateControlPlaneToken(request)) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED", message: "Token de Control Plane inválido o ausente" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const buyer = await prisma.buyerProfile.findUnique({ where: { id } });
    if (!buyer) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Comprador no encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.buyerProfile.update({
      where: { id },
      data: { isActive: !buyer.isActive }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        isActive: updated.isActive
      }
    });
  } catch (error) {
    console.error("Error en toggle-status:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Error interno" },
      { status: 500 }
    );
  }
}
