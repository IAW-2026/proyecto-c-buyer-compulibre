"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const CATEGORIES = [
  { name: "Monitores", query: "MONITOR", image: "/images/categoria/monitor.jpg" },
  { name: "Placas de Video", query: "GPU", image: "/images/categoria/gpu.jpg" },
  { name: "Procesadores", query: "CPU", image: "/images/categoria/cpu.jpg" },
  { name: "Almacenamiento", query: "STORAGE", image: "/images/categoria/almacenamiento.jpg" },
  { name: "Memoria RAM", query: "RAM", image: "/images/categoria/ram.jpg" },
  { name: "Motherboards", query: "MOTHERBOARD", image: "/images/categoria/motherboard.jpg" },
  { name: "Periféricos", query: "PERIPHERAL", image: "/images/categoria/mouse.jpg" },
];

export default function CategoryCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative group/carousel">
      {/* Carrusel container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6 backface-hidden touch-pan-y py-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="flex-[0_0_45%] sm:flex-[0_0_30%] md:flex-[0_0_22%] lg:flex-[0_0_18%] min-w-0">
              <Link
                href={`/products?category=${encodeURIComponent(cat.query)}`}
                className="flex flex-col items-center group"
              >
                {/* Caja rectangular que es llenada completamente por la imagen */}
                <div className="relative w-full aspect-5/4 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    sizes="(max-width: 768px) 45vw, (max-width: 1200px) 22vw, 18vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                
                {/* Texto debajo, libre de la caja */}
                <span className="mt-3 md:mt-4 font-semibold text-gray-800 text-sm md:text-base text-center group-hover:text-[#485696] transition-colors">
                  {cat.name}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Flechas (Solo visibles en hover en desktop o siempre en mobile si se desea, pero las ocultamos si no son necesarias; aquí las ponemos al costado absoluto) */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-gray-600 hover:text-[#485696] hover:scale-110 transition-transform hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100"
        aria-label="Anterior"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-gray-600 hover:text-[#485696] hover:scale-110 transition-transform hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100"
        aria-label="Siguiente"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
