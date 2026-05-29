"use client";
 
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProfileFromOnboarding, OnboardingState } from "@/lib/db/profile";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";


/**
 * Botón de confirmación que utiliza useFormStatus de React DOM.
 * Se desactiva y cambia su etiqueta a "Guardando..." durante el envío de la Server Action.
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`block w-full rounded-xl border border-[#FC7A1E] bg-[#FC7A1E] px-12 py-3 text-sm font-bold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#FC7A1E]/50 ${
        pending 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-transparent hover:text-[#FC7A1E]"
      }`}
    >
      {pending ? "Guardando..." : "Comenzar a comprar"}
    </button>
  );
}

interface OnboardingFormProps {
  defaultName: string;
  returnUrl: string;
}

/**
 * Formulario del cliente para Onboarding.
 * Integra useActionState para recibir errores del servidor sin recargas de página.
 */
export default function OnboardingForm({ defaultName, returnUrl }: OnboardingFormProps) {
  // useActionState de React 19 recibe (action, initialState)
  const [state, formAction] = useActionState<OnboardingState | null, FormData>(
    createProfileFromOnboarding,
    null
  );

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
      <input type="hidden" name="returnUrl" value={returnUrl} />
      
      {/* Banner de alerta de error estético */}
      {state?.error && (
        <div className="rounded-xl bg-[#F9C784]/20 border border-[#F9C784] p-3.5 text-sm text-[#FC7A1E] font-semibold flex items-start gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Nombre Completo */}
      <div>
        <label 
          htmlFor="fullName" 
          className="block text-sm font-medium text-[#1F2937]"
        >
          Nombre Completo
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          defaultValue={state?.fullName || defaultName}
          required
          minLength={3}
          autoFocus
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#6B7280] outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696]"
          placeholder="Ej: Juan Pérez"
        />
      </div>

      {/* Dirección de Envío */}
      <div>
        <label 
          htmlFor="address" 
          className="block text-sm font-medium text-[#1F2937]"
        >
          Dirección de Envío
        </label>
        <input
          type="text"
          id="address"
          name="address"
          defaultValue={state?.address || ""}
          required
          minLength={10}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#6B7280] outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696]"
          placeholder="Ej: Av. Corrientes 1234, Piso 4 B, CABA, Argentina"
        />
        <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
          Debe tener al menos 10 caracteres. Esta será tu dirección estática de envío para todas tus compras.
        </p>
      </div>

      {/* Código Postal */}
      <div>
        <label 
          htmlFor="postalCode" 
          className="block text-sm font-medium text-[#1F2937]"
        >
          Código Postal
        </label>
        <input
          type="text"
          id="postalCode"
          name="postalCode"
          defaultValue={state?.postalCode || ""}
          required
          minLength={4}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#6B7280] outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696]"
          placeholder="Ej: 1414"
        />
      </div>

      {/* Botón de Confirmación */}
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
