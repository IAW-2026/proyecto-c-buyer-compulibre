import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getBuyerProfile } from "@/lib/db/profile";
import OnboardingForm from "./OnboardingForm";

export const metadata = {
  title: "Bienvenido a CompuLibre — Configura tu Perfil",
  description: "Configura tu perfil de comprador cargando tu nombre y dirección real para comenzar a comprar hardware.",
};

/**
 * Server Component: Pantalla de Onboarding de CompuLibre.
 * Evita accesos de usuarios no autenticados y de usuarios que ya poseen perfil en la DB local.
 */
export default async function OnboardingPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Si el usuario ya posee un perfil en Postgres, no debe rellenar el onboarding
  const profile = await getBuyerProfile();
  if (profile) {
    redirect("/products");
  }

  // Pre-completar el nombre usando los claims oficiales de Clerk
  const defaultName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#E7E7E7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
        
        {/* Cabecera / Bienvenida */}
        <div className="text-center">
          <span className="text-4xl" role="img" aria-label="Computadora">
            💻
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#1F2937] tracking-tight">
            ¡Te damos la bienvenida!
          </h1>
          <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
            Estás a un paso de acceder a la mejor selección de hardware de CompuLibre. Completá tus datos para empezar a comprar.
          </p>
        </div>

        {/* Formulario Interactivo */}
        <OnboardingForm defaultName={defaultName} />
        
      </div>
    </main>
  );
}
