import ProductCard from "@/components/ProductCard";
import { SellerProductSummary } from "@/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface ProductGridProps {
  products: SellerProductSummary[];
}

/** Server Component: renderiza la grilla de tarjetas o el estado vacío. */
export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <MagnifyingGlassIcon className="h-12 w-12 text-[#6B7280]/50" aria-hidden="true" />
        <p className="text-lg font-semibold text-[#1F2937]">
          No encontramos productos
        </p>
        <p className="text-sm text-[#6B7280]">
          Probá con otro término de búsqueda o quitá los filtros.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Listado de productos"
    >
      {products.map((product, index) => (
        <li key={product.productId}>
          <ProductCard product={product} priority={index === 0} />
        </li>
      ))}
    </ul>
  );
}
