import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { BuyerOrderStatus } from "@prisma/client";
import { validateWebhookAndGetOrder } from "@/lib/utils/webhook";

interface PaymentWebhookBody {
  transactionId?: string;
  status?: string;
  paymentMethod?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ order_id: string }> }
) {
  try {
    const { order_id } = await params;
    
    const validation = await validateWebhookAndGetOrder(request, order_id);
    if (validation.errorResponse) return validation.errorResponse;
    const { order } = validation;

    const body = (await request.json()) as PaymentWebhookBody;
    const { transactionId, status, paymentMethod } = body;
    const incomingStatus = status as string;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "MISSING_TRANSACTION_ID", message: "transactionId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el transactionId del webhook corresponde a la transacción que iniciamos
    if (order.externalTransactionId && order.externalTransactionId !== transactionId) {
      return NextResponse.json(
        { success: false, error: "TRANSACTION_MISMATCH", message: "El transactionId no coincide con la orden" },
        { status: 409 }
      );
    }

    // Registrar el paymentMethod para trazabilidad (sin campo en DB por ahora)
    console.info(`[payment-webhook] order=${order_id} txn=${transactionId} method=${paymentMethod ?? "unknown"} status=${incomingStatus}`);


    // Mapeo de estados del webhook a nuestra base de datos
    const statusMap: Record<string, BuyerOrderStatus> = {
      APPROVED: 'PAID',
      REJECTED: 'PAYMENT_FAILED',
      CANCELLED: 'CANCELLED'
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
    const updatedOrder = await prisma.buyerOrder.update({
      where: { id: order_id },
      data: { status: newStatus }
    });

    // Mapeo del estado del carrito
    const cartStatusMap: Record<string, "CONVERTED" | "REJECTED" | "CANCELLED"> = {
      APPROVED: 'CONVERTED',
      REJECTED: 'REJECTED',
      CANCELLED: 'CANCELLED'
    };

    const newCartStatus = cartStatusMap[incomingStatus];
    if (updatedOrder.cartId && newCartStatus) {
      await prisma.cart.update({
        where: { id: updatedOrder.cartId },
        data: { status: newCartStatus }
      });
    }

    // TODO: Si es REJECTED o CANCELLED, se debería llamar a mockUnlockStock() según la skill

    return NextResponse.json({ success: true, orderStatus: newStatus });
  } catch (error) {
    console.error("Error procesando payment-webhook:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_SERVER_ERROR", message: "Error interno" },
      { status: 500 }
    );
  }
}
