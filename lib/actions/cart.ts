"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { getProductById } from "@/lib/mocks/seller-app";
import { revalidatePath } from "next/cache";

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
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "Debe iniciar sesión para agregar productos al carrito.",
    };
  }

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
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "Debe iniciar sesión para modificar el carrito.",
    };
  }

  try {
    // Buscar el ítem en la base de datos
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "El ítem del carrito no existe.",
      };
    }

    // Validar seguridad de pertenencia
    if (cartItem.cart.buyerId !== userId || cartItem.cart.status !== "ACTIVE") {
      return {
        success: false,
        error: "UNAUTHORIZED",
        message: "No tenés permiso para editar este ítem.",
      };
    }

    // Si la cantidad es menor o igual a 0, eliminar
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      const remainingItems = await prisma.cartItem.count({ where: { cartId: cartItem.cartId } });
      if (remainingItems === 0) {
        await prisma.cart.delete({ where: { id: cartItem.cartId } });
      }
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
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "Debe iniciar sesión para modificar el carrito.",
    };
  }

  try {
    // Buscar el ítem en la base de datos
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return {
        success: false,
        error: "NOT_FOUND",
        message: "El ítem del carrito no existe.",
      };
    }

    // Validar seguridad de pertenencia
    if (cartItem.cart.buyerId !== userId || cartItem.cart.status !== "ACTIVE") {
      return {
        success: false,
        error: "UNAUTHORIZED",
        message: "No tenés permiso para editar este ítem.",
      };
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const remainingItems = await prisma.cartItem.count({ where: { cartId: cartItem.cartId } });
    if (remainingItems === 0) {
      await prisma.cart.delete({ where: { id: cartItem.cartId } });
    }

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
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "Debe iniciar sesión para modificar el carrito.",
    };
  }

  try {
    // Buscar el carrito activo del comprador
    const cart = await prisma.cart.findFirst({
      where: {
        buyerId: userId,
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

    const remainingItems = await prisma.cartItem.count({ where: { cartId: cart.id } });
    if (remainingItems === 0) {
      await prisma.cart.delete({ where: { id: cart.id } });
    }

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

