"use client";

import { useOptimistic, useTransition, useState } from "react";
import Link from "next/link";
import {
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { HydratedCartItem } from "./types";
import { updateQuantityAction, removeItemAction, removeItemsBySellerAction } from "@/lib/actions/cart";
import CartEmptyState from "@/components/Cart/CartEmptyState";
import CartItemRow from "@/components/Cart/CartItemRow";
import CartSummaryPanel from "@/components/Cart/CartSummaryPanel";
import { calculateCartTotals, groupCartItemsBySeller } from "@/lib/utils/cart";

interface CartContainerProps {
  items: HydratedCartItem[];
  hasProfile: boolean;
}

export default function CartContainer({ items, hasProfile }: CartContainerProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useOptimistic para transiciones rápidas e instantáneas
  const [optimisticItems, updateOptimistic] = useOptimistic(
    items,
    (
      state,
      action:
        | { type: "UPDATE_QTY"; itemId: string; quantity: number }
        | { type: "REMOVE"; itemId: string }
        | { type: "REMOVE_SELLER"; sellerId: string }
    ) => {
      if (action.type === "UPDATE_QTY") {
        return state.map((item) =>
          item.id === action.itemId ? { ...item, quantity: action.quantity } : item
        );
      }
      if (action.type === "REMOVE") {
        return state.filter((item) => item.id !== action.itemId);
      }
      if (action.type === "REMOVE_SELLER") {
        return state.filter((item) => item.sellerId !== action.sellerId);
      }
      return state;
    }
  );

  // Manejo de cambios de cantidad
  const handleQuantityChange = (itemId: string, quantity: number) => {
    setErrorMessage(null);
    startTransition(async () => {
      // Modificar optimísticamente la UI
      updateOptimistic({ type: "UPDATE_QTY", itemId, quantity });

      const res = await updateQuantityAction(itemId, quantity);
      if (!res.success) {
        setErrorMessage(res.message || "Error al actualizar la cantidad.");
      }
    });
  };

  // Manejo de eliminación de ítems
  const handleRemoveItem = (itemId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      // Eliminar optimísticamente la UI
      updateOptimistic({ type: "REMOVE", itemId });

      const res = await removeItemAction(itemId);
      if (!res.success) {
        setErrorMessage(res.message || "Error al quitar el producto.");
      }
    });
  };

  // Manejo de eliminación de todos los ítems de un vendedor
  const handleRemoveSellerItems = (sellerId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      // Eliminar optimísticamente la UI
      updateOptimistic({ type: "REMOVE_SELLER", sellerId });

      const res = await removeItemsBySellerAction(sellerId);
      if (!res.success) {
        setErrorMessage(res.message || "Error al quitar los productos del vendedor.");
      }
    });
  };

  // Agrupar items por vendedor y calcular totales
  const { groupedBySeller, sellerIds, hasMultipleSellers } = groupCartItemsBySeller(optimisticItems);
  const { totalItemsCount, subtotal, shippingCost, totalAmount } = calculateCartTotals(optimisticItems);

  // 1. Estado vacío (No hay productos)
  if (optimisticItems.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <div>
          <Link
            href="/products"
            className="mt-3.5 inline-flex text-sm font-semibold text-[#485696] hover:underline items-center gap-1.5 transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            <span>Seguir comprando</span>
          </Link>
           <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Mi Carrito
          </h1>
        </div>
      </div>

      {/* Alerta de error global */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Columna Izquierda: Lista de productos agrupados */}
        <div className="lg:col-span-2 space-y-6">
          {sellerIds.map((sellerId) => {
            const group = groupedBySeller[sellerId];
            return (
              <div
                key={sellerId}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md duration-300"
              >
                {/* Cabecera del Vendedor */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4.5 mb-4">
                  <div className="flex items-center gap-2">
                    <BuildingStorefrontIcon className="h-5 w-5 text-[#485696]" aria-hidden="true" />
                    <span className="font-extrabold text-sm text-[#1F2937] uppercase tracking-wide">
                      {group.sellerName}
                    </span>
                  </div>
                  {group.items.length > 1 && (
                    <button
                      onClick={() => handleRemoveSellerItems(sellerId)}
                      disabled={isPending}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <TrashIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>Eliminar todo</span>
                    </button>
                  )}
                </div>

                {/* Ítems del Vendedor */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      isPending={isPending}
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Columna Derecha: Resumen de Compra */}
        <div className="lg:col-span-1">
          <CartSummaryPanel
            totalItemsCount={totalItemsCount}
            subtotal={subtotal}
            shippingCost={shippingCost}
            totalAmount={totalAmount}
            hasMultipleSellers={hasMultipleSellers}
            hasProfile={hasProfile}
          />
        </div>
      </div>
    </div>
  );
}
