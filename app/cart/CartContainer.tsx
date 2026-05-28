"use client";

import { useOptimistic, useTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HydratedCartItem } from "./types";
import { updateQuantityAction, removeItemAction } from "@/lib/actions/cart";

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
    ) => {
      if (action.type === "UPDATE_QTY") {
        return state.map((item) =>
          item.id === action.itemId ? { ...item, quantity: action.quantity } : item
        );
      }
      if (action.type === "REMOVE") {
        return state.filter((item) => item.id !== action.itemId);
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
        <div className="mb-6 text-6xl">🛒</div>
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
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Mi Carrito
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Gestioná y asegurá tus productos al precio actual de tu selección.
          </p>
        </div>
        <Link
          href="/products"
          className="mt-3 md:mt-0 text-sm font-semibold text-[#485696] hover:underline flex items-center gap-1.5"
        >
          <span>←</span> Seguir comprando
        </Link>
      </div>

      {/* Alerta de error global */}
      {errorMessage && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
            ✕
          </button>
        </div>
      )}

      {/* Banner Mono-Vendedor (Si hay múltiples vendedores) */}
      {hasMultipleSellers && (
        <div className="rounded-2xl bg-linear-to-r from-amber-500/10 to-red-500/10 border-2 border-amber-500/30 p-6 flex flex-col md:flex-row md:items-center gap-5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
            ⚠️
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#1F2937]">Compra Restringida: Múltiples Vendedores</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Solo puede comprar productos de un vendedor por vez. Elimine los productos de otros vendedores para continuar con la compra.
            </p>
          </div>
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
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4.5 mb-4">
                  <span className="text-lg">🏪</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-[#1F2937] uppercase tracking-wide">
                      {group.sellerName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                      <span>✓</span> Vendedor Verificado
                    </span>
                  </div>
                </div>

                {/* Ítems del Vendedor */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((item) => {
                    const maxQuantity = Math.min(item.stock, 10);
                    return (
                      <div key={item.id} className="py-4.5 flex gap-4 first:pt-0 last:pb-0">
                        {/* Imagen — enlaza al producto */}
                        <Link
                          href={`/products/${item.externalProductId}`}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 hover:opacity-90 transition-opacity"
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
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <Link href={`/products/${item.externalProductId}`}>
                                <h4 className="text-sm font-bold text-[#1F2937] line-clamp-2 leading-snug hover:text-[#485696] transition-colors">
                                  {item.productName}
                                </h4>
                              </Link>
                              <p className="text-[10px] text-green-600 font-semibold mt-1">
                                Precio congelado: {formatCurrency(Number(item.cachedPrice))} c/u
                              </p>
                            </div>
                            <span className="text-sm font-extrabold text-[#1F2937] shrink-0">
                              {formatCurrency(Number(item.cachedPrice) * item.quantity)}
                            </span>
                          </div>

                          {/* Acciones del ítem */}
                          <div className="flex items-center justify-between mt-3">
                            {/* Cantidad */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wide">
                                Cantidad:
                              </span>
                              <div className="relative">
                                <select
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(item.id, Number(e.target.value))
                                  }
                                  disabled={isPending || item.stock === 0}
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
                              {item.stock <= 5 && item.stock > 0 && (
                                <span className="text-[10px] font-bold text-[#FC7A1E]">
                                  ¡Sólo {item.stock} disponibles!
                                </span>
                              )}
                            </div>

                            {/* Eliminar */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isPending}
                              className="text-xs font-bold text-red-500 hover:text-red-700 transition flex items-center gap-1 disabled:opacity-50"
                            >
                              <span>🗑️</span>
                              <span className="hidden sm:inline">Eliminar</span>
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
                <p className="text-[10px] text-green-600 leading-normal font-semibold">
                  💡 ¡Sumá {formatCurrency(300000 - subtotal)} más para obtener Envío Gratis!
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

            {/* Métodos de pago aceptados */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Pagos seguros con
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Visa", "Mastercard", "Amex", "Naranja X", "Mercado Pago"].map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold text-[#4B5563] shadow-xs"
                  >
                    {method}
                  </span>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1 text-[10px] text-[#6B7280]">
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="11" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Transacción cifrada con SSL
              </p>
            </div>

            {/* Avisos especiales */}
            {!hasProfile && (
              <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100 text-xs text-[#FC7A1E] font-medium leading-relaxed">
                📢 <strong>Dirección requerida:</strong> Necesitás registrar tu dirección de envío antes de proceder al pago.
                <Link
                  href="/onboarding?returnUrl=/cart"
                  className="block font-bold underline mt-1 text-[#e0620c] hover:brightness-90"
                >
                  Registrar mi dirección ahora →
                </Link>
              </div>
            )}

            {hasMultipleSellers && (
              <div className="rounded-xl bg-red-50 p-3.5 border border-red-100 text-xs text-red-600 font-medium leading-normal">
                🚫 Tenés artículos de diferentes tiendas en el carrito. Elegí una única tienda para finalizar tu compra.
              </div>
            )}

            {/* Botón de Checkout — destaca sobre el resto */}
            {hasMultipleSellers ? (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-extrabold text-white bg-gray-300 cursor-not-allowed shadow-none"
              >
                🚫 Resolver vendedores primero
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
