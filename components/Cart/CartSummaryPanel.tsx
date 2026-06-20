import Link from "next/link";
import { LightBulbIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/lib/formatters";

interface CartSummaryPanelProps {
  totalItemsCount: number;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  hasMultipleSellers: boolean;
  hasProfile: boolean;
}

export default function CartSummaryPanel({
  totalItemsCount,
  subtotal,
  shippingCost,
  totalAmount,
  hasMultipleSellers,
  hasProfile,
}: CartSummaryPanelProps) {
  return (
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

      {hasMultipleSellers && (
        <div className="flex items-start gap-1.5 rounded-xl bg-red-50 p-3.5 border border-red-100 text-xs text-red-600 font-medium leading-normal">
          <NoSymbolIcon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          Tenés artículos de diferentes tiendas en el carrito. Elegí una única tienda para finalizar tu compra.
        </div>
      )}

      {/* Botón de Checkout */}
      {hasMultipleSellers ? (
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-extrabold text-white bg-gray-300 cursor-not-allowed shadow-none"
        >
          <NoSymbolIcon className="h-4 w-4" aria-hidden="true" />
          Resolver vendedores primero
        </button>
      ) : (
        <Link
          id="checkout-link"
          href={hasProfile ? "/checkout" : "/onboarding?returnUrl=/checkout"}
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
  );
}
