"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition, useState, useEffect, useCallback } from "react";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";

const CATEGORIES = [
  { value: "MONITOR", label: "Monitores" },
  { value: "GPU", label: "Placas de Video" },
  { value: "CPU", label: "Procesadores" },
  { value: "STORAGE", label: "Almacenamiento" },
  { value: "RAM", label: "Memoria RAM" },
  { value: "MOTHERBOARD", label: "Motherboards" },
  { value: "CASE", label: "Gabinetes" },
  { value: "PSU", label: "Fuentes" },
  { value: "COOLING", label: "Refrigeración" },
];

const CONDITIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "USED", label: "Usado" },
  { value: "REFURBISHED", label: "Reacondicionado" },
];

// TODO (Etapa 3): Estas marcas y mapeos están hardcodeados para la Etapa 2 (Mocks).
// En la Etapa 3, el endpoint GET /api/products del Seller debería retornar un objeto "facets" o "aggregations"
// que contenga dinámicamente las marcas disponibles en la BD (usando Prisma .groupBy) basándose en la categoría actual.
// El frontend deberá recibir estas marcas como props o del estado global y reemplazar `ALL_BRANDS` y `BRANDS_BY_CATEGORY`.
const ALL_BRANDS = [
  "AMD", "ASUS", "Corsair", "Deepcool", "Gigabyte", "Intel", 
  "Kingston", "LG", "MSI", "NVIDIA", "NZXT", "Samsung"
].map(b => ({ value: b, label: b }));

const BRANDS_BY_CATEGORY: Record<string, typeof ALL_BRANDS> = {
  MONITOR: ["LG", "MSI"].map(b => ({ value: b, label: b })),
  GPU: ["NVIDIA", "MSI", "ASUS", "Gigabyte"].map(b => ({ value: b, label: b })),
  CPU: ["AMD", "Intel"].map(b => ({ value: b, label: b })),
  STORAGE: ["Samsung", "Kingston", "Corsair"].map(b => ({ value: b, label: b })),
  RAM: ["Corsair", "Kingston"].map(b => ({ value: b, label: b })),
  MOTHERBOARD: ["ASUS", "Gigabyte", "MSI"].map(b => ({ value: b, label: b })),
  CASE: ["NZXT", "Corsair", "Deepcool"].map(b => ({ value: b, label: b })),
  PSU: ["Corsair", "Gigabyte"].map(b => ({ value: b, label: b })),
  COOLING: ["Deepcool", "NZXT", "Corsair"].map(b => ({ value: b, label: b })),
};

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

