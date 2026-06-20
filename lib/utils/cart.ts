import { HydratedCartItem } from "@/app/cart/types";

export interface CartTotals {
  totalItemsCount: number;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
}

/**
 * Calcula los totales del carrito basándose en las reglas de negocio de CompuLibre.
 * Envío gratis para compras mayores a 300,000 ARS, de lo contrario costo plano de 4999 ARS.
 */
export function calculateCartTotals(
  items: { cachedPrice: string | number; quantity: number }[]
): CartTotals {
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.cachedPrice) * item.quantity,
    0
  );

  // Costo de envío: Gratis si compra > 300,000 ARS o si no hay items, sino costo plano de 4999 ARS.
  const shippingCost = subtotal > 300000 || subtotal === 0 ? 0 : 4999;
  const totalAmount = subtotal + shippingCost;

  return {
    totalItemsCount,
    subtotal,
    shippingCost,
    totalAmount,
  };
}

export interface GroupedSeller {
  sellerName: string;
  items: HydratedCartItem[];
}

export interface GroupedCartItems {
  groupedBySeller: { [sellerId: string]: GroupedSeller };
  sellerIds: string[];
  hasMultipleSellers: boolean;
}

/**
 * Agrupa los items del carrito por el ID de su vendedor respectivo.
 */
export function groupCartItemsBySeller(items: HydratedCartItem[]): GroupedCartItems {
  const groupedBySeller: { [sellerId: string]: GroupedSeller } = {};
  items.forEach((item) => {
    if (!groupedBySeller[item.sellerId]) {
      groupedBySeller[item.sellerId] = {
        sellerName: item.sellerName,
        items: [],
      };
    }
    groupedBySeller[item.sellerId].items.push(item);
  });

  const sellerIds = Object.keys(groupedBySeller);
  const hasMultipleSellers = sellerIds.length > 1;

  return {
    groupedBySeller,
    sellerIds,
    hasMultipleSellers,
  };
}
