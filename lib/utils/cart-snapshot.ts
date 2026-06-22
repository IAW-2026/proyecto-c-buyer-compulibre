import { getProductsByIds } from "@/lib/services/seller-app";

// Tipo base de Prisma (ajusta según tus imports si usas un tipo derivado)
import { Cart, CartItem } from "@prisma/client";

export interface CartSnapshot {
  items: { imageUrl: string }[];
  subtotal: number;
  totalQuantity: number;
  sellerName?: string;
}

export async function getCartSnapshot(cart: (Cart & { items: CartItem[] }) | null): Promise<CartSnapshot | null> {
  if (!cart || cart.items.length === 0) {
    return null;
  }

  const productIds = cart.items.map((item) => item.externalProductId);
  const productsData = await getProductsByIds(productIds);
  
  const sellerName = productsData[0]?.sellerName ?? "Vendedor";
  
  let subtotal = 0;
  let totalQuantity = 0;
  const items = cart.items.map((item) => {
    const p = productsData.find((pd) => pd.id === item.externalProductId);
    const price = Number(item.cachedPrice);
    subtotal += price * item.quantity;
    totalQuantity += item.quantity;
    return {
      imageUrl: p?.image ?? "https://placehold.co/400x300?text=Sin+Imagen",
    };
  });
  
  return {
    items,
    subtotal,
    totalQuantity,
    sellerName,
  };
}
