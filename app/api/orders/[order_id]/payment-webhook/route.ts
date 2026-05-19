import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { BuyerOrderStatus } from "@prisma/client";

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
    const { transactionId, status, paymentMethod } = body;
    const incomingStatus = status as string;

    const order = await prisma.buyerOrder.findUnique({
      where: { id: order_id }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "ORDER_NOT_FOUND", message: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Mapeo de estados del webhook a nuestra base de datos
    const statusMap: Record<string, BuyerOrderStatus> = {
      APPROVED: 'PAID',
      REJECTED: 'PAYMENT_FAILED'
    };

    const newStatus = statusMap[incomingStatus];

    if (!newStatus) {
      return NextResponse.json(
        { success: false, error: "INVALID_STATUS", message: "Status desconocido" },
        { status: 400 }
      );
    }

    // Idempotencia con el status mapeado
    if (order.status === newStatus) {
      return NextResponse.json(
        { success: true, message: "Already processed" },
        { status: 200 }
      );
    }

    // Actualizar la orden
    await prisma.buyerOrder.update({
      where: { id: order_id },
      data: { status: newStatus }
    });

    // TODO: Si es REJECTED, se debería llamar a mockUnlockStock() según la skill

    return NextResponse.json({ success: true, orderStatus: newStatus });
  } catch (error) {
    console.error("Error procesando payment-webhook:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_SERVER_ERROR", message: "Error interno" },
      { status: 500 }
    );
  }
}
