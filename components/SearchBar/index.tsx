"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition, useState, useRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// ─── Constantes ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "MONITOR", label: "Monitores" },
  { value: "GPU", label: "Placas de Video" },
  { value: "CPU", label: "Procesadores" },
  { value: "STORAGE", label: "Almacenamiento" },
  { value: "RAM", label: "Memoria RAM" },
  { value: "MOTHERBOARD", label: "Motherboards" },
];

const CONDITIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "USED", label: "Usado" },
  { value: "REFURBISHED", label: "Reacondicionado" },
];

const SORT_OPTIONS = [
  { value: "", label: "Ordenar por" },
  { value: "ascendingPrice", label: "Precio: menor a mayor" },
  { value: "descendingPrice", label: "Precio: mayor a menor" },
];

// ─── Sub-componente: Checkbox con estilo circular ─────────────────────────────
// Semánticamente correcto (checkbox = selección múltiple / toggle).
// Visualmente redondeado mediante appearance-none + clases manuales.

interface RoundCheckboxProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

function RoundCheckbox({ id, name, value, checked, onChange, label }: RoundCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition hover:bg-gray-50"
    >
      {/* Checkbox invisible + overlay circular accesible */}
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={`h-4 w-4 rounded-full border-2 transition-all ${
            checked
              ? "border-[#485696] bg-[#485696]"
              : "border-gray-300 bg-white"
          }`}
        />
        {checked && (
          <span
            aria-hidden="true"
            className="absolute h-1.5 w-1.5 rounded-full bg-white"
          />
        )}
      </span>
      <span className={`font-medium ${checked ? "text-[#485696]" : "text-[#1F2937]"}`}>
        {label}
      </span>
    </label>
  );
}

// ─── Sub-componente: Dropdown de filtro ───────────────────────────────────────
// Usa name="search-filters" para accordion nativo HTML5 (Chrome 120+, Firefox 130+).
// El useEffect con mousedown actúa de fallback para navegadores sin soporte.

interface FilterDropdownProps {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}

