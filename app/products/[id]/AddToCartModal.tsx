// Componente de modal presentacional (Portal) que se muestra al usuario tras agregar un producto 
// al carrito o al intentar comprar inmediatamente. Maneja distintos estados: confirmación de 
// éxito, advertencia por vendedor diferente, y redirecciones a checkout o revisión de carrito.

import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { CheckCircleIcon, ExclamationTriangleIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { SellerProduct } from "@/types";

// Formateador de moneda compartido y persistente en memoria para optimizar el rendimiento (evita recreación en cada render)
const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

interface CartSnapshot {
  items: { imageUrl: string }[];
  subtotal: number;
  totalQuantity: number;
}

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalActionType: "cart" | "buy" | "sellerWarning";
  product: SellerProduct;
  quantity: number;
  cartSnapshot: CartSnapshot | null;
  capturedHasItems: boolean;
  isPending: boolean;
  onConfirmBuyAndGoToCart: () => void;
  onConfirmBuy: () => void;
}

// ============================================================================
// Subcomponentes Presentacionales Internos (Dumb Components)
// ============================================================================

// ModalHeader: Renderiza el ícono circular y los textos principales (título y descripción) 
// adaptados al tipo de acción y al estado del carrito.
interface ModalHeaderProps {
  modalActionType: "cart" | "buy" | "sellerWarning";
  capturedHasItems: boolean;
}

