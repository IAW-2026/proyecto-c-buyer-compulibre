"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition, useState } from "react";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";

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
      className="flex cursor-pointer items-center gap-3 rounded-lg py-1.5 transition hover:bg-gray-50/50"
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
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
          className={`h-5 w-5 rounded-full border-2 transition-all ${
            checked ? "border-[#485696] bg-[#485696]" : "border-gray-300 bg-white"
          }`}
        />
        {checked && (
          <span aria-hidden="true" className="absolute h-2 w-2 rounded-full bg-white" />
        )}
      </span>
      <span className={`text-sm ${checked ? "font-semibold text-[#485696]" : "text-gray-700"}`}>
        {label}
      </span>
    </label>
  );
}

export default function ProductFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showMobile, setShowMobile] = useState(false);

  const [localMin, setLocalMin] = useState(searchParams.get("minPrice") || "");
  const [localMax, setLocalMax] = useState(searchParams.get("maxPrice") || "");
  const priceRangeInvalid =
    localMin !== "" && localMax !== "" && Number(localMin) > Number(localMax);

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

  const debouncedPriceUpdate = useDebouncedCallback((min: string, max: string) => {
    if (min !== "" && max !== "" && Number(min) > Number(max)) return;
    updateParams({ minPrice: min, maxPrice: max });
  }, 400);

  const handleMinPrice = (value: string) => {
    setLocalMin(value);
    debouncedPriceUpdate(value, localMax);
  };

  const handleMaxPrice = (value: string) => {
    setLocalMax(value);
    debouncedPriceUpdate(localMin, value);
  };

  const hasCondition = !!searchParams.get("condition");
  const hasPrice = !!searchParams.get("minPrice") || !!searchParams.get("maxPrice");
  const hasCategory = !!searchParams.get("category");
  const hasAnyFilter = hasCondition || hasPrice || hasCategory;

  const clearAllFilters = () => {
    setLocalMin("");
    setLocalMax("");
    
    const params = new URLSearchParams(searchParams);
    params.delete("condition");
    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  const toggleSingleValue = (param: string, value: string) => {
    const current = searchParams.get(param);
    updateParams({ [param]: current === value ? "" : value });
  };

  const FiltersContent = (
    <div className="space-y-8">
      {/* Header for desktop filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="text-sm font-medium text-[#FC7A1E] hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Categoría
        </h3>
        <ul className="space-y-2">
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
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Condición */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Condición
        </h3>
        <ul className="space-y-2">
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
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Precio */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Precio (ARS)
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Mínimo"
              value={localMin}
              onChange={(e) => handleMinPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min={0}
              placeholder="Máximo"
              value={localMax}
              onChange={(e) => handleMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696]"
            />
          </div>
          {priceRangeInvalid && (
            <p className="text-xs font-medium text-red-500">
              El mínimo no puede superar al máximo
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón Mobile para abrir filtros */}
      <button
        onClick={() => setShowMobile(!showMobile)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 lg:hidden"
      >
        <FunnelIcon className="h-5 w-5" />
        Filtros {hasAnyFilter && <span className="ml-1 rounded-full bg-[#FC7A1E] px-2 py-0.5 text-xs text-white">Activos</span>}
      </button>

      {/* Drawer / Sidebar contenedor */}
      <div
        className={`${
          showMobile ? "block" : "hidden"
        } mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:mt-0 lg:block lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none`}
      >
        {FiltersContent}
      </div>
      
      {/* Opacidad (Loading State) global sobre los filtros */}
      {isPending && (
        <div className="pointer-events-none fixed inset-0 z-10 bg-white/20 backdrop-blur-[1px] transition-all lg:hidden" />
      )}
    </>
  );
}