import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

/**
 * Custom 404 Not Found Page for CompuLibre.
 * Remodeled with a high-fidelity large-typography design.
 * Built using the brand design system: Azul #485696, Naranja #FC7A1E, and Gris #E7E7E7.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-sm text-center">
        {/* Huge 404 Text */}
        <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-[#485696] sm:text-8xl md:text-9xl">
          404
        </h1>
        
        {/* Bold Subtitle */}
        <p className="mb-4 text-2xl font-bold tracking-tight text-[#1F2937] sm:text-3xl md:text-4xl">
          Página no encontrada
        </p>
        
        {/* Friendly Description */}
        <p className="mb-8 text-base font-light text-[#6B7280] sm:text-lg leading-relaxed">
          La página o el producto que estás buscando no existe o fue movido de lugar. Revisá que la dirección esté bien escrita o continuá navegando por nuestro catálogo de hardware.
        </p>
        
        {/* CTA Button */}
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FC7A1E] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-95 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FC7A1E]/50"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    </main>
  );
}
