"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";

const CATEGORIES = [
  "Todas",
  "Monitores",
  "Placas de Video",
  "Procesadores",
  "Almacenamiento",
  "Memoria RAM",
  "Motherboards",
];

/**
 * Client Component: lee y actualiza ?search y ?category en la URL.
 * IMPORTANTE: el componente padre debe envolverlo en <Suspense> porque
 * useSearchParams() provoca CSR bailout sin él.
 */
const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const category = searchParams.get("category") ?? "";

  // Estado local para el input: se actualiza en cada tecla
  // pero la URL solo se actualiza tras DEBOUNCE_MS ms de inactividad
  const [inputValue, setInputValue] = useState(
    searchParams.get("search") ?? ""
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Actualiza la URL preservando los parámetros existentes */
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      // Al cambiar filtros, volver siempre a la página 1
      params.delete("page");

      startTransition(() => {
        router.push(`/products?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  /** Maneja el cambio en el input con debounce */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // actualiza la UI inmediatamente

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value });
    }, DEBOUNCE_MS);
  };

  return (
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
            aria-hidden="true"
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
          placeholder="Buscar productos..."
          value={inputValue}
          onChange={handleSearchChange}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-[#1F2937] placeholder-[#6B7280] shadow-sm outline-none ring-0 transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20"
          aria-label="Buscar productos"
        />
      </div>

      {/* Selector de categoría */}
      <select
        id="category-filter"
        value={category}
        onChange={(e) =>
          updateParams({
            category: e.target.value === "Todas" ? "" : e.target.value,
          })
        }
        className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-[#1F2937] shadow-sm outline-none ring-0 transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20 sm:w-48"
        aria-label="Filtrar por categoría"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat === "Todas" ? "" : cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Indicador de carga */}
      {isPending && (
        <span className="text-xs text-[#6B7280] sm:w-16" aria-live="polite">
          Buscando…
        </span>
      )}
    </div>
  );
}
