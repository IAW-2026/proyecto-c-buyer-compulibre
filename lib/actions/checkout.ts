"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { initPayment } from "@/lib/services/payments-app";
import { getBuyerProfile } from "@/lib/db/profile";
import { revalidatePath } from "next/cache";

export interface CheckoutActionResult {
  success: false;
  error: string;
  message: string;
}

/**
 * Server Action disparada por el botón "Confirmar y pagar" en /checkout.
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

  // 5. Verificar si ya existe una orden PENDING_PAYMENT para este carrito que tenga el mismo monto
  const existingOrder = await prisma.buyerOrder.findFirst({
    where: {
      cartId: cart.id,
      status: "PENDING_PAYMENT"
    }
  });

  let orderId: string;
  let isNewOrder = false;

  if (existingOrder && Number(existingOrder.totalAmount) === finalAmount) {
    // Reutilizar orden
    orderId = existingOrder.id;
  } else {
    // Generar un nuevo ID de orden de forma segura
    orderId = crypto.randomUUID();
    isNewOrder = true;
  }

  // 6. Llamar a Payments App
  let checkoutUrl: string;
  let transactionId: string;

  try {
    const paymentResponse = await initPayment({
      orderReference: orderId,
      amount: finalAmount,
      currency: "ARS",
      buyerId: userId,
      buyerAddress: profile.defaultShippingAddress,
      buyerCodigoPostal: Number(profile.defaultPostalCode) || 0,
      items: cart.items.map((item) => ({
        productId: item.externalProductId,
        quantity: item.quantity,
        name: item.productName,
        unit_price: Number(item.cachedPrice),
        sellerId: item.sellerId,
      })),
    });

    checkoutUrl = paymentResponse.checkoutUrl;
    transactionId = paymentResponse.transactionId;
  } catch (err) {
    console.error("Error al iniciar el pago:", err);
    return {
      success: false,
      error: "PAYMENT_INIT_ERROR",
      message: "Error al conectar con el servicio de pagos. Intentá nuevamente.",
    };
  }

  // 7. Si initPayment fue exitoso, guardamos la orden en la base de datos
  try {
    if (isNewOrder) {
      await prisma.buyerOrder.create({
        data: {
          id: orderId,
          buyerId: userId,
          sellerId,
          totalAmount: finalAmount,
          status: "PENDING_PAYMENT",
          cartId: cart.id,
          externalTransactionId: transactionId,
          checkoutUrl: checkoutUrl,
          items: {
            create: cart.items.map((item) => ({
              externalProductId: item.externalProductId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.cachedPrice,
            })),
          },
        },
      });
    } else {
      await prisma.buyerOrder.update({
        where: { id: orderId },
        data: {
          externalTransactionId: transactionId,
          checkoutUrl: checkoutUrl,
        }
      });
    }
  } catch (err) {
    console.error("Error al guardar la orden en la BD:", err);
    return {
      success: false,
      error: "DB_ERROR",
      message: "Error interno al procesar tu orden. Intentá nuevamente.",
    };
  }

  // 8. Redirigir al checkout URL (el carrito sigue intacto en ACTIVE)
  redirect(checkoutUrl);
}

export async function resumePaymentAction(orderId: string): Promise<CheckoutActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "UNAUTHORIZED", message: "No autorizado." };
  }

  const order = await prisma.buyerOrder.findUnique({
    where: { id: orderId },
    include: { items: true, buyer: true }
  });

  if (!order || order.buyerId !== userId) {
    return { success: false, error: "NOT_FOUND", message: "Orden no encontrada." };
  }

  if (order.status !== "PENDING_PAYMENT") {
    return { success: false, error: "INVALID_STATUS", message: "La orden no está pendiente de pago." };
  }

  if (order.checkoutUrl) {
    redirect(order.checkoutUrl);
  }

  let checkoutUrl: string;
  try {
    const paymentResponse = await initPayment({
      orderReference: order.id,
      amount: Number(order.totalAmount),
      currency: "ARS",
      buyerId: userId,
      buyerAddress: order.buyer.defaultShippingAddress || "",
      buyerCodigoPostal: Number(order.buyer.defaultPostalCode) || 0,
      items: order.items.map((item) => ({
        productId: item.externalProductId,
        quantity: item.quantity,
        name: item.productName,
        unit_price: Number(item.unitPrice),
        sellerId: order.sellerId,
      })),
    });

    checkoutUrl = paymentResponse.checkoutUrl;

    await prisma.buyerOrder.update({
      where: { id: order.id },
      data: {
        externalTransactionId: paymentResponse.transactionId,
        checkoutUrl: checkoutUrl,
      }
    });
  } catch (err) {
    console.error("Error al reanudar el pago:", err);
    return {
      success: false,
      error: "PAYMENT_INIT_ERROR",
      message: "Error al conectar con el servicio de pagos. Intentá nuevamente.",
    };
  }

  redirect(checkoutUrl);
}

export async function cancelOrderAction(orderId: string): Promise<CheckoutActionResult | undefined> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "UNAUTHORIZED", message: "No autorizado." };
  }

  const order = await prisma.buyerOrder.findUnique({
    where: { id: orderId }
  });

  if (!order || order.buyerId !== userId) {
    return { success: false, error: "NOT_FOUND", message: "Orden no encontrada." };
  }

  if (order.status !== "PENDING_PAYMENT") {
    return { success: false, error: "INVALID_STATUS", message: "Solo se pueden cancelar órdenes pendientes." };
  }

  try {
    await prisma.buyerOrder.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    });
  } catch {
    return { success: false, error: "DB_ERROR", message: "Error al cancelar la orden." };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  redirect("/orders");
}
