"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { ProductImage } from "@/types";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Client Component: Galería de imágenes con miniaturas y navegación por flechas.
 * - Flechas aparecen solo al hacer hover sobre la imagen principal.
 * - Hover sobre las miniaturas cambia la imagen activa.
 * - Clic sobre las miniaturas fija la imagen activa.
 */
export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Índice "fijado" por clic — se usa para distinguir hover temporal de selección
  const [pinnedIndex, setPinnedIndex] = useState(0);
  // Controla la visibilidad del contador (se desvanece tras 2.5s sin cambios)
  const [showCounter, setShowCounter] = useState(true);

  useEffect(() => {
    // Usar setTimeout para evitar llamar a setState de forma síncrona dentro del efecto,
    // previniendo el error "cascading renders" del linter.
    const showTimer = setTimeout(() => {
      setShowCounter(true);
    }, 0);

    const hideTimer = setTimeout(() => {
      setShowCounter(false);
    }, 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [activeIndex]);

  const hasMultiple = images.length > 1;

  const goTo = useCallback(
    (index: number) => {
      const next = (index + images.length) % images.length;
      setActiveIndex(next);
      setPinnedIndex(next);
    },
    [images.length]
  );

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      goTo(activeIndex - 1);
    },
    [activeIndex, goTo]
  );

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      goTo(activeIndex + 1);
    },
    [activeIndex, goTo]
  );

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Imagen principal ── */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-inner">
        <Image
          key={activeImage.imageUrl}
          src={activeImage.imageUrl}
          alt={`${productName} — imagen ${activeIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-contain p-8"
          priority={activeIndex === 0}
          unoptimized
        />

        {/* Contador */}
        {hasMultiple && (
          <span
            className={`pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-opacity duration-500 ${
              showCounter ? "opacity-100" : "opacity-0"
            }`}
          >
            {activeIndex + 1} / {images.length}
          </span>
        )}

        {/* Flechas — visibles solo en hover del contenedor */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              aria-label="Imagen anterior"
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                flex h-9 w-9 items-center justify-center
                rounded-full bg-white/80 shadow-md backdrop-blur-sm
                text-gray-700 ring-1 ring-black/5
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100
                hover:bg-white hover:shadow-lg
                focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#485696]
              "
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              aria-label="Imagen siguiente"
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                flex h-9 w-9 items-center justify-center
                rounded-full bg-white/80 shadow-md backdrop-blur-sm
                text-gray-700 ring-1 ring-black/5
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100
                hover:bg-white hover:shadow-lg
                focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#485696]
              "
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* ── Miniaturas — solo si hay más de 1 imagen ── */}
      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 -mx-1 justify-center">
          {images.map((img, i) => (
            <button
              key={img.id}
              /* Hover temporal: previsualiza sin fijar */
              onMouseEnter={() => setActiveIndex(i)}
              /* Al salir, vuelve al índice fijado por clic */
              onMouseLeave={() => setActiveIndex(pinnedIndex)}
              /* Clic: fija la imagen */
              onClick={() => goTo(i)}
              aria-label={`Ver imagen ${i + 1} de ${productName}`}
              aria-pressed={i === pinnedIndex}
              className={`
                relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#485696]/50
                ${
                  i === activeIndex
                    ? "border-[#485696] shadow-md shadow-[#485696]/20 scale-105 z-10"
                    : "border-gray-200 hover:border-[#485696]/50 hover:scale-[1.03] opacity-60 hover:opacity-100 hover:z-10"
                }
              `}
            >
              {/* Contenedor con posición relativa explícita para next/image */}
              <span className="block relative h-full w-full">
                <Image
                  src={img.imageUrl}
                  alt={`Miniatura ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                  unoptimized
                />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
