import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { validateServiceToken } from "@/lib/auth";
import { ShipmentStatus } from "@/types";

interface ShippingWebhookBody {
  trackingId?: string;
  courier?: string;
  status?: ShipmentStatus;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    const { order_id } = await params;
    
    // Validación de x-service-token para autenticación inter-servicios
    if (!validateServiceToken(request)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Token de servicio inválido o ausente" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ShippingWebhookBody;
    const { trackingId, courier, status: incomingStatus } = body;

    if (!incomingStatus || !["LABEL_CREATED", "IN_TRANSIT", "DELIVERED"].includes(incomingStatus)) {
      return NextResponse.json(
        { success: false, error: "INVALID_STATUS", message: "El estado de envío provisto es inválido o no reconocido" },
        { status: 400 }
      );
    }

    const order = await prisma.buyerOrder.findUnique({
      where: { id: order_id }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "ORDER_NOT_FOUND", message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Idempotencia para envíos
    // 1. Si es LABEL_CREATED y ya tenemos el trackingId
    if (incomingStatus === 'LABEL_CREATED' && order.trackingId) {
      return NextResponse.json(
        { success: true, message: "Already processed" },
        { status: 200 }
      );
    }

    // 2. Si es IN_TRANSIT o DELIVERED y ya tenemos ese mismo estado guardado como shipmentStatus
    if ((incomingStatus === 'IN_TRANSIT' || incomingStatus === 'DELIVERED') && order.shipmentStatus === incomingStatus) {
      return NextResponse.json(
        { success: true, message: "Already processed" },
        { status: 200 }
      );
    }

    // Actualizar datos de envío
    const updateData: Prisma.BuyerOrderUpdateInput = {
      courier,
      shipmentStatus: incomingStatus
    };

    if (incomingStatus === 'LABEL_CREATED') {
      updateData.trackingId = trackingId;
      updateData.status = 'SHIPPED'; // Cambia el estado general a SHIPPED
    } else if (incomingStatus === 'DELIVERED') {
      updateData.status = 'DELIVERED'; // Cierra el ciclo de la orden
    }

    await prisma.buyerOrder.update({
      where: { id: order_id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error procesando shipping-webhook:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_SERVER_ERROR", message: "Error interno" },
      { status: 500 }
    );
  }
}
