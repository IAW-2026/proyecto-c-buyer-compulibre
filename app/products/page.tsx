import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/mocks/seller-app";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { auth } from "@clerk/nextjs/server";
import { getBuyerProfile } from "@/lib/db/profile";
import ProfileRedirector from "@/components/ProfileRedirector";

export const metadata: Metadata = {
  title: "Productos — CompuLibre",
  description:
    "Explorá nuestra selección de hardware: monitores, placas de video, procesadores, RAM, almacenamiento y más.",
};

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  query?: string;
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
  const { userId } = await auth();
  const params = await searchParams; // Next.js 15+ requiere await

  // Sanitizar parámetros
  const page = Math.max(1, Number(params.page) || 1);
  const query = params.query ?? "";
  const category = params.category ?? "";
  const condition = params.condition as "NEW" | "USED" | "REFURBISHED" | undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = params.sort as "ascendingPrice" | "descendingPrice" | undefined;

  // Resolución paralela del perfil y los productos
  const [profile, productsResult] = await Promise.all([
    userId ? getBuyerProfile() : Promise.resolve(null),
    getProducts({
      query,
      category,
      condition,
      minPrice,
      maxPrice,
      sort,
      page,
      limit: PAGE_SIZE,
    }),
  ]);

  if (userId && !profile) {
    return <ProfileRedirector />;
  }

  const { products, pagination } = productsResult;

  const { totalProducts: total, totalPages } = pagination;

  // Objeto plano para pasarlo a Pagination y que reconstruya URLs
  const currentParams: Record<string, string> = {};
  if (query) currentParams.query = query;
  if (category) currentParams.category = category;
  if (condition) currentParams.condition = condition;
  if (minPrice !== undefined) currentParams.minPrice = String(minPrice);
  if (maxPrice !== undefined) currentParams.maxPrice = String(maxPrice);
  if (sort) currentParams.sort = sort;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">
          Productos
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {total === 0
            ? "Sin resultados"
            : `${total} producto${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* SearchBar — Client Component, requiere Suspense */}
      <div className="mb-6">
        <Suspense fallback={<SearchBarSkeleton />}>
          <SearchBar />
        </Suspense>
      </div>

      {/* Grilla de productos */}
      <ProductGrid products={products} />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            page={page}
            totalPages={totalPages}
            searchParams={currentParams}
          />
        </div>
      )}
    </main>
  );
}

/** Esqueleto de SearchBar para el fallback de Suspense */
function SearchBarSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {/* Fila 1: buscador */}
      <div className="h-10 w-full rounded-xl bg-gray-200" />
      {/* Fila 2: pills de filtros */}
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-gray-200" />
        <div className="h-9 w-20 rounded-lg bg-gray-200" />
        <div className="h-9 w-28 rounded-lg bg-gray-200" />
        <div className="ml-auto h-9 w-32 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
