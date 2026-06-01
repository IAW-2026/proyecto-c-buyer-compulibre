"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmOrderAction } from "@/lib/actions/checkout";

interface CheckoutConfirmButtonProps {
  disabled?: boolean;
}

export default function CheckoutConfirmButton({ disabled = false }: CheckoutConfirmButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmOrderAction();

      // confirmOrderAction hace redirect() en caso de éxito.
      // Solo llega acá si hubo un error.
      if (result && !result.success) {
        // Redirigir al carrito con el mensaje de error para no mostrar estado roto en /checkout
        router.push(`/cart?error=${encodeURIComponent(result.message)}`);
      }
    });
  };

  return (
    <button
      id="checkout-confirm-btn"
      onClick={handleConfirm}
      disabled={disabled || isPending}
      className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-sm font-extrabold text-white shadow-lg transition-all duration-200 ${
        disabled || isPending
          ? "cursor-not-allowed bg-gray-300 shadow-none"
          : "bg-[#FC7A1E] hover:brightness-95 hover:scale-[1.02] active:scale-[0.98] shadow-[#FC7A1E]/30"
      }`}
    >
      {isPending ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Procesando...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
          Confirmar y pagar
        </>
      )}
    </button>
  );
}
