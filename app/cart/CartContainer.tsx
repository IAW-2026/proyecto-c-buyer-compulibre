"use client";

import { useOptimistic, useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  NoSymbolIcon,
  LightBulbIcon,
  SpeakerWaveIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { HydratedCartItem } from "./types";
import { updateQuantityAction, removeItemAction, removeItemsBySellerAction } from "@/lib/actions/cart";

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

  // Formateador de moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  };

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

  // Agrupamiento por vendedor (mono-vendedor check)
  const groupedBySeller: { [sellerId: string]: { sellerName: string; items: HydratedCartItem[] } } = {};
  optimisticItems.forEach((item) => {
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

  // Cálculos totales
  const totalItemsCount = optimisticItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = optimisticItems.reduce(
    (sum, item) => sum + Number(item.cachedPrice) * item.quantity,
    0
  );

  // Costo de envío: Gratis si compra > 300,000 ARS, sino costo plano de 4999 ARS.
  const shippingCost = subtotal > 300000 || subtotal === 0 ? 0 : 4999;
  const totalAmount = subtotal + shippingCost;

  // 1. Estado vacío (No hay productos)
  if (optimisticItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
        <div className="mb-6 flex items-center justify-center">
          <ShoppingCartIcon className="h-16 w-16 text-[#485696]/40" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
          Tu carrito de compras está vacío
        </h2>
        <p className="mt-2 max-w-md text-sm text-[#6B7280] leading-relaxed">
          Explorá nuestro catálogo de hardware premium y sumá componentes a tu configuración.
        </p>
        <Link
          href="/products"
          className="mt-8 rounded-xl bg-[#485696] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 hover:scale-[1.02] active:scale-[0.98]"
        >
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Mi Carrito
          </h1>
          <Link
            href="/products"
            className="mt-3.5 inline-flex text-sm font-semibold text-[#485696] hover:underline items-center gap-1.5 transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            <span>Seguir comprando</span>
          </Link>
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
                  {group.items.map((item) => {
                    const maxQuantity = Math.min(item.stock, 10);
                    return (
                      <div key={item.id} className="py-4.5 flex flex-col sm:flex-row gap-4 first:pt-0 last:pb-0">
                        {/* Imagen — enlaza al producto */}
                        <Link
                          href={`/products/${item.externalProductId}`}
                          className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 self-center sm:self-start"
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </Link>

                        {/* Detalle */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
                            {/* Nombre del producto */}
                            <div className="flex-1">
                              <Link href={`/products/${item.externalProductId}`}>
                                <h4 className="text-lg sm:text-xl font-bold text-[#1F2937] line-clamp-2 leading-snug hover:text-[#485696] transition-colors">
                                  {item.productName}
                                </h4>
                              </Link>
                            </div>

                            {/* Precio total y Precio Congelado alineados abajo */}
                            <div className="flex flex-col sm:items-end shrink-0 sm:text-right mt-1 sm:mt-4">
                              <span className="text-xl font-extrabold text-[#1F2937]">
                                {formatCurrency(Number(item.cachedPrice) * item.quantity)}
                              </span>
                              <p className="text-[10px] text-green-600 font-semibold mt-1">
                                Por unidad: {formatCurrency(Number(item.cachedPrice))} c/u
                              </p>
                            </div>
                          </div>

                          {/* Información sobre el producto */}
                          <div className="mt-2.5 mb-3.5 flex flex-col gap-1.5 text-[11px] text-[#6B7280]">
                            <div className="flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                              </svg>
                              <span>Condición: <span className="font-semibold text-gray-700">Nuevo</span></span>
                            </div>

                          </div>

                          {/* Acciones del ítem */}
                          <div className="flex items-center justify-between">
                            {/* Cantidad */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wide">
                                Cantidad:
                              </span>
                              <div className="relative">
                                <select
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(item.id, Number(e.target.value))
                                  }
                                  disabled={item.stock === 0}
                                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1 pl-2.5 pr-8 text-xs font-bold text-[#1F2937] outline-none focus:border-[#485696] focus:ring-1 focus:ring-[#485696] disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                  {item.stock === 0 ? (
                                    <option value={0}>Sin Stock</option>
                                  ) : (
                                    Array.from({ length: maxQuantity }, (_, i) => i + 1).map(
                                      (num) => (
                                        <option key={num} value={num}>
                                          {num}
                                        </option>
                                      )
                                    )
                                  )}
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[9px] text-[#6B7280]">
                                  ▼
                                </span>
                              </div>
                              {item.quantity === maxQuantity && maxQuantity > 0 && (
                                <span className="text-[10px] font-bold text-red-500">
                                  Límite de compra
                                </span>
                              )}
                            </div>

                            {/* Botón Eliminar individual */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isPending}
                              aria-label="Eliminar producto"
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                            >
                              <TrashIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Columna Derecha: Resumen de Compra */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sticky top-24 space-y-6">
            <h3 className="text-base font-extrabold text-[#1F2937] uppercase tracking-wider pb-3 border-b border-gray-100">
              Resumen de compra
            </h3>

            {/* Detalles */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#6B7280]">
                <span>Productos ({totalItemsCount})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Envío</span>
                {shippingCost === 0 ? (
                  <span className="text-green-600 font-bold">Gratis</span>
                ) : (
                  <span>{formatCurrency(shippingCost)}</span>
                )}
              </div>

              {shippingCost > 0 && (
                <p className="flex items-center gap-1 text-[10px] text-green-600 leading-normal font-semibold">
                  <LightBulbIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  ¡Sumá {formatCurrency(300000 - subtotal)} más para obtener Envío Gratis!
                </p>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-bold text-[#1F2937]">Total</span>
              <span className="text-xl font-extrabold text-[#1F2937]">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Avisos especiales */}
            {!hasProfile && (
              <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100 text-xs text-[#FC7A1E] font-medium leading-relaxed">
                <span className="inline-flex items-center gap-1">
                  <SpeakerWaveIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <strong>Dirección requerida:</strong>
                </span>
                {" "}Necesitás registrar tu dirección de envío antes de proceder al pago.
                <Link
                  href="/onboarding?returnUrl=/cart"
                  className="block font-bold underline mt-1 text-[#e0620c] hover:brightness-90"
                >
                  Registrar mi dirección ahora →
                </Link>
              </div>
            )}

            {hasMultipleSellers && (
              <div className="flex items-start gap-1.5 rounded-xl bg-red-50 p-3.5 border border-red-100 text-xs text-red-600 font-medium leading-normal">
                <NoSymbolIcon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                Tenés artículos de diferentes tiendas en el carrito. Elegí una única tienda para finalizar tu compra.
              </div>
            )}

            {/* Botón de Checkout — destaca sobre el resto */}
            {hasMultipleSellers ? (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-extrabold text-white bg-gray-300 cursor-not-allowed shadow-none"
              >
                <NoSymbolIcon className="h-4 w-4" aria-hidden="true" />
                Resolver vendedores primero
              </button>
            ) : !hasProfile ? (
              <Link
                href="/onboarding?returnUrl=/cart"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#485696] py-4 text-sm font-extrabold text-white shadow-md transition-all hover:brightness-95 hover:scale-[1.01] active:scale-[0.99]"
              >
                Registrar dirección →
              </Link>
            ) : (
              <Link
                id="checkout-link"
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FC7A1E] py-4 text-sm font-extrabold text-white shadow-lg shadow-[#FC7A1E]/25 transition-all hover:brightness-95 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                Proceder al pago
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
