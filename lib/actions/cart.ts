"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getProductById } from "@/lib/services/seller-app";
import { revalidatePath } from "next/cache";

// --- Helpers Internos ---
async function requireAuth(message = "Debe iniciar sesión para modificar el carrito.") {
  const { userId } = await auth();
  if (!userId) {
    return { errorResponse: { success: false as const, error: "UNAUTHORIZED", message } };
  }
  return { errorResponse: undefined, userId };
}

async function getValidatedCartItemAndUser(itemId: string) {
  const authCheck = await requireAuth();
  if (authCheck.errorResponse) return authCheck;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!cartItem) {
    return {
      errorResponse: { success: false as const, error: "NOT_FOUND", message: "El ítem del carrito no existe." },
    };
  }

  if (cartItem.cart.buyerId !== authCheck.userId || cartItem.cart.status !== "ACTIVE") {
    return {
      errorResponse: { success: false as const, error: "UNAUTHORIZED", message: "No tenés permiso para editar este ítem." },
    };
  }

  return { errorResponse: undefined, cartItem, userId: authCheck.userId };
}

async function cleanupEmptyCart(cartId: string) {
  const remainingItems = await prisma.cartItem.count({ where: { cartId } });
  if (remainingItems === 0) {
    await prisma.cart.delete({ where: { id: cartId } });
  }
}
// ------------------------

/**
 * Obtiene el carrito activo (ACTIVE) del comprador o crea uno nuevo si no existe.
 */
export async function getOrCreateActiveCart(userId: string) {
  let cart = await prisma.cart.findFirst({
    where: {
      buyerId: userId,
      status: "ACTIVE",
    },
    include: {
      items: true,
    },
  });

  if (!cart) {
    // Asegurarse de que el perfil exista antes de crear el carrito
    const profileExists = await prisma.buyerProfile.findUnique({ where: { id: userId } });
    if (!profileExists) {
      const user = await currentUser();
      const fullName = user ? (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim()) : "";
      
      await prisma.buyerProfile.create({
        data: {
          id: userId,
          fullName: fullName,
        }
      });
    }

    cart = await prisma.cart.create({
      data: {
        buyerId: userId,
        status: "ACTIVE",
      },
      include: {
        items: true,
      },
    });
  }

  return cart;
}

/**
 * Server Action para agregar un producto al carrito.
 */
export async function addToCartAction(productId: string, quantity: number) {
  const authCheck = await requireAuth("Debe iniciar sesión para agregar productos al carrito.");
  if (authCheck.errorResponse) return authCheck.errorResponse;
  const { userId } = authCheck;

  // 1. Obtener producto del mock de la Seller App
  const product = await getProductById(productId);
  if (!product) {
    return {
      success: false,
      error: "NOT_FOUND",
      message: "El producto no existe en el catálogo.",
    };
  }

  if (product.stock <= 0) {
    return {
      success: false,
      error: "OUT_OF_STOCK",
      message: "El producto no cuenta con stock disponible.",
    };
  }

  try {
    // 2. Obtener o crear carrito activo del usuario
    const cart = await getOrCreateActiveCart(userId);



    // 3. Buscar si el producto ya existe en el carrito activo
    const existingItem = cart.items.find(
      (item) => item.externalProductId === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // Validar contra el stock actual
      if (newQuantity > product.stock) {
        return {
          success: false,
          error: "LIMIT_EXCEEDED",
          message: `No podés agregar más de ${product.stock} unidades en total (ya tenés ${existingItem.quantity} en tu carrito).`,
        };
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Validar contra el stock actual
      if (quantity > product.stock) {
        return {
          success: false,
          error: "LIMIT_EXCEEDED",
          message: `No podés agregar más de ${product.stock} unidades.`,
        };
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          externalProductId: productId,
          productName: product.name,
          quantity: quantity,
          cachedPrice: product.price,
          sellerId: product.sellerId,
        },
      });
    }

    revalidatePath("/cart");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al agregar al carrito en la DB:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Error interno del servidor al actualizar tu carrito.",
    };
  }
}

