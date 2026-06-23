import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
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
    
    console.log(`[Webhook] Recibido POST en /payment-webhook para orden ${order_id}`, body);

    const { transactionId, status } = body;

    if (!transactionId || !status) {
      console.warn("[Webhook] Faltan campos. Body:", body);
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
      include: { cart: true },
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

    if (String(status).toUpperCase() === "APPROVED") {
      // Actualizar Orden y Carrito en una transacción
      await prisma.$transaction(async (tx) => {
        await tx.buyerOrder.update({
          where: { id: order_id },
          data: {
            status: "PAID",
            externalTransactionId: String(transactionId),
          },
        });

        if (order.cartId) {
          await tx.cart.update({
            where: { id: order.cartId },
            data: { status: "CONVERTED" },
          });
        }
      });

      return NextResponse.json({
        success: true,
        orderStatus: "PAID",
      });
    }

    // Si el pago no fue aprobado
    return NextResponse.json(
      {
        success: false,
        error: "PAYMENT_NOT_APPROVED",
        message: `El estado del pago es ${status}. No se actualizó la orden.`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en payment-webhook:", error);
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
