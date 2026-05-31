"use client";
 
import { useActionState, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
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
  defaultAddress?: string;
  defaultPostalCode?: string;
  returnUrl: string;
}

/**
 * Formulario del cliente para Onboarding.
 * Integra useActionState para recibir errores del servidor sin recargas de página.
 */
export default function OnboardingForm({ 
  defaultName, 
  defaultAddress = "", 
  defaultPostalCode = "", 
  returnUrl 
}: OnboardingFormProps) {
  // useActionState de React 19 recibe (action, initialState)
  const [state, formAction] = useActionState<OnboardingState | null, FormData>(
    createProfileFromOnboarding,
    null
  );

  const nameParts = defaultName.trim().split(/\s+/);
  const fallbackName = nameParts[0] || "";
  const fallbackSurname = nameParts.slice(1).join(" ") || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!isConfirmed) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    setIsModalOpen(false);
    
    // Ejecutamos el submit después de actualizar el estado
    setTimeout(() => {
      formRef.current?.requestSubmit();
      
      // Reseteamos por si hay un error del servidor y el usuario necesita reintentar después
      setTimeout(() => setIsConfirmed(false), 500);
    }, 50);
  };

  return (
    <>
      <form ref={formRef} action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <input type="hidden" name="returnUrl" value={returnUrl} />
        
        {/* Banner de alerta de error estético */}
        {state?.error && (
          <div className="rounded-xl bg-[#F9C784]/20 border border-[#F9C784] p-3.5 text-sm text-[#FC7A1E] font-semibold flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-[#1F2937]"
            >
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={state?.name || fallbackName}
              required
              minLength={2}
              autoFocus
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, "");
              }}
              pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+"
              title="El nombre solo puede contener letras, espacios, guiones o apóstrofes"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
              placeholder="Ej: Juan"
            />
          </div>
          <div>
            <label 
              htmlFor="surname" 
              className="block text-sm font-medium text-[#1F2937]"
            >
              Apellido
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              defaultValue={state?.surname || fallbackSurname}
              required
              minLength={2}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]/g, "");
              }}
              pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+"
              title="El apellido solo puede contener letras, espacios, guiones o apóstrofes"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
              placeholder="Ej: Pérez"
            />
          </div>
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
            defaultValue={state?.address || defaultAddress}
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
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={state?.postalCode || defaultPostalCode}
            required
            minLength={4}
            maxLength={4}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#6B7280] outline-none transition focus:border-[#485696] focus:ring-1 focus:ring-[#485696]"
            placeholder="Ej: 1414"
          />
        </div>

        {/* Botón de Confirmación */}
        <div className="pt-4">
          <SubmitButton />
        </div>
      </form>

      {/* Modal de confirmación */}
      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 mb-3">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937]">Confirmá tu dirección</h3>
              <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                Por favor, revisá bien tu dirección de envío. Una vez que realices tu primera compra, <strong className="text-gray-900">no será posible volver a cambiarla</strong>.
              </p>
              <p className="text-sm text-[#6B7280] mt-3">
                ¿Estás seguro/a de que los datos ingresados son correctos?
              </p>
            </div>
            
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex w-full items-center justify-center rounded-xl bg-[#FC7A1E] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.99]"
              >
                Sí, los datos son correctos
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-[#6B7280] transition hover:bg-gray-50 active:scale-[0.99]"
              >
                Revisar nuevamente
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
