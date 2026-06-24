import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSuperadminToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validación del Token del Control Plane
    if (!validateSuperadminToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "No tienes permisos para acceder a esta API administrativa.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 2. Buscar al comprador
    const buyer = await prisma.buyerProfile.findUnique({
      where: { id },
    });

    if (!buyer) {
      return NextResponse.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "Comprador no encontrado.",
        },
        { status: 404 }
      );
    }

    // 3. Formato de respuesta exitosa
    return NextResponse.json({
      success: true,
      data: buyer,
    });
  } catch (error) {
    console.error("Error en GET /api/system/buyers/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado al consultar el comprador.",
      },
      { status: 500 }
    );
  }
}
