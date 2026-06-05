"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#485696] mt-auto relative">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6 lg:px-8 lg:py-8">
        
        {/* Botón Volver Arriba */}
        <div className="absolute inset-e-4 bottom-4 sm:inset-e-6 sm:bottom-6 lg:inset-e-8 lg:bottom-6 z-10">
          <button
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-block rounded-full bg-[#FC7A1E] p-2 text-white shadow-sm transition hover:brightness-90 sm:p-3"
            aria-label="Volver arriba"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Contenedor Principal */}
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between lg:items-center">
          
          {/* Logo (Izquierda en Desktop) */}
          <div className="flex justify-center lg:justify-start lg:w-1/3">
            <Image 
              src="/assets/logo.png" 
              alt="CompuLibre Logo" 
              width={180} 
              height={48} 
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* Copyright (Medio en Desktop, Abajo en Mobile) */}
          <p className="text-center text-sm text-[#D1D5DB] lg:w-1/3 order-last lg:order-0 mt-2 lg:mt-0">
            Copyright © 2026 CompuLibre. Todos los derechos reservados.
          </p>

          {/* Enlaces (Derecha en Desktop) */}
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium lg:w-1/3 lg:justify-end lg:pr-14">
            <li>
              <button onClick={(e) => e.preventDefault()} className="text-white transition hover:text-[#F9C784]">
                Contáctenos
              </button>
            </li>
            <li>
              <button onClick={(e) => e.preventDefault()} className="text-white transition hover:text-[#F9C784]">
                Servicios
              </button>
            </li>
            <li>
              <button onClick={(e) => e.preventDefault()} className="text-white transition hover:text-[#F9C784]">
                Ayuda
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