function FilterDropdown({ label, active, children }: FilterDropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (detailsRef.current && !detailsRef.current.contains(e.target as Node)) {
        detailsRef.current.removeAttribute("open");
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative">
      <details
        ref={detailsRef}
        // name= permite accordion nativo: al abrir uno, el navegador cierra los demás.
        name="search-filters"
        className="group [&_summary::-webkit-details-marker]:hidden"
      >
        <summary
          className={`flex cursor-pointer select-none list-none items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            active
              ? "border-[#485696] bg-[#485696]/8 text-[#485696]"
              : "border-gray-200 bg-white text-[#1F2937] hover:border-[#485696]/50 hover:text-[#485696]"
          }`}
        >
          {active && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#485696]" />
          )}
          {label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="ml-0.5 size-3.5 transition-transform duration-200 group-open:rotate-180"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </summary>

        <div className="absolute left-0 top-full z-50 mt-2">
          <div className="min-w-72 rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5">
            {children}
          </div>
        </div>
      </details>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Rango de precio — estado local para validación visual ────────────────
  const [localMin, setLocalMin] = useState(searchParams.get("minPrice") || "");
  const [localMax, setLocalMax] = useState(searchParams.get("maxPrice") || "");
  const priceRangeInvalid =
    localMin !== "" && localMax !== "" && Number(localMin) > Number(localMax);

  // ── Utilidad central ─────────────────────────────────────────────────────
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
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

  // ── Debounce: búsqueda de texto ──────────────────────────────────────────
  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams({ query: term });
  }, 300);

  // ── Debounce: rango de precio (solo actualiza URL si el rango es válido) ─
  const debouncedPriceUpdate = useDebouncedCallback(
    (min: string, max: string) => {
      if (min !== "" && max !== "" && Number(min) > Number(max)) return;
      updateParams({ minPrice: min, maxPrice: max });
    },
    400
  );

  const handleMinPrice = (value: string) => {
    setLocalMin(value);
    debouncedPriceUpdate(value, localMax);
  };

  const handleMaxPrice = (value: string) => {
    setLocalMax(value);
    debouncedPriceUpdate(localMin, value);
  };

  // ── Estado de filtros activos ────────────────────────────────────────────
  const hasCondition = !!searchParams.get("condition");
  const hasPrice = !!searchParams.get("minPrice") || !!searchParams.get("maxPrice");
  const hasSort = !!searchParams.get("sort");
  const hasCategory = !!searchParams.get("category");
  const hasAnyFilter =
    hasCondition || hasPrice || hasSort || hasCategory || !!searchParams.get("query");

  const clearAllFilters = () => {
    setLocalMin("");
    setLocalMax("");
    startTransition(() => {
      replace(pathname);
    });
  };

  // ── Toggle helper para checkboxes que actúan como toggles únicos ─────────
  const toggleSingleValue = (param: string, value: string) => {
    const current = searchParams.get(param);
    updateParams({ [param]: current === value ? "" : value });
  };

  // ── Sección de filtros inline ────────────────────────────────────────────
  const inlineFilters = (
    <div className="flex flex-wrap items-center gap-2">

      {/* Dropdown: Condición */}
      <FilterDropdown label="Condición" active={hasCondition}>
        <div className="p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
            Estado del producto
          </p>
          <ul className="space-y-0.5">
            {CONDITIONS.map((cond) => (
              <li key={cond.value}>
                <RoundCheckbox
                  id={`condition-${cond.value}`}
                  name="condition-filter"
                  value={cond.value}
                  checked={searchParams.get("condition") === cond.value}
                  onChange={() => toggleSingleValue("condition", cond.value)}
                  label={cond.label}
                />
              </li>
            ))}
          </ul>
          {hasCondition && (
            <button
              onClick={() => updateParams({ condition: "" })}
              className="mt-2 w-full text-center text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#485696]"
            >
              Limpiar
            </button>
          )}
        </div>
      </FilterDropdown>

      {/* Dropdown: Precio */}
      <FilterDropdown label="Precio" active={hasPrice}>
        <div className="p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
            Rango de precio (ARS)
          </p>
          <div className="flex flex-col gap-2">
            {/* Mínimo */}
            <div className="flex flex-col gap-1">
              <label htmlFor="min-price" className="text-[11px] font-medium text-[#6B7280]">
                Precio mínimo
              </label>
              <div
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 ${
                  priceRangeInvalid ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <span className="shrink-0 text-xs font-medium text-[#6B7280]">$</span>
                <input
                  id="min-price"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="0"
                  value={localMin}
                  onChange={(e) => handleMinPrice(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            {/* Máximo */}
            <div className="flex flex-col gap-1">
              <label htmlFor="max-price" className="text-[11px] font-medium text-[#6B7280]">
                Precio máximo
              </label>
              <div
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 ${
                  priceRangeInvalid ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <span className="shrink-0 text-xs font-medium text-[#6B7280]">$</span>
                <input
                  id="max-price"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="Sin límite"
                  value={localMax}
                  onChange={(e) => handleMaxPrice(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Advertencia de rango inválido */}
          {priceRangeInvalid && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              El mínimo no puede superar al máximo
            </p>
          )}

          {hasPrice && !priceRangeInvalid && (
            <button
              onClick={() => {
                setLocalMin("");
                setLocalMax("");
                updateParams({ minPrice: "", maxPrice: "" });
              }}
              className="mt-3 w-full text-center text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#485696]"
            >
              Limpiar
            </button>
          )}
        </div>
      </FilterDropdown>

      {/* Dropdown: Categoría */}
      <FilterDropdown label="Categoría" active={hasCategory}>
        <div className="p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
            Tipo de producto
          </p>
          <ul className="space-y-0.5">
            {CATEGORIES.map((cat) => (
              <li key={cat.value}>
                <RoundCheckbox
                  id={`category-${cat.value}`}
                  name="category-filter"
                  value={cat.value}
                  checked={searchParams.get("category") === cat.value}
                  onChange={() => toggleSingleValue("category", cat.value)}
                  label={cat.label}
                />
              </li>
            ))}
          </ul>
          {hasCategory && (
            <button
              onClick={() => updateParams({ category: "" })}
              className="mt-2 w-full text-center text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#485696]"
            >
              Limpiar
            </button>
          )}
        </div>
      </FilterDropdown>

      {/* Separador visual */}
      <div className="hidden h-5 w-px bg-gray-200 sm:block" />

      {/* Sort: select inline */}
      <select
        id="sort-filter"
        key={searchParams.get("sort") ?? ""}
        defaultValue={searchParams.get("sort")?.toString() || ""}
        onChange={(e) => updateParams({ sort: e.target.value })}
        className={`h-9 rounded-lg border px-3 text-sm font-medium outline-none transition ${
          hasSort
            ? "border-[#485696] bg-[#485696]/8 text-[#485696]"
            : "border-gray-200 bg-white text-[#1F2937] hover:border-[#485696]/50"
        }`}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Limpiar todo */}
      {hasAnyFilter && (
        <button
          id="clear-filters"
          onClick={clearAllFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
        >
          <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Limpiar todo
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ── Fila principal: buscador ── */}
      <div className="flex items-center gap-3">
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

        {/* Botón "Filtros" solo en mobile */}
        <button
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-[#1F2937] transition hover:border-[#485696]/50 sm:hidden"
          onClick={() => setShowMobileFilters((v) => !v)}
          aria-expanded={showMobileFilters}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
          Filtros
          {hasAnyFilter && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#485696] text-[10px] font-bold text-white">
              {[hasCondition, hasPrice, hasSort, hasCategory].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* ── Filtros inline — desktop (siempre visible) ── */}
      <div className="hidden sm:block">{inlineFilters}</div>

      {/* ── Filtros en mobile (colapsable) ── */}
      {showMobileFilters && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:hidden">
          {inlineFilters}
        </div>
      )}
    </div>
  );
}