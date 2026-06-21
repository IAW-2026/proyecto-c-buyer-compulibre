"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface HeroCarouselProps {
  images?: string[];
}

export default function HeroCarousel({ images = [] }: HeroCarouselProps) {
  const [validImages, setValidImages] = useState<string[]>(images);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Protegemos el índice en caso de que la cantidad de imágenes cambie dinámicamente
  const safeIndex = validImages.length > 0 ? currentIndex % validImages.length : 0;
  const hasImages = validImages.length > 0;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? validImages.length - 1 : prev - 1));
  }, [validImages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    // Si hay 1 sola imagen válida (o cero), no hace falta inicializar el carrusel
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 7000); // 7000 ms = 7 segundos

    return () => clearInterval(interval);
  }, [validImages.length, currentIndex, nextSlide]);

  const handleImageError = (failedSrc: string) => {
    // Si la imagen falla en cargar (ej: 404 Not Found), la quitamos del array de imágenes válidas
    setValidImages((prev) => prev.filter((src) => src !== failedSrc));
  };

  return (
    <div className="relative w-full aspect-video md:aspect-auto md:h-[600px] overflow-hidden bg-[#1E2540] group">
      
      {/* Decoración de fondo original que se muestra si no hay imágenes */}
      {!hasImages && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent z-10" />
      )}

      {/* Botones de navegación (solo se muestran si hay más de 1 imagen) */}
      {hasImages && validImages.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 p-1.5 md:p-3 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-8 md:h-8" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 p-1.5 md:p-3 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="w-5 h-5 md:w-8 md:h-8" />
          </button>

          {/* Indicadores (Dots) */}
          <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2 md:space-x-3">
            {validImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Ir a la diapositiva ${idx + 1}`}
                className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${
                  idx === safeIndex ? "bg-[#FC7A1E] w-6 md:w-8" : "bg-white/50 hover:bg-white w-2 md:w-2.5"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {hasImages && validImages.map((src, index) => (
        <div
          key={src} // Usar el src como key evita problemas si el array cambia de tamaño
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === safeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Fallback de error por si el usuario aún no sube las imágenes */}
          <Image
            src={src}
            alt={`Hero banner ${index + 1}`}
            fill
            className="object-cover object-center"
            priority={index === 0}
            onError={() => handleImageError(src)}
          />
        </div>
      ))}

    </div>
  );
}
