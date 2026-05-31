import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getBuyerProfile } from "@/lib/db/profile";
import OnboardingForm from "./OnboardingForm";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

export const metadata = {
  title: "Bienvenido a CompuLibre — Configura tu Perfil",
  description: "Configura tu perfil de comprador cargando tu nombre y dirección real para comenzar a comprar hardware.",
};

/**
 * Server Component: Pantalla de Onboarding de CompuLibre.
 * Evita accesos de usuarios no autenticados y de usuarios que ya poseen perfil en la DB local.
 */
type SearchParams = Promise<{ returnUrl?: string }>;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Next.js 15+: searchParams es una Promise, hay que awaitearlo
  const params = await searchParams;
  const returnUrl = params.returnUrl || "/products";

  // Si el usuario ya posee un perfil en Postgres Y tiene dirección configurada Y ya realizó una compra, no debe rellenar el onboarding
  const profile = await getBuyerProfile();
  const orderCount = await import("@/lib/db/prisma").then(m => m.prisma.buyerOrder.count({ where: { buyerId: user.id } }));

  if (profile && profile.defaultShippingAddress && orderCount > 0) {
    redirect(returnUrl);
  }

  // Pre-completar datos usando el perfil existente o los claims de Clerk
  const defaultName = profile?.fullName || user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const defaultAddress = profile?.defaultShippingAddress || "";
  const defaultPostalCode = profile?.defaultPostalCode || "";

  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center bg-[#F3F4F6] px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Contenedor principal estilo Tarjeta (Card) */}
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 sm:p-10">
        
        {/* Cabecera / Bienvenida */}
        <div className="mb-8 text-center">
          {/* Opcional: Aquí podrías poner un logo o ícono */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#485696]/10">
            <svg className="h-6 w-6 text-[#485696]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
            ¡Ya casi es tuyo!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Antes de finalizar la compra, necesitamos tu dirección para calcular el envío.
          </p>
        </div>

        {/* Formulario Interactivo */}
        <div className="w-full">
          <OnboardingForm 
            defaultName={defaultName} 
            defaultAddress={defaultAddress}
            defaultPostalCode={defaultPostalCode}
            returnUrl={returnUrl} 
          />
        </div>

        {/* Mensaje de confianza */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <ShieldCheckIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Tus datos están protegidos y son exclusivos para logística.</span>
        </p>
      </div>
      
    </main>
  );
}
