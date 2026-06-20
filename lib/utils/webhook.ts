import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateServiceToken } from "@/lib/auth";

/**
 * Valida el token de servicio y obtiene la orden correspondiente.
 * Retorna un errorResponse si alguna validación falla, o la orden si es exitosa.
 */
export async function validateWebhookAndGetOrder(request: NextRequest, orderId: string) {
  // Validación de x-service-token para autenticación inter-servicios
  if (!validateServiceToken(request)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Token de servicio inválido o ausente" },
        { status: 401 }
      ),
    };
  }

  const order = await prisma.buyerOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "ORDER_NOT_FOUND", message: "Orden no encontrada" },
        { status: 404 }
      ),
    };
  }

  return { errorResponse: undefined, order };
}
