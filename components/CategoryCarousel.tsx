"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { 
  ImacIcon,
  VideoCardIcon,
  CpuIcon,
  HardDriveIcon,
  RamMemoryIcon,
  MotherboardIcon
} from "@/components/Icons";

const CATEGORIES = [
  { name: "Monitores", query: "MONITOR", icon: ImacIcon },
  { name: "Placas de Video", query: "GPU", icon: VideoCardIcon },
  { name: "Procesadores", query: "CPU", icon: CpuIcon },
  { name: "Almacenamiento", query: "STORAGE", icon: HardDriveIcon },
  { name: "Memoria RAM", query: "RAM", icon: RamMemoryIcon },
  { name: "Motherboards", query: "MOTHERBOARD", icon: MotherboardIcon },
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
    <div className="relative group">
      {/* Carrusel container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 sm:gap-6 backface-hidden touch-pan-y">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_calc(25%-18px)] min-w-0">
              <Link
                href={`/products?category=${encodeURIComponent(cat.query)}`}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#485696]/30 transition-all flex flex-col items-center justify-center gap-4 group h-full"
              >
                <div className="bg-gray-50 p-4 rounded-full group-hover:bg-[#485696]/10 transition-colors">
                  <cat.icon className="h-8 w-8 text-gray-600 group-hover:text-[#485696]" />
                </div>
                <span className="font-bold text-gray-900 text-center text-sm md:text-base">
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
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-gray-600 hover:text-[#485696] hover:scale-110 transition-transform hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100"
        aria-label="Anterior"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-gray-600 hover:text-[#485696] hover:scale-110 transition-transform hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100"
        aria-label="Siguiente"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
