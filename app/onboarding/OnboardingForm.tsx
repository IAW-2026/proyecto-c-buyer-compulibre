"use client";
 
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProfileFromOnboarding, OnboardingState } from "@/lib/db/profile";


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
      className={`w-full rounded-xl bg-[#FC7A1E] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#FC7A1E]/50 ${
        pending 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:brightness-95 active:scale-[0.99]"
      }`}
    >
      {pending ? "Guardando..." : "Comenzar a comprar"}
    </button>
  );
}

interface OnboardingFormProps {
  defaultName: string;
}

/**
 * Formulario del cliente para Onboarding.
 * Integra useActionState para recibir errores del servidor sin recargas de página.
 */
export default function OnboardingForm({ defaultName }: OnboardingFormProps) {
  // useActionState de React 19 recibe (action, initialState)
  const [state, formAction] = useActionState<OnboardingState | null, FormData>(
    createProfileFromOnboarding,
    null
  );

  return (
    <form action={formAction} className="mt-6 space-y-5">
      {/* Banner de alerta de error estético */}
      {state?.error && (
        <div className="rounded-xl bg-[#F9C784]/20 border border-[#F9C784] p-3.5 text-sm text-[#FC7A1E] font-semibold flex items-start gap-2">
          <span className="shrink-0 text-base">⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      {/* Nombre Completo */}
      <div>
        <label 
          htmlFor="fullName" 
          className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5"
        >
          Nombre Completo
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          defaultValue={defaultName}
          required
          minLength={3}
          autoFocus
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1F2937] placeholder-[#6B7280] outline-none transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20"
          placeholder="Ej: Juan Pérez"
        />
      </div>

      {/* Dirección de Envío */}
      <div>
        <label 
          htmlFor="address" 
          className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1.5"
        >
          Dirección de Envío
        </label>
        <input
          type="text"
          id="address"
          name="address"
          required
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1F2937] placeholder-[#6B7280] outline-none transition focus:border-[#485696] focus:ring-2 focus:ring-[#485696]/20"
          placeholder="Ej: Av. Corrientes 1234, Piso 4 B, CABA, Argentina"
        />
        <p className="mt-2 text-xs text-[#6B7280] leading-relaxed">
          Debe tener al menos 10 caracteres. Esta será tu dirección estática de envío para todas tus compras en CompuLibre.
        </p>
      </div>

      {/* Botón de Confirmación */}
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
