"use client";

import { createPortal } from "react-dom";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCartIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { SellerProduct } from "@/types";
import { addToCartAction } from "@/lib/actions/cart";

interface ProductBuyBoxProps {
  product: SellerProduct;
  hasItemsInCart?: boolean;
}

export default function ProductBuyBox({ product, hasItemsInCart = false }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState<"cart" | "buy">("cart");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedHasItems, setCapturedHasItems] = useState(hasItemsInCart);
  const router = useRouter();

  // Bloquear el scroll de la página cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

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
    setCapturedHasItems(hasItemsInCart);
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
    setCapturedHasItems(hasItemsInCart);
    setModalActionType("buy");
    setIsModalOpen(true);
  };

  const handleConfirmBuy = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await addToCartAction(product.id, quantity);
      if (res.success) {
        router.push("/checkout");
      } else {
        setErrorMsg(res.message || "No se pudo iniciar la compra.");
        setIsModalOpen(false);
      }
    });
  };

  const handleConfirmBuyAndGoToCart = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await addToCartAction(product.id, quantity);
      if (res.success) {
        router.push("/cart");
      } else {
        setErrorMsg(res.message || "No se pudo iniciar la compra.");
        setIsModalOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col">
      {/* Mensaje de error */}
      {errorMsg && (
        <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100 flex items-start gap-2.5">
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
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-normal text-gray-900 tracking-tight">
            {formattedPrice}
          </span>
          {quantity > 1 && (
            <span className="text-sm text-gray-500">
              ({unitPriceFormatted} c/u)
            </span>
          )}
        </div>
      </div>

      {/* Seller */}
      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2 overflow-hidden">
        <span className="min-w-0 truncate" title={`Vendido por ${product.sellerName}`}>
          Vendido por <span className="font-semibold text-gray-900">{product.sellerName}</span>
        </span>
        <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" aria-hidden="true" />
      </div>

      {/* Estado del stock */}
      <div className="mb-8">
        <span className="text-sm text-gray-600">
          Stock disponible ({product.stock} unidades)
        </span>
      </div>

      {/* Select de Cantidad */}
      {!isOutOfStock && (
        <div className="mb-8">
          <label
            htmlFor="quantity"
            className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-3"
          >
            Cantidad a comprar
          </label>
          <div className="relative">
            <select
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              disabled={isPending}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(
                (num) => (
                  <option key={num} value={num}>
                    {num} unidad{num !== 1 ? "es" : ""}
                  </option>
                )
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              ▼
            </div>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || isPending}
          className={`flex w-full items-center justify-center rounded-md py-4 text-base font-medium transition-all ${
            isOutOfStock || isPending
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#FC7A1E] text-white hover:brightness-95 active:scale-[0.99] cursor-pointer"
          }`}
        >
          {isPending && modalActionType === "buy" ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Procesando...
            </>
          ) : (
            "Comprar ahora"
          )}
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isPending}
          className={`flex w-full items-center justify-center rounded-md py-4 text-base font-medium transition-all ${
            isOutOfStock || isPending
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-300 text-[#485696] hover:brightness-95 active:scale-[0.99] cursor-pointer"
          }`}
        >
          {isPending && modalActionType === "cart" ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Agregando...
            </>
          ) : (
            <>
              <ShoppingCartIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Agregar al carrito
            </>
          )}
        </button>
      </div>

      {/* Modal de confirmación / Feedback premium (Renderizado con Portal para escapar del stacking context) */}
      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-9999 pointer-events-auto flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="text-center mb-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 mb-3">
                <CheckCircleIcon className="h-10 w-10 text-green-500" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937]">
                {modalActionType === "cart"
                  ? "¡Agregado al carrito!"
                  : capturedHasItems
                    ? "¡Agregado a tu pedido!"
                    : "¡Iniciando tu orden de compra!"}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1 leading-normal">
                {modalActionType === "cart"
                  ? "El producto ha sido sumado a tu carrito de compras temporal."
                  : capturedHasItems
                    ? "Como tenés otros productos en el carrito, te sugerimos revisarlo."
                    : "Estamos configurando tu checkout de forma segura."}
              </p>
            </div>

            {/* Resumen del producto */}
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-3.5 mb-6 border border-gray-100">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white shrink-0">
                <Image
                  src={product.images[0]?.imageUrl ?? "https://placehold.co/400x300?text=Sin+Imagen"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#1F2937] truncate">{product.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Cantidad: {quantity} unidad{quantity > 1 ? "es" : ""}
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
                  {capturedHasItems ? (
                    <button
                      onClick={handleConfirmBuyAndGoToCart}
                      disabled={isPending}
                      className="flex w-full items-center justify-center rounded-xl bg-[#485696] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <ShoppingCartIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                          Revisar carrito antes de pagar
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmBuy}
                      disabled={isPending}
                      className="flex w-full items-center justify-center rounded-xl bg-[#485696] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Procesando...
                        </>
                      ) : (
                        `Proceder al Pago (${formattedPrice})`
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={isPending}
                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-[#6B7280] transition hover:bg-gray-50 active:scale-[0.99]"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
