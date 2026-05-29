"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCartIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { SellerProduct } from "@/types";
import { addToCartAction } from "@/lib/actions/cart";

interface ProductBuyBoxProps {
  product: SellerProduct;
}

export default function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<"cart" | "buy">("cart");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOutOfStock = product.stock === 0;

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price * quantity);

  const unitPriceFormatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleAddToCart = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await addToCartAction(product.id, quantity);
      if (res.success) {
        setModalActionType("cart");
        setIsModalOpen(true);
      } else {
        setErrorMsg(res.message || "No se pudo agregar el producto al carrito.");
      }
    });
  };

  const handleBuyNow = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await addToCartAction(product.id, quantity);
      if (res.success) {
        setModalActionType("buy");
        setIsModalOpen(true);
      } else {
        setErrorMsg(res.message || "No se pudo iniciar la compra.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Estado del stock */}
      <div className="mb-4">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
            Sin stock disponible
          </span>
        ) : product.stock <= 5 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#FC7A1E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FC7A1E] animate-pulse" />
            ¡Últimas {product.stock} unidades disponibles!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            Stock disponible ({product.stock} unidades)
          </span>
        )}
      </div>

      {/* Mensaje de error premium */}
      {errorMsg && (
        <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 leading-normal">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-red-600 transition shrink-0"
            aria-label="Cerrar advertencia"
          >
            ✕
          </button>
        </div>
      )}

      {/* Precio */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
          Precio total
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            {formattedPrice}
          </span>
          {quantity > 1 && (
            <span className="text-xs text-[#6B7280]">
              ({unitPriceFormatted} c/u)
            </span>
          )}
        </div>
      </div>

      {/* Select de Cantidad */}
      {!isOutOfStock && (
        <div className="mb-6">
          <label
            htmlFor="quantity"
            className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2"
          >
            Cantidad a comprar
          </label>
          <div className="relative">
            <select
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              disabled={isPending}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-[#1F2937] outline-none transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20 disabled:bg-gray-50 disabled:text-gray-400"
            >
              {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(
                (num) => (
                  <option key={num} value={num}>
                    {num} unidad{num !== 1 ? "es" : ""}
                  </option>
                )
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#6B7280]">
              ▼
            </div>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isPending}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all ${
            isOutOfStock || isPending
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-[#FC7A1E] hover:brightness-95 hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          {isPending && modalActionType === "cart" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Agregando...
            </>
          ) : (
            <>
              <ShoppingCartIcon className="h-4 w-4" aria-hidden="true" />
              Agregar al carrito
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || isPending}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold border transition-all ${
            isOutOfStock || isPending
              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              : "border-[#485696] text-[#485696] bg-white hover:bg-[#485696]/5 hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          {isPending && modalActionType === "buy" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#485696] border-t-transparent" />
              Iniciando...
            </>
          ) : (
            "Comprar ahora"
          )}
        </button>
      </div>
      {/* Modal de confirmación / Feedback premium */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="text-center mb-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 mb-3">
                <CheckCircleIcon className="h-10 w-10 text-green-500" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937]">
                {modalActionType === "cart"
                  ? "¡Agregado al carrito!"
                  : "¡Iniciando tu orden de compra!"}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-normal">
                {modalActionType === "cart"
                  ? "El producto ha sido sumado a tu carrito de compras temporal."
                  : "Estamos configurando tu checkout de forma segura."}
              </p>
            </div>

            {/* Resumen del producto */}
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-3.5 mb-6 border border-gray-100">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white shrink-0">
                <Image
                  src={product.images[0]?.imageUrl ?? "https://placehold.co/80x80?text=?"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1F2937] truncate">{product.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Cantidad: {quantity} unidad{quantity > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2.5">
              {modalActionType === "cart" ? (
                <>
                  <Link
                    href="/cart"
                    className="flex w-full items-center justify-center rounded-xl bg-[#FC7A1E] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99]"
                  >
                    Ver mi Carrito
                  </Link>
                  <Link
                    href="/products"
                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-[#6B7280] transition hover:bg-gray-50 active:scale-[0.99]"
                  >
                    Seguir comprando
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/checkout"
                    className="flex w-full items-center justify-center rounded-xl bg-[#485696] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99]"
                  >
                    Proceder al Pago ({formattedPrice})
                  </Link>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-[#6B7280] transition hover:bg-gray-50 active:scale-[0.99]"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
