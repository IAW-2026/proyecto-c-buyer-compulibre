import ProductCard from "@/components/ProductCard";
import { SellerProduct } from "@/types";

interface ProductGridProps {
  products: SellerProduct[];
}

/** Server Component: renderiza la grilla de tarjetas o el estado vacío. */
export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="text-4xl" aria-hidden="true">
          🔍
        </span>
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
        <li key={product.id}>
          <ProductCard product={product} priority={index === 0} />
        </li>
      ))}
    </ul>
  );
}
