import Link from "next/link";

/**
 * Custom 404 Not Found Page for CompuLibre.
 * Rendered within the root layout, preserving the Navbar and session state.
 * Built using the brand design system: Azul #485696, Naranja #FC7A1E, and Gris #E7E7E7.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center bg-[#E7E7E7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        {/* Visual Cue */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FC7A1E]/10 text-4xl animate-bounce">
          🔍
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#1F2937] sm:text-4xl">
          404 — No encontrado
        </h1>

        {/* Description */}
        <p className="mt-4 text-sm text-[#6B7280] leading-relaxed">
          Lo sentimos, la página o el producto que estás buscando no existe o aún no ha sido implementado en esta etapa de desarrollo.
        </p>

        {/* Call to Action */}
        <div className="mt-8">
          <Link
            href="/products"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#FC7A1E] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#FC7A1E]/50"
          >
            ← Volver a Productos
          </Link>
        </div>
      </div>
    </main>
  );
}
