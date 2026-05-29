"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition } from "react";

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "MONITOR", label: "Monitores" },
  { value: "GPU", label: "Placas de Video" },
  { value: "CPU", label: "Procesadores" },
  { value: "STORAGE", label: "Almacenamiento" },
  { value: "RAM", label: "Memoria RAM" },
  { value: "MOTHERBOARD", label: "Motherboards" },
];

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  // 1. Manejo de la actualización de URL (reutilizable para search y category)
  const updateParams = (term: string, key: "search" | "category") => {
    const params = new URLSearchParams(searchParams);
    
    // Al cambiar filtros, volver siempre a la página 1
    params.delete("page");

    if (term) {
      params.set(key, term);
    } else {
      params.delete(key);
    }

    // Usamos startTransition para mostrar el estado "Buscando..."
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  // 2. Aplicamos el Debounce oficial del tutorial de Next.js (400ms)
  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams(term, "search");
  }, 300);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Input de búsqueda */}
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          id="product-search"
          type="search"
          placeholder="Buscar productos..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get("search")?.toString()} 
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-[#1F2937] placeholder-[#6B7280] shadow-sm outline-none ring-0 transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20"
        />
        {/* Indicador de carga moderno dentro del input */}
        {isPending && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center" aria-hidden="true">
            <svg className="h-4 w-4 animate-spin text-[#485696]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        )}
      </div>

      {/* Selector de categoría */}
      <select
        id="category-filter"
        defaultValue={searchParams.get("category")?.toString() || ""}
        onChange={(e) => updateParams(e.target.value, "category")}
        className="rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-[#1F2937] shadow-sm outline-none ring-0 transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20 sm:w-48"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}