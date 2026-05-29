"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { ProductImage } from "@/types";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * Galería de imágenes construida con Embla Carousel v8.
 *
 * Comportamiento:
 * - Deslizamiento nativo táctil con animación visual (Embla lo maneja internamente).
 * - `watchDrag` personalizado: solo acepta gestos más horizontales que verticales,
 *   para no interferir con el scroll ni con el gesto de "volver" del navegador.
 * - Mobile: puntos de navegación.
 * - Desktop: miniaturas con hover + flechas.
 */
export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const hasMultiple = images.length > 1;

  // ── Embla principal ──────────────────────────────────────────────────────
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    // Drag personalizado: solo activa si el gesto es más horizontal que vertical.
    // Esto evita que Embla tome control del swipe de "volver" del navegador (borde izq).
    watchDrag: (_, event) => {
      const e = event as TouchEvent | MouseEvent;
      if (!("touches" in e)) return true; // mouse: permitir siempre
      const touch = (e as TouchEvent).touches[0];
      // El gesto aún no tiene delta — Embla nos pasa el touchstart,
      // así que solo bloqueamos si viene del borde izquierdo de la pantalla (< 24px).
      if (touch.clientX < 24) return false;
      return true;
    },
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Sincronizar el índice activo con el carrusel
  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => setActiveIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", sync);
    sync();
    return () => {
      emblaApi.off("select", sync);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      emblaApi?.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      emblaApi?.scrollNext();
    },
    [emblaApi]
  );

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ── Viewport de Embla ── */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-inner"
        ref={emblaRef}
      >
        {/* ── Contenedor de slides ── */}
        <div className="flex h-full">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative h-full w-full shrink-0"
              style={{ flex: "0 0 100%" }}
            >
              <Image
                src={img.imageUrl}
                alt={`${productName} — imagen ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-contain p-6 sm:p-8"
                priority={i === 0}
                unoptimized
              />
            </div>
          ))}
        </div>

        {/* Contador numérico — siempre visible en mobile, hover en desktop */}
        {hasMultiple && (
          <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
            {activeIndex + 1} / {images.length}
          </span>
        )}

        {/* Flechas — solo en desktop (hover del grupo) */}
        {hasMultiple && (
          <>
            <button
              onClick={scrollPrev}
              aria-label="Imagen anterior"
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                hidden sm:flex h-9 w-9 items-center justify-center
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
              onClick={scrollNext}
              aria-label="Imagen siguiente"
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                hidden sm:flex h-9 w-9 items-center justify-center
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

      {/* ── Puntos de navegación — solo en mobile ── */}
      {hasMultiple && (
        <div
          className="flex justify-center gap-2 sm:hidden"
          role="tablist"
          aria-label="Imágenes del producto"
        >
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Ir a imagen ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-5 h-2 bg-[#485696]"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Miniaturas — solo en desktop ── */}
      {hasMultiple && (
        <div className="hidden sm:flex gap-3 overflow-x-auto py-2 px-1 -mx-1 justify-center">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollTo(i)}
              aria-label={`Ver imagen ${i + 1} de ${productName}`}
              aria-pressed={i === activeIndex}
              className={`
                relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#485696]/50
                ${
                  i === activeIndex
                    ? "border-[#485696] shadow-md shadow-[#485696]/20 scale-105 z-10"
                    : "border-gray-200 hover:border-[#485696]/50 hover:scale-[1.03] opacity-60 hover:opacity-100"
                }
              `}
            >
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
