import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSuperadminToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateSuperadminToken(request)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "No autorizado." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const order = await prisma.buyerOrder.findUnique({
      where: { id },
      include: {
        buyer: { select: { fullName: true, id: true } },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Orden no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(`Error en GET /api/system/orders/${params}:`, error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
