import { formatCurrency } from "@/lib/formatters";
import { BuyerOrderItem } from "@prisma/client";

interface OrderProductsListProps {
  items: BuyerOrderItem[];
  subtotal: number;
  totalAmount: number;
}

export default function OrderProductsList({ items, subtotal, totalAmount }: OrderProductsListProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1F2937]">
          Productos
        </h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1F2937] line-clamp-2">
                {item.productName}
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {item.quantity} × {formatCurrency(item.unitPrice.toNumber())}
              </p>
            </div>
            <span className="shrink-0 text-sm font-extrabold text-[#1F2937]">
              {formatCurrency(Number(item.unitPrice) * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      {/* Totales */}
      <div className="border-t border-gray-100 px-6 py-4 space-y-2">
        <div className="flex justify-between text-sm text-[#6B7280]">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#6B7280]">
          <span>Envío</span>
          <span>
            {totalAmount - subtotal === 0
              ? "Gratis"
              : formatCurrency(totalAmount - subtotal)}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-3">
          <span className="font-bold text-[#1F2937]">Total</span>
          <span className="text-lg font-extrabold text-[#1F2937]">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
