import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { BuyerProfile } from "@prisma/client";

/**
 * Helper genérico para validar tokens.
 * Centraliza la lógica para no repetir código (DRY).
 */
function validateToken(request: Request, headerName: string, expectedToken: string | undefined): boolean {
  const token = request.headers.get(headerName);
  if (!expectedToken) return false;
  return token === expectedToken;
}

/**
 * Validar Token M2M (Estrategia B: Exigir la llave de la Buyer App)
 * Cualquier app que llame a nuestros webhooks debe enviarnos nuestra propia llave.
 */
export function validateInboundWebhookToken(request: Request): boolean {
  return validateToken(request, "x-api-key", process.env.BUYER_API_KEY);
}

/**
 * Validar Token del Control Plane (Global Admin)
 */
export function validateSuperadminToken(request: Request): boolean {
  return validateToken(request, "x-api-key", process.env.SUPERADMIN_API_KEY);
}

/**
 * Validar Token del Analytics Dashboard
 */
export function validateAnalyticsToken(request: Request): boolean {
  return validateToken(request, "x-api-key", process.env.ANALYTICS_API_KEY);
}

/**
 * Helper (Higher-Order Function) para refactorizar endpoints de Superadmin que actúan sobre un Buyer.
 * Valida el token y verifica que el usuario exista en la base de datos, evitando repetir código.
 */
export async function withSuperadminAndBuyer(
  request: Request,
  buyerId: string,
  actionHandler: (buyer: BuyerProfile) => Promise<NextResponse>
) {
  try {
    if (!validateSuperadminToken(request)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "No autorizado." },
        { status: 401 }
      );
    }

    const buyer = await prisma.buyerProfile.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      return NextResponse.json(
        { success: false, error: "NOT_FOUND", message: "Comprador no encontrado." },
        { status: 404 }
      );
    }

    return await actionHandler(buyer);
  } catch (error) {
    console.error(`Error en operación de superadmin para el buyer ${buyerId}:`, error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_ERROR", message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

