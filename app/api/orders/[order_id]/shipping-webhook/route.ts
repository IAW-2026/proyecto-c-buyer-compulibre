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
    let notifTitle = "";
    let notifMessage = "";

    if (status === "DELIVERED") {
      newOrderStatus = "DELIVERED";
      notifTitle = "Paquete Entregado";
      notifMessage = "Tu orden ha llegado a destino.";
    } else if (status === "IN_TRANSIT") {
      newOrderStatus = "SHIPPED";
      notifTitle = "Paquete en tránsito";
      notifMessage = "Tu paquete está en camino a tu domicilio.";
    } else if (status === "LABEL_CREATED") {
      newOrderStatus = "SHIPPED";
      // Por si Shipping App decide notificar la creación de etiqueta:
      // notifTitle = "Pedido despachado";
      // notifMessage = "El vendedor generó la etiqueta de envío.";
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

    // Crear la notificación con idempotencia
    if (notifTitle) {
      const existingNotif = await prisma.buyerNotification.findFirst({
        where: {
          orderId: order_id,
          title: notifTitle,
        }
      });

      if (!existingNotif) {
        await prisma.buyerNotification.create({
          data: {
            buyerId: order.buyerId,
            orderId: order_id,
            title: notifTitle,
            message: notifMessage,
            href: `/orders/${order_id}`,
          }
        });
      }
    }

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
