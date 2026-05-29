"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition, useState } from "react";
import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CATEGORIES = [
  { value: "", label: "Todas las categorías" },
  { value: "MONITOR", label: "Monitores" },
  { value: "GPU", label: "Placas de Video" },
  { value: "CPU", label: "Procesadores" },
  { value: "STORAGE", label: "Almacenamiento" },
  { value: "RAM", label: "Memoria RAM" },
  { value: "MOTHERBOARD", label: "Motherboards" },
];

const CONDITIONS = [
  { value: "", label: "Cualquier condición" },
  { value: "NEW", label: "Nuevo" },
  { value: "USED", label: "Usado" },
  { value: "REFURBISHED", label: "Reacondicionado" },
];

const SORT_OPTIONS = [
  { value: "", label: "Ordenar por" },
  { value: "ascendingPrice", label: "Precio: menor a mayor" },
  { value: "descendingPrice", label: "Precio: mayor a menor" },
];

const SELECT_CLASS =
  "rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-[#1F2937] shadow-sm outline-none ring-0 transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(
    // Mantener abierto si hay algún filtro avanzado activo
    !!(
      searchParams.get("condition") ||
      searchParams.get("minPrice") ||
      searchParams.get("maxPrice") ||
      searchParams.get("sort")
    )
  );

  // ── Utilidad central: actualiza uno o varios params a la vez ─────────────────
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    // Al cambiar cualquier filtro, siempre volvemos a la página 1
    params.delete("page");

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  // ── Buscador con debounce (300ms) ────────────────────────────────────────────
  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams({ query: term });
  }, 300);

  // ── Rango de precio con debounce ─────────────────────────────────────────────
  const handleMinPrice = useDebouncedCallback((value: string) => {
    updateParams({ minPrice: value });
  }, 400);

  const handleMaxPrice = useDebouncedCallback((value: string) => {
    updateParams({ maxPrice: value });
  }, 400);

  // ── ¿Hay filtros avanzados activos? ──────────────────────────────────────────
  const hasActiveFilters =
    !!searchParams.get("condition") ||
    !!searchParams.get("minPrice") ||
    !!searchParams.get("maxPrice") ||
    !!searchParams.get("sort") ||
    !!searchParams.get("category") ||
    !!searchParams.get("query");

  const clearAllFilters = () => {
    startTransition(() => {
      replace(pathname);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Fila principal: buscador + categoría + botón filtros ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Input de búsqueda */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </span>
          <input
            id="product-search"
            type="search"
            placeholder="Buscar productos, marcas..."
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("query")?.toString()}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-[#1F2937] placeholder-[#6B7280] shadow-sm outline-none ring-0 transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20"
          />
          {isPending && (
            <span
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4 animate-spin text-[#485696]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          )}
        </div>

        {/* Selector de categoría */}
        <select
          id="category-filter"
          key={searchParams.get("category") ?? ""}
          defaultValue={searchParams.get("category")?.toString() || ""}
          onChange={(e) => updateParams({ category: e.target.value })}
          className={`${SELECT_CLASS} sm:w-52`}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Botón filtros avanzados */}
        <button
          id="toggle-advanced-filters"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          aria-controls="advanced-filters"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            showAdvanced
              ? "border-[#485696] bg-[#485696]/5 text-[#485696]"
              : "border-gray-200 bg-white text-[#6B7280] hover:border-[#485696]/40 hover:text-[#485696]"
          }`}
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
          Filtros
          {(searchParams.get("condition") ||
            searchParams.get("minPrice") ||
            searchParams.get("maxPrice") ||
            searchParams.get("sort")) && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#485696] text-[10px] font-bold text-white">
              {
                [
                  searchParams.get("condition"),
                  searchParams.get("minPrice") || searchParams.get("maxPrice"),
                  searchParams.get("sort"),
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>
      </div>

      {/* ── Fila de filtros avanzados (colapsable) ── */}
      {showAdvanced && (
        <div
          id="advanced-filters"
          className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
        >
          {/* Condición */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label
              htmlFor="condition-filter"
              className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
            >
              Condición
            </label>
            <select
              id="condition-filter"
              key={searchParams.get("condition") ?? ""}
              defaultValue={searchParams.get("condition")?.toString() || ""}
              onChange={(e) => updateParams({ condition: e.target.value })}
              className={SELECT_CLASS}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Precio mínimo */}
          <div className="flex min-w-[130px] flex-col gap-1">
            <label
              htmlFor="min-price"
              className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
            >
              Precio mín. (ARS)
            </label>
            <input
              id="min-price"
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              defaultValue={searchParams.get("minPrice")?.toString() || ""}
              onChange={(e) => handleMinPrice(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-[#1F2937] shadow-sm outline-none transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20"
            />
          </div>

          {/* Precio máximo */}
          <div className="flex min-w-[130px] flex-col gap-1">
            <label
              htmlFor="max-price"
              className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
            >
              Precio máx. (ARS)
            </label>
            <input
              id="max-price"
              type="number"
              min={0}
              step={1000}
              placeholder="Sin límite"
              defaultValue={searchParams.get("maxPrice")?.toString() || ""}
              onChange={(e) => handleMaxPrice(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-[#1F2937] shadow-sm outline-none transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20"
            />
          </div>

          {/* Ordenamiento */}
          <div className="flex min-w-[200px] flex-col gap-1">
            <label
              htmlFor="sort-filter"
              className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]"
            >
              Ordenar
            </label>
            <select
              id="sort-filter"
              key={searchParams.get("sort") ?? ""}
              defaultValue={searchParams.get("sort")?.toString() || ""}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className={SELECT_CLASS}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button
              id="clear-filters"
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1.5 self-end rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}