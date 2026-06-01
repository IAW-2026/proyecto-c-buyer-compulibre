"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Componente Cliente: ProfileRedirector
 * Realiza una redirección limpia a /onboarding del lado del cliente tras el montaje del componente.
 * Esto previene conflictos de carrera de hidratación entre Next.js y el SDK de Clerk al finalizar el login.
 * Muestra un spinner estético con la identidad visual de CompuLibre.
 */
export default function ProfileRedirector() {
  const router = useRouter();

  useEffect(() => {
    // Usamos replace para no ensuciar el historial del navegador con la redirección
    router.replace("/onboarding");
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#E6E6E6] text-[#1F2937]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado con los colores corporativos (Azul #485696 y Naranja #FC7A1E) */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#485696]/20 border-t-[#FC7A1E]" />
        <p className="text-sm font-semibold text-[#485696] animate-pulse">
          Configurando tu sesión...
        </p>
      </div>
    </div>
  );
}