// -------------------------------------------------------------
// SECCIÓN DE FILTRO REUTILIZABLE (Categorías, Marcas, Condición)
// -------------------------------------------------------------
function FilterSection({ 
  title, 
  options, 
  selectedValue, 
  onSelect, 
  paramName,
  idPrefix
}: { 
  title: string, 
  options: {value: string, label: string}[], 
  selectedValue: string | null, 
  onSelect: (val: string) => void,
  paramName: string,
  idPrefix: string
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleOptions = showAll ? options : options.slice(0, 6);

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <ul className="space-y-2">
        {/* Opción TODOS (por defecto si no hay nada seleccionado) */}
        <li>
          <RoundCheckbox
            id={`${idPrefix}${paramName}-todos`}
            name={`${idPrefix}${paramName}-filter`}
            value=""
            checked={!selectedValue}
            onChange={() => onSelect("")}
            label="TODOS"
          />
        </li>
        {visibleOptions.map((opt) => (
          <li key={opt.value}>
            <RoundCheckbox
              id={`${idPrefix}${paramName}-${opt.value}`}
              name={`${idPrefix}${paramName}-filter`}
              value={opt.value}
              checked={selectedValue === opt.value}
              onChange={() => onSelect(opt.value)}
              label={opt.label}
            />
          </li>
        ))}
      </ul>
      {options.length > 6 && (
        <button 
          onClick={() => setShowAll(!showAll)} 
          className="mt-3 text-xs font-semibold text-[#485696] hover:underline"
        >
          {showAll ? "Mostrar menos" : `Mostrar más (${options.length - 6})`}
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL DE FILTROS
// -------------------------------------------------------------
export default function ProductFilters({ isMobileView = false }: { isMobileView?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [, startTransition] = useTransition();
  const [showMobile, setShowMobile] = useState(false);
  const [activeThumb, setActiveThumb] = useState<"min" | "max">("max");

  // TODO (Etapa 3): El precio máximo no debe estar hardcodeado. 
  // La API del Seller debe hacer una query de agregación (Prisma .aggregate({ _max: { price: true } }))
  // y retornar el producto más caro actual para definir el MAX_ALLOWED de manera dinámica.
  const MIN_ALLOWED = 0;
  const MAX_ALLOWED = 3000000;

  const initialMin = searchParams.get("minPrice") || "";
  const initialMax = searchParams.get("maxPrice") || "";

  const [localMin, setLocalMin] = useState<string>(initialMin);
  const [localMax, setLocalMax] = useState<string>(initialMax);
  const [prevParams, setPrevParams] = useState(searchParams.toString());

  // Sincronizar estado local si la URL cambia (ej: al presionar "Limpiar todos")
  if (searchParams.toString() !== prevParams) {
    setLocalMin(initialMin);
    setLocalMax(initialMax);
    setPrevParams(searchParams.toString());
  }

  // Keep body scroll locked when mobile drawer is open
  useEffect(() => {
    if (showMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Auto-close if user resizes back to desktop, to free the scroll
    const handleResize = () => {
      if (window.innerWidth >= 1024 && showMobile) {
        setShowMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => { 
      document.body.style.overflow = "unset"; 
      window.removeEventListener("resize", handleResize);
    };
  }, [showMobile]);

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
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const debouncedPriceUpdate = useDebouncedCallback((minStr: string, maxStr: string) => {
    const updates: Record<string, string> = {};
    
    const minNum = minStr === "" ? MIN_ALLOWED : Number(minStr);
    const maxNum = maxStr === "" ? MAX_ALLOWED : Number(maxStr);

    if (minNum > MIN_ALLOWED) updates.minPrice = minNum.toString();
    else updates.minPrice = ""; 
    
    if (maxNum < MAX_ALLOWED && maxNum > minNum) updates.maxPrice = maxNum.toString();
    else updates.maxPrice = "";

    updateParams(updates);
  }, 400);

  // Manejador para inputs de texto (permite string vacío y no clamp agresivo al tipear)
  const handleMinTextChange = (val: string) => {
    setLocalMin(val);
    debouncedPriceUpdate(val, localMax);
  };

  const handleMaxTextChange = (val: string) => {
    setLocalMax(val);
    debouncedPriceUpdate(localMin, val);
  };

  // Valores numéricos seguros para la barra visual
  const sliderMin = localMin === "" ? MIN_ALLOWED : Number(localMin);
  const sliderMax = localMax === "" ? MAX_ALLOWED : Number(localMax);

  // Manejador para el Slider (clamping estricto e instantáneo, SIN actualizar URL aún)
  const handleSliderMinChange = (val: number) => {
    const clampedMin = Math.max(MIN_ALLOWED, Math.min(val, sliderMax - 1000));
    setLocalMin(clampedMin.toString());
  };

  const handleSliderMaxChange = (val: number) => {
    const clampedMax = Math.min(MAX_ALLOWED, Math.max(val, sliderMin + 1000));
    setLocalMax(clampedMax.toString());
  };

  // Impactar URL solo cuando suelta el clic del slider
  const commitSliderUpdate = () => {
    const updates: Record<string, string> = {};
    if (sliderMin > MIN_ALLOWED) updates.minPrice = sliderMin.toString();
    else updates.minPrice = ""; 
    
    if (sliderMax < MAX_ALLOWED && sliderMax > sliderMin) updates.maxPrice = sliderMax.toString();
    else updates.maxPrice = "";

    updateParams(updates);
  };

  const currentCategory = searchParams.get("category");
  const currentBrand = searchParams.get("brand");
  const currentCondition = searchParams.get("condition");

  const hasPrice = !!searchParams.get("minPrice") || !!searchParams.get("maxPrice");
  const hasAnyFilter = !!currentCondition || hasPrice || !!currentCategory || !!currentBrand;

  const clearAllFilters = () => {
    setLocalMin("");
    setLocalMax("");
    
    const params = new URLSearchParams(searchParams);
    params.delete("condition");
    params.delete("category");
    params.delete("brand");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const toggleSingleValue = (param: string, value: string) => {
    const current = searchParams.get(param);
    // Si elegimos "TODOS", el value es "". Si elegimos algo igual a lo actual, lo limpiamos también.
    const newValue = (value === "" || current === value) ? "" : value;
    
    const updates: Record<string, string> = { [param]: newValue };
    
    // Si cambia la categoría y la nueva no incluye la marca actual, limpiar la marca
    if (param === "category") {
       if (newValue && currentBrand) {
          const allowedBrandsForNewCat = BRANDS_BY_CATEGORY[newValue] || ALL_BRANDS;
          if (!allowedBrandsForNewCat.find(b => b.value === currentBrand)) {
             updates.brand = "";
          }
       } else if (!newValue) {
          // Si reseteamos categoría, conservamos la marca, no hay problema.
       }
    }

    updateParams(updates);
  };

  const idPrefix = isMobileView ? "mobile-" : "desktop-";

  // Marcas disponibles según la categoría seleccionada
  const availableBrands = currentCategory 
    ? (BRANDS_BY_CATEGORY[currentCategory] || ALL_BRANDS)
    : ALL_BRANDS;

  // Lógica de % para pintar el Dual Slider
  const getPercent = useCallback(
    (value: number) => Math.round(((value - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * 100),
    []
  );
  const minPercent = getPercent(sliderMin);
  const maxPercent = getPercent(sliderMax);

  const FiltersContent = (
    <div className="space-y-8">
      {/* Header for desktop filters */}
      {!isMobileView && (
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
      )}

      {/* 1. Categorías */}
      <FilterSection 
        title="Categoría"
        options={CATEGORIES}
        selectedValue={currentCategory}
        onSelect={(val) => toggleSingleValue("category", val)}
        paramName="category"
        idPrefix={idPrefix}
      />

      <div className="h-px w-full bg-gray-300 my-8" />

      {/* 2. Marcas (Dinámico según Categoría) */}
      <FilterSection 
        title="Marca"
        options={availableBrands}
        selectedValue={currentBrand}
        onSelect={(val) => toggleSingleValue("brand", val)}
        paramName="brand"
        idPrefix={idPrefix}
      />

      <div className="h-px w-full bg-gray-300 my-8" />

      {/* 3. Condición */}
      <FilterSection 
        title="Condición"
        options={CONDITIONS}
        selectedValue={currentCondition}
        onSelect={(val) => toggleSingleValue("condition", val)}
        paramName="condition"
        idPrefix={idPrefix}
      />

      <div className="h-px w-full bg-gray-300 my-8" />

      {/* 4. Precio (Dual Range Slider) */}
      <div>
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Precio (ARS)
        </h3>
        <div className="flex flex-col gap-6">
          
          {/* Inputs de texto sin spinners */}
          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                placeholder="0"
                value={localMin}
                onChange={(e) => handleMinTextChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <span className="text-gray-400 font-bold">-</span>
            <div className="relative w-full">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                placeholder={MAX_ALLOWED.toString()}
                value={localMax}
                onChange={(e) => handleMaxTextChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Slider Visual de dos puntas */}
          <div className="relative h-6 flex items-center">
            {/* Contenedor exacto para la pista (ancho total - ancho del thumb w-5 = 1.25rem) */}
            <div className="absolute w-[calc(100%-1.25rem)] mx-auto left-0 right-0 h-1.5">
              {/* Pista gris de fondo */}
              <div className="absolute inset-0 bg-gray-300 rounded-full" />
              
              {/* Pista azul de rango activo */}
              <div 
                className="absolute inset-y-0 bg-[#485696] rounded-full" 
                style={{ 
                  left: `${minPercent}%`, 
                  right: `${100 - maxPercent}%` 
                }} 
              />
            </div>
            
            {/* Input Rango Mínimo */}
            <input 
              type="range" 
              min={MIN_ALLOWED} 
              max={MAX_ALLOWED} 
              value={sliderMin} 
              onChange={(e) => handleSliderMinChange(Number(e.target.value))}
              onMouseUp={commitSliderUpdate}
              onTouchEnd={commitSliderUpdate}
              onKeyUp={commitSliderUpdate}
              onMouseDown={() => setActiveThumb("min")}
              onTouchStart={() => setActiveThumb("min")}
              className={`absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#485696] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md ${activeThumb === "min" ? "z-40" : "z-30"}`}
            />
            {/* Input Rango Máximo */}
            <input 
              type="range" 
              min={MIN_ALLOWED} 
              max={MAX_ALLOWED} 
              value={sliderMax} 
              onChange={(e) => handleSliderMaxChange(Number(e.target.value))}
              onMouseUp={commitSliderUpdate}
              onTouchEnd={commitSliderUpdate}
              onKeyUp={commitSliderUpdate}
              onMouseDown={() => setActiveThumb("max")}
              onTouchStart={() => setActiveThumb("max")}
              className={`absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#485696] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md ${activeThumb === "max" ? "z-40" : "z-30"}`}
            />
          </div>

        </div>
      </div>
    </div>
  );

  if (isMobileView) {
    return (
      <>
        {/* Botón Cuadrado Mobile */}
        <button
          onClick={() => setShowMobile(true)}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
          aria-label="Filtros"
        >
          <FunnelIcon className="h-5 w-5" />
          {hasAnyFilter && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#FC7A1E] border-2 border-white"></span>
          )}
        </button>

        {/* Drawer Lateral Mobile */}
        {showMobile && (
          <div className="fixed inset-0 z-50 flex justify-end">
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowMobile(false)} />
             <div className="relative z-10 w-full max-w-[280px] sm:max-w-[320px] h-full bg-white p-6 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                 <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                 <button onClick={() => setShowMobile(false)} className="p-2 -mr-2 text-gray-500 rounded-full hover:bg-gray-100 transition">
                   <XMarkIcon className="h-6 w-6" />
                 </button>
               </div>
               
               {hasAnyFilter && (
                 <button
                   onClick={clearAllFilters}
                   className="mb-6 flex w-full justify-center rounded-lg border border-gray-200 py-2 text-sm font-semibold text-[#FC7A1E] hover:bg-gray-50"
                 >
                   Limpiar todos
                 </button>
               )}

               {FiltersContent}
               
               {/* Fixed bottom button to close */}
               <div className="sticky bottom-0 left-0 w-full bg-white pt-6 pb-2 mt-8 border-t border-gray-100 z-50">
                 <button 
                   onClick={() => setShowMobile(false)}
                   className="w-full rounded-lg bg-[#485696] py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110"
                 >
                   Ver resultados
                 </button>
               </div>
             </div>
          </div>
        )}
      </>
    );
  }

  // Desktop view
  return (
    <>
      <div className="hidden lg:block">
        {FiltersContent}
      </div>
    </>
  );
}