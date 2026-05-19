import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    const { order_id } = await params;
    
    // Etapa 3: Validación de x-service-token
    /*
    const token = request.headers.get("x-service-token");
    if (token !== process.env.INTERNAL_SERVICE_TOKEN) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Token inválido o ausente" },
        { status: 401 }
      );
    }
    */

    const body = await request.json();
    const { trackingId, courier, status: incomingStatus } = body;

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
    const updateData: any = {
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
