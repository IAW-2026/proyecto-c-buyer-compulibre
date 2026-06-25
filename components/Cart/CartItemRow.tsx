import Image from "next/image";
import Link from "next/link";
import { TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { HydratedCartItem } from "@/app/cart/types";
import { formatCondition, formatCurrency } from "@/lib/formatters";

interface CartItemRowProps {
  item: HydratedCartItem;
  isPending: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function CartItemRow({ item, isPending, onQuantityChange, onRemoveItem }: CartItemRowProps) {
  const maxQuantity = Math.min(item.stock, 10);

  return (
    <div className="py-4.5 flex flex-col sm:flex-row gap-4 first:pt-0 last:pb-0">
      <Link
        href={`/products/${item.externalProductId}`}
        className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 self-center sm:self-start flex items-center justify-center"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <PhotoIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" aria-hidden="true" />
        )}
      </Link>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
          <div className="flex-1">
            <Link href={`/products/${item.externalProductId}`}>
              <h4 className="text-lg sm:text-xl font-bold text-[#1F2937] line-clamp-2 leading-snug hover:text-[#485696] transition-colors">
                {item.productName}
              </h4>
            </Link>
          </div>

          <div className="flex flex-col sm:items-end shrink-0 sm:text-right mt-1 sm:mt-4">
            <span className="text-xl font-extrabold text-[#1F2937]">
              {formatCurrency(Number(item.cachedPrice) * item.quantity)}
            </span>
            <p className="text-[10px] text-green-600 font-semibold mt-1">
              Por unidad: {formatCurrency(Number(item.cachedPrice))} c/u
            </p>
          </div>
        </div>

        <div className="mt-2.5 mb-3.5 flex flex-col gap-1.5 text-[11px] text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
            <span>Condición: <span className="font-semibold text-gray-700">{formatCondition(item.condition)}</span></span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wide">
              Cantidad:
            </span>
            <div className="relative">
              <select
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.id, Number(e.target.value))}
                disabled={item.stock === 0}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1 pl-2.5 pr-8 text-xs font-bold text-[#1F2937] outline-none focus:border-[#485696] focus:ring-1 focus:ring-[#485696] disabled:bg-gray-100 disabled:text-gray-400"
              >
                {item.stock === 0 ? (
                  <option value={0}>Sin Stock</option>
                ) : (
                  Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))
                )}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[9px] text-[#6B7280]">
                ▼
              </span>
            </div>
            {item.quantity === maxQuantity && maxQuantity > 0 && (
              <span className="text-[10px] font-bold text-red-500">Límite de compra</span>
            )}
          </div>

          <button
            onClick={() => onRemoveItem(item.id)}
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
}
