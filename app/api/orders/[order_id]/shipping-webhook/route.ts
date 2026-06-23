import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { BuyerOrderStatus } from "@prisma/client";
import { validateInboundWebhookToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    // Validación del Token M2M
    if (!validateInboundWebhookToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "No autorizado. Token inválido o ausente.",
        },
        { status: 401 }
      );
    }

    const { order_id } = await params;
    const body = await request.json();

    const { trackingId, courier, status } = body;

    if (!trackingId || !courier || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "BAD_REQUEST",
          message: "Faltan campos obligatorios en el body del request.",
        },
        { status: 400 }
      );
    }

    // Buscar la orden
    const order = await prisma.buyerOrder.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "NOT_FOUND",
          message: "La orden especificada no existe en la base de datos.",
        },
        { status: 404 }
      );
    }

    // Mapeo del estado logístico al estado de la orden
    let newOrderStatus: BuyerOrderStatus | undefined;
    if (status === "DELIVERED") {
      newOrderStatus = "DELIVERED";
    } else if (status === "IN_TRANSIT" || status === "LABEL_CREATED") {
      newOrderStatus = "SHIPPED";
    }

    // Actualizar la orden
    await prisma.buyerOrder.update({
      where: { id: order_id },
      data: {
        trackingId,
        courier,
        shipmentStatus: status,
        ...(newOrderStatus ? { status: newOrderStatus } : {}),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error en shipping-webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Error interno al procesar la actualización. Intente nuevamente.",
      },
      { status: 500 }
    );
  }
}
