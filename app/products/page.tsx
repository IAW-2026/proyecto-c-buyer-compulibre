import { Suspense } from "react";
import type { Metadata } from "next";
import { getMockProducts } from "@/lib/mocks/seller-app";
import ProductGrid from "@/components/ProductGrid";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { auth } from "@clerk/nextjs/server";
import { getBuyerProfile } from "@/lib/db/profile";

import ProfileRedirector from "@/components/ProfileRedirector";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos — CompuLibre",
  description:
    "Explorá nuestra selección de hardware: monitores, placas de video, procesadores, RAM, almacenamiento y más.",
};

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  search?: string;
  category?: string;
  page?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Verificación de BuyerProfile para usuarios autenticados
  const { userId } = await auth();
  if (userId) {
    const profile = await getBuyerProfile();
    if (!profile) {
      return <ProfileRedirector />;
    }
  }

  // Next.js 15+: searchParams es una Promise, hay que awaitearlo
  const params = await searchParams;

  // Sanitizar page: debe ser un entero >= 1
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search ?? "";
  const category = params.category ?? "";

  const { data: products, total } = await getMockProducts({
    search,
    category,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Objeto plano para pasarlo a Pagination y que reconstruya URLs
  const currentParams: Record<string, string> = {};
  if (search) currentParams.search = search;
  if (category) currentParams.category = category;

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center animate-pulse">
      <div className="h-10 flex-1 rounded-xl bg-gray-200" />
      <div className="h-10 w-full rounded-xl bg-gray-200 sm:w-48" />
    </div>
  );
}
