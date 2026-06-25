import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function CartEmptyState() {
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
