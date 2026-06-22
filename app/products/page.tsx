import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/services/seller-app";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import ProductSort from "@/components/ProductSort";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Productos — CompuLibre",
  description:
    "Explorá nuestra selección de hardware: monitores, placas de video, procesadores, RAM, almacenamiento y más.",
};

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  search?: string;
  category?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams; // Next.js 15+ requiere await

  // Sanitizar parámetros
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search ?? "";
  const category = params.category ?? "";
  const condition = params.condition as "NEW" | "USED" | "REFURBISHED" | undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = params.sort as "ascendingPrice" | "descendingPrice" | undefined;

  // Resolución de los productos
  const productsResult = await getProducts({
    search,
    category,
    condition,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const { products, pagination, facets } = productsResult;
  const { totalProducts: total, totalPages } = pagination;
  const maxPriceFacet = facets?.priceRange?.max;

  // Objeto plano para pasarlo a Pagination y que reconstruya URLs
  const currentParams: Record<string, string> = {};
  if (search) currentParams.search = search;
  if (category) currentParams.category = category;
  if (condition) currentParams.condition = condition;
  if (minPrice !== undefined) currentParams.minPrice = String(minPrice);
  if (maxPrice !== undefined) currentParams.maxPrice = String(maxPrice);
  if (sort) currentParams.sort = sort;

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      
      {/* Layout de 2 columnas para Desktop, Stack para Mobile */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        
        {/* Sidebar (Filtros) - Visible solo en Desktop */}
        <aside className="hidden lg:block w-full lg:w-64 shrink-0">
          <Suspense fallback={<FiltersSkeleton />}>
            <ProductFilters maxAllowedPrice={maxPriceFacet} />
          </Suspense>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Encabezado y Ordenamiento */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2937]">
                {search ? `Resultados para "${search}"` : "Productos"}
              </h1>
              <p className="mt-1.5 text-sm text-[#6B7280]">
                {total === 0
                  ? "No se encontraron resultados"
                  : `${total} producto${total !== 1 ? "s" : ""} disponible${total !== 1 ? "s" : ""}`}
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-end">
              <Suspense fallback={<div className="h-10 w-40 bg-gray-100 animate-pulse rounded-lg" />}>
                <ProductSort />
              </Suspense>
              <div className="lg:hidden">
                <Suspense fallback={<div className="h-10 w-10 bg-gray-100 animate-pulse rounded-lg" />}>
                  <ProductFilters isMobileView maxAllowedPrice={maxPriceFacet} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Grilla de productos */}
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Sin resultados</h3>
              <p className="mt-1 text-sm text-gray-500">Intenta ajustando o eliminando los filtros.</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-10 border-t border-gray-100 pt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                searchParams={currentParams}
              />
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}

/** Esqueleto para el Sidebar de Filtros */
function FiltersSkeleton() {
  return (
    <div className="hidden lg:flex flex-col gap-8 animate-pulse">
      <div className="h-6 w-24 bg-gray-200 rounded" />
      
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-px w-full bg-gray-100" />
      
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-5 w-5 bg-gray-200 rounded-full" />
              <div className="h-5 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