/**
 * Server Action para actualizar la cantidad de un ítem existente en el carrito.
 */
export async function updateQuantityAction(itemId: string, quantity: number) {
  try {
    const validation = await getValidatedCartItemAndUser(itemId);
    if (validation.errorResponse) return validation.errorResponse;
    const { cartItem } = validation;

    // Si la cantidad es menor o igual a 0, eliminar
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      await cleanupEmptyCart(cartItem.cartId);
      revalidatePath("/cart");
      return { success: true };
    }

    // Validar contra el stock actual del catálogo mock
    const product = await getProductById(cartItem.externalProductId);
    if (!product) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "El producto ya no está disponible en el catálogo.",
      };
    }

    if (quantity > product.stock) {
      return {
        success: false,
        error: "LIMIT_EXCEEDED",
        message: `Solo hay ${product.stock} unidades disponibles en stock.`,
      };
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la cantidad en la DB:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Error interno al actualizar la cantidad.",
    };
  }
}

/**
 * Server Action para eliminar un ítem del carrito.
 */
export async function removeItemAction(itemId: string) {
  try {
    const validation = await getValidatedCartItemAndUser(itemId);
    if (validation.errorResponse) return validation.errorResponse;
    const { cartItem } = validation;

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    await cleanupEmptyCart(cartItem.cartId);

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el ítem de la DB:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Error interno al eliminar el ítem del carrito.",
    };
  }
}

/**
 * Server Action para eliminar todos los ítems de un vendedor del carrito.
 */
export async function removeItemsBySellerAction(sellerId: string) {
  const authCheck = await requireAuth();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    // Buscar el carrito activo del comprador
    const cart = await prisma.cart.findFirst({
      where: {
        buyerId: authCheck.userId,
        status: "ACTIVE",
      },
    });

    if (!cart) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "No tenés un carrito activo.",
      };
    }

    // Eliminar todos los ítems que pertenezcan a este vendedor en este carrito
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        sellerId: sellerId,
      },
    });

    await cleanupEmptyCart(cart.id);

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar los ítems del vendedor de la DB:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Error interno al eliminar los ítems del vendedor.",
    };
  }
}

/**
 * Server Action para vaciar completamente el carrito activo e iniciar uno nuevo con un producto diferente.
 */
export async function clearCartAndAddAction(productId: string, quantity: number) {
  const authCheck = await requireAuth();
  if (authCheck.errorResponse) return authCheck.errorResponse;
  const { userId } = authCheck;

  // 1. Obtener producto del mock de la Seller App
  const product = await getProductById(productId);
  if (!product) {
    return {
      success: false,
      error: "NOT_FOUND",
      message: "El producto no existe en el catálogo.",
    };
  }

  if (product.stock <= 0) {
    return {
      success: false,
      error: "OUT_OF_STOCK",
      message: "El producto no cuenta con stock disponible.",
    };
  }

  try {
    // 2. Buscar si el usuario tiene un carrito activo
    const activeCart = await prisma.cart.findFirst({
      where: { buyerId: userId, status: "ACTIVE" }
    });

    if (activeCart) {
      // Eliminar el carrito anterior (cascades a items en DB)
      await prisma.cart.delete({
        where: { id: activeCart.id }
      });
    }

    // 3. Crear nuevo carrito y agregar el producto
    await prisma.cart.create({
      data: {
        buyerId: userId,
        status: "ACTIVE",
        items: {
          create: {
            externalProductId: productId,
            productName: product.name,
            quantity: quantity,
            cachedPrice: product.price,
            sellerId: product.sellerId,
          }
        }
      }
    });

    revalidatePath("/cart");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error en clearCartAndAddAction:", error);
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Error interno al vaciar el carrito y agregar el producto.",
    };
  }
}


