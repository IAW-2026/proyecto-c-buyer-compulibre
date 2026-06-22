"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { initPayment } from "@/lib/services/payments-app";
import { getBuyerProfile } from "@/lib/db/profile";

export interface CheckoutActionResult {
  success: false;
  error: string;
  message: string;
}

/**
 * Server Action disparada por el botón "Confirmar y pagar" en /checkout.
 *
 * Crea la BuyerOrder, los BuyerOrderItem y marca el Cart como CONVERTED
 * dentro de una transacción Prisma atómica, luego llama al mock de Payments
 * para obtener la URL de la pasarela simulada.
 *
 * Retorna un error tipado si falla, o redirige directamente en caso de éxito.
 */
export async function confirmOrderAction(): Promise<CheckoutActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "Debés iniciar sesión para confirmar tu compra.",
    };
  }

  // 1. Verificar perfil y pre-condiciones
  const profile = await getBuyerProfile();

  if (!profile) {
    return {
      success: false,
      error: "PROFILE_NOT_FOUND",
      message: "Necesitás completar tu perfil antes de comprar.",
    };
  }

  if (!profile.isActive) {
    return {
      success: false,
      error: "ACCOUNT_SUSPENDED",
      message: "Tu cuenta está suspendida. Contactá al soporte.",
    };
  }

  if (!profile.defaultShippingAddress) {
    return {
      success: false,
      error: "NO_ADDRESS",
      message: "Necesitás registrar tu dirección de envío antes de comprar.",
    };
  }

  if (!profile.defaultPostalCode) {
    return {
      success: false,
      error: "NO_POSTAL_CODE",
      message: "Necesitás registrar tu código postal antes de comprar. Actualizá tu perfil.",
    };
  }

  // 2. Obtener carrito activo con ítems
  const cart = await prisma.cart.findFirst({
    where: { buyerId: userId, status: "ACTIVE" },
    include: { items: true },
  });

  if (!cart || cart.items.length === 0) {
    return {
      success: false,
      error: "EMPTY_CART",
      message: "Tu carrito está vacío.",
    };
  }

  // 3. Validar restricción mono-vendedor
  const sellerIds = [...new Set(cart.items.map((i) => i.sellerId))];
  if (sellerIds.length > 1) {
    return {
      success: false,
      error: "MULTIPLE_SELLERS",
      message: "Solo podés comprar productos de un vendedor por vez.",
    };
  }

  const sellerId = sellerIds[0];

  // 4. Calcular total
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + Number(item.cachedPrice) * item.quantity,
    0
  );
  const shippingCost = totalAmount > 300000 ? 0 : 4999;
  const finalAmount = totalAmount + shippingCost;

  // 5. Crear la orden y convertir el carrito en una transacción atómica
  let order: { id: string };

  try {
    order = await prisma.$transaction(async (tx) => {
      // Crear la BuyerOrder
      const newOrder = await tx.buyerOrder.create({
        data: {
          buyerId: userId,
          sellerId,
          totalAmount: finalAmount,
          status: "PENDING_PAYMENT",
          cartId: cart.id,
          items: {
            create: cart.items.map((item) => ({
              externalProductId: item.externalProductId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.cachedPrice,
            })),
          },
        },
        select: { id: true },
      });

      return newOrder;
    });
  } catch (err) {
    console.error("Error al crear la orden:", err);
    return {
      success: false,
      error: "DB_ERROR",
      message: "Error interno al procesar tu orden. Intentá nuevamente.",
    };
  }

  // 6. Llamar al mock de la Payments App
  let checkoutUrl: string;

  try {
    const paymentResponse = await initPayment({
      orderReference: order.id,
      amount: finalAmount,
      currency: "ARS",
      buyerId: userId,
      buyerAddress: profile.defaultShippingAddress,
      buyerCodigoPostal: profile.defaultPostalCode,
      items: cart.items.map((item) => ({
        productId: item.externalProductId,
        quantity: item.quantity,
        name: item.productName,
        unitPrice: Number(item.cachedPrice),
        sellerId: item.sellerId,
      })),
    });

    // 7. Guardar el transactionId en la orden
    await prisma.buyerOrder.update({
      where: { id: order.id },
      data: { externalTransactionId: paymentResponse.transactionId },
    });

    checkoutUrl = paymentResponse.checkoutUrl;
  } catch (err) {
    console.error("Error al iniciar el pago mock:", err);
    return {
      success: false,
      error: "PAYMENT_INIT_ERROR",
      message: "Error al conectar con el servicio de pagos. Intentá nuevamente.",
    };
  }

  // 8. Redirigir al checkout URL (fuera del try/catch para que Next.js lo maneje)
  redirect(checkoutUrl);
}
