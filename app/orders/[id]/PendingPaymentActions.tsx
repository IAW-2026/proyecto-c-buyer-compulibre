"use client";

import { useTransition, useState } from "react";
import { resumePaymentAction, cancelOrderAction } from "@/lib/actions/checkout";
import { XMarkIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "@/components/ConfirmModal";

export default function PendingPaymentActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleResume = () => {
    startTransition(async () => {
      const res = await resumePaymentAction(orderId);
      if (res && !res.success) {
        alert(res.message);
      }
    });
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    startTransition(async () => {
      const res = await cancelOrderAction(orderId);
      setShowCancelModal(false);
      if (res && !res.success) {
        alert(res.message);
      }
    });
  };

  return (
    <div className="flex flex-col mt-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleResume}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-[#485696] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#3f4a80] disabled:opacity-50 transition-colors"
        >
          <CreditCardIcon className="h-5 w-5" aria-hidden="true" />
          <span>{isPending ? "Procesando..." : "Continuar con el pago"}</span>
        </button>
        <button
          onClick={handleCancelClick}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          <span>Cancelar orden</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3 italic text-center sm:text-left">
        * Si ya completaste el pago en la plataforma externa, la cancelación manual no tendrá efecto y tu orden será procesada normalmente.
      </p>

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancelar Orden"
        message="¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer y tu carrito actual quedará libre para agregar nuevos productos."
        confirmText="Sí, cancelar orden"
        cancelText="Volver atrás"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
        isLoading={isPending}
      />
    </div>
  );
}