function ModalHeader({ modalActionType, capturedHasItems }: ModalHeaderProps) {
  const isWarning = modalActionType === "sellerWarning";
  
  const title = isWarning
    ? "Vendedor distinto"
    : modalActionType === "cart"
      ? "¡Agregado al carrito!"
      : capturedHasItems
        ? "¡Agregado a tu pedido!"
        : "¡Iniciando tu orden de compra!";

  const description = isWarning
    ? "No es posible agregar a un mismo carrito productos de distintos vendedores. Terminá tu compra actual o vaciá el carrito para continuar."
    : modalActionType === "cart"
      ? "El producto ha sido sumado a tu carrito de compras temporal."
      : capturedHasItems
        ? "Como tenés otros productos en el carrito, te sugerimos revisarlo."
        : "Estamos configurando tu checkout de forma segura.";

  return (
    <div className="text-center mb-5">
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-3 ${isWarning ? "bg-red-50" : "bg-green-50"}`}>
        {isWarning ? (
          <ExclamationTriangleIcon className="h-10 w-10 text-red-500" aria-hidden="true" />
        ) : (
          <CheckCircleIcon className="h-10 w-10 text-green-500" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#1F2937] leading-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ProductSummary: Muestra una fila con la miniatura, el nombre y la cantidad (o el vendedor) 
// del producto que el usuario acaba de manipular.
interface ProductSummaryProps {
  product: SellerProduct;
  quantity: number;
  modalActionType: "cart" | "buy" | "sellerWarning";
}

function ProductSummary({ product, quantity, modalActionType }: ProductSummaryProps) {
  const isWarning = modalActionType === "sellerWarning";
  
  return (
    <div className={`flex items-center gap-3 sm:gap-4 rounded-xl bg-gray-50 p-3 sm:p-3.5 border border-gray-100 ${isWarning ? "mb-6" : "mb-3"}`}>
      <div className="relative h-20 w-20 sm:h-26 sm:w-26 overflow-hidden rounded-lg border border-gray-200 bg-white shrink-0">
        <Image
          src={product.images[0]?.imageUrl ?? "https://placehold.co/400x300?text=Sin+Imagen"}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-bold text-[#1F2937] truncate">{product.name}</p>
        <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5">
          {isWarning ? (
            <>Vendedor: <span className="font-semibold text-gray-900">{product.sellerName}</span></>
          ) : (
            <>Cantidad: {quantity} unidad{quantity > 1 ? "es" : ""}</>
          )}
        </p>
      </div>
    </div>
  );
}

// CartSnapshotPreview: Muestra un "pantallazo" del carrito actual, incluyendo miniaturas 
// apiladas de los otros productos y el subtotal acumulado.
interface CartSnapshotPreviewProps {
  product: SellerProduct;
  quantity: number;
  cartSnapshot: CartSnapshot | null;
  modalActionType: "cart" | "buy" | "sellerWarning";
}

function CartSnapshotPreview({ product, quantity, cartSnapshot, modalActionType }: CartSnapshotPreviewProps) {
  const isDirectBuy = modalActionType === "buy";
  const isWarning = modalActionType === "sellerWarning";

  // Si es compra directa ("buy"), la acción de agregar al carrito aún no se ejecutó,
  // por lo que debemos sumar manualmente el producto actual al snapshot anterior.
  // Si ya es tipo "cart" o "sellerWarning", no sumamos nada nuevo.
  const totalQuantity = isDirectBuy
    ? (cartSnapshot?.totalQuantity || 0) + quantity
    : (cartSnapshot?.totalQuantity || 0);

  const subtotal = isDirectBuy
    ? (cartSnapshot?.subtotal || 0) + (product.price * quantity)
    : (cartSnapshot?.subtotal || 0);

  const formattedSubtotal = currencyFormatter.format(subtotal);
  const currentProductImageUrl = product.images[0]?.imageUrl;

  // Filtramos la imagen duplicada solo si la acción fue "cart" (el producto se agregó exitosamente)
  const otherItems = cartSnapshot ? [...cartSnapshot.items] : [];
  if (!isDirectBuy && !isWarning && currentProductImageUrl) {
    const idx = otherItems.findIndex(item => item.imageUrl === currentProductImageUrl);
    if (idx !== -1) {
      otherItems.splice(idx, 1);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-gray-100 shadow-sm mb-6 flex-wrap gap-2">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Miniaturas Apiladas */}
        <div className="flex -space-x-3 sm:-space-x-4">
          {/* Producto Reciente (Solo si NO es advertencia) */}
          {!isWarning && (
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm z-20">
              <Image
                src={product.images[0]?.imageUrl ?? "https://placehold.co/400x300?text=Sin+Imagen"}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          {/* Productos en Carrito (Capas inferiores) */}
          {otherItems.slice(0, 3).map((item, idx) => (
            <div key={idx} className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm" style={{ zIndex: 10 - idx }}>
              <Image
                src={item.imageUrl}
                alt="Producto en carrito"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
          {/* Indicador de exceso */}
          {otherItems.length > 3 && (
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-white bg-gray-50 text-[10px] sm:text-xs font-bold text-gray-600 shadow-sm" style={{ zIndex: 5 }}>
              +{otherItems.length - 3}
            </div>
          )}
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide hidden xs:inline">
          En Carrito
        </span>
      </div>
      {/* Total Actualizado */}
      <div className="text-right">
        <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium mb-0.5">Subtotal ({totalQuantity})</p>
        <p className="text-xs sm:text-sm font-extrabold text-[#1F2937]">
          {formattedSubtotal}
        </p>
      </div>
    </div>
  );
}

// ModalActions: Grupo de botones de acción condicionales (ej. seguir comprando, ir a pagar, 
// o confirmar advertencia) con soporte para estados de carga e interactividad.
interface ModalActionsProps {
  modalActionType: "cart" | "buy" | "sellerWarning";
  capturedHasItems: boolean;
  isPending: boolean;
  formattedPrice: string;
  onClose: () => void;
  onConfirmBuyAndGoToCart: () => void;
  onConfirmBuy: () => void;
}

function ModalActions({
  modalActionType,
  capturedHasItems,
  isPending,
  formattedPrice,
  onClose,
  onConfirmBuyAndGoToCart,
  onConfirmBuy,
}: ModalActionsProps) {
  if (modalActionType === "sellerWarning") {
    return (
      <div className="space-y-2.5">
        <button
          onClick={onConfirmBuyAndGoToCart}
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
              Agregar de todos modos e ir al carrito
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-[#6B7280] transition hover:bg-gray-50 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          Entendido
        </button>
      </div>
    );
  }

  if (modalActionType === "cart") {
    return (
      <div className="space-y-2.5">
        <Link
          href="/cart"
          className="flex w-full items-center justify-center rounded-xl bg-[#FC7A1E] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99]"
        >
          Ver mi Carrito
        </Link>
        <button
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-[#6B7280] transition hover:bg-gray-50 active:scale-[0.99]"
        >
          Seguir comprando
        </button>
      </div>
    );
  }

  // Caso: modalActionType === "buy" (compra directa)
  return (
    <div className="space-y-2.5">
      {capturedHasItems ? (
        <button
          onClick={onConfirmBuyAndGoToCart}
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
          onClick={onConfirmBuy}
          disabled={isPending}
          className="flex w-full items-center justify-center rounded-xl bg-[#485696] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Procesando...
            </>
          ) : (
            <>Proceder al Pago ({formattedPrice})</>
          )}
        </button>
      )}
      <button
        onClick={onClose}
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-[#6B7280] transition hover:bg-gray-50 active:scale-[0.99]"
      >
        Cancelar
      </button>
    </div>
  );
}

// ============================================================================
// Componente Principal
// ============================================================================

// AddToCartModal: Componente principal que unifica la estructura, inyecta el portal 
// y distribuye las props hacia los subcomponentes correspondientes.
export default function AddToCartModal({
  isOpen,
  onClose,
  modalActionType,
  product,
  quantity,
  cartSnapshot,
  capturedHasItems,
  isPending,
  onConfirmBuyAndGoToCart,
  onConfirmBuy,
}: AddToCartModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  const formattedPrice = currencyFormatter.format(product.price * quantity);

  return createPortal(
    <div className="fixed inset-0 z-9999 pointer-events-auto flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        
        {/* Cabecera del modal */}
        <ModalHeader modalActionType={modalActionType} capturedHasItems={capturedHasItems} />

        {/* Resumen del producto */}
        <ProductSummary product={product} quantity={quantity} modalActionType={modalActionType} />

        {/* Pantallazo del carrito actual (siempre que el carrito no estuviera vacío) */}
        {capturedHasItems && (
          <CartSnapshotPreview
            product={product}
            quantity={quantity}
            cartSnapshot={cartSnapshot}
            modalActionType={modalActionType}
          />
        )}

        {/* Botonera de acciones del modal */}
        <ModalActions
          modalActionType={modalActionType}
          capturedHasItems={capturedHasItems}
          isPending={isPending}
          formattedPrice={formattedPrice}
          onClose={onClose}
          onConfirmBuyAndGoToCart={onConfirmBuyAndGoToCart}
          onConfirmBuy={onConfirmBuy}
        />

      </div>
    </div>,
    document.body
  );
}
