"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface HeroCarouselProps {
  images?: string[];
}

export default function HeroCarousel({ images = [] }: HeroCarouselProps) {
  const [validImages, setValidImages] = useState<string[]>(images);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Protegemos el índice en caso de que la cantidad de imágenes cambie dinámicamente
  const safeIndex = validImages.length > 0 ? currentIndex % validImages.length : 0;
  const hasImages = validImages.length > 0;

  useEffect(() => {
    // Si hay 1 sola imagen válida (o cero), no hace falta inicializar el carrusel
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 7000); // 7000 ms = 7 segundos (5s de antes + 2s)

    return () => clearInterval(interval);
  }, [validImages.length]);

  const handleImageError = (failedSrc: string) => {
    // Si la imagen falla en cargar (ej: 404 Not Found), la quitamos del array de imágenes válidas
    setValidImages((prev) => prev.filter((src) => src !== failedSrc));
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden bg-[#485696]">
      
      {/* Decoración de fondo original que se muestra si no hay imágenes */}
      {!hasImages && (
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent z-10" />
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

      {/* Capa oscura superpuesta y textos */}
      <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-4 ${hasImages ? 'bg-black/40' : ''}`}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-center drop-shadow-lg">
          La tecnología que necesitás, al mejor precio
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium text-center drop-shadow-md">
          Explorá nuestro catálogo de hardware, periféricos y accesorios con envíos garantizados.
        </p>
      </div>
    </div>
  );
}
