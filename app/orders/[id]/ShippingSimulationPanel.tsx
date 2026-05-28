"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { simulateShippingAction } from "@/lib/actions/checkout";
import type { ShipmentStatus } from "@/types";

interface ShippingSimulationPanelProps {
  orderId: string;
  orderStatus: string;
  shipmentStatus: ShipmentStatus | null;
}

export default function ShippingSimulationPanel({
  orderId,
  orderStatus,
  shipmentStatus,
}: ShippingSimulationPanelProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Decidir qué acción / botón mostrar según el estado actual
  let currentAction: ShipmentStatus | null = null;
  let buttonLabel = "";
  let description = "";

  if (orderStatus === "PAID") {
    currentAction = "LABEL_CREATED";
    buttonLabel = "Simular Despacho (Etiqueta Creada)";
    description = "El vendedor empaquetó el pedido y generó la etiqueta de envío Andreani. Generará un Tracking ID.";
  } else if (orderStatus === "SHIPPED") {
    if (!shipmentStatus || shipmentStatus === "LABEL_CREATED") {
      currentAction = "IN_TRANSIT";
      buttonLabel = "Simular En Tránsito";
      description = "El transportista retiró el paquete. El estado del envío pasará a 'IN_TRANSIT'.";
    } else if (shipmentStatus === "IN_TRANSIT") {
      currentAction = "DELIVERED";
      buttonLabel = "Simular Entrega";
      description = "El cartero entregó el paquete en el domicilio. El pedido se marcará como 'DELIVERED'.";
    }
  }

  const handleSimulate = () => {
    if (!currentAction) return;

    startTransition(async () => {
      const res = await simulateShippingAction(orderId, currentAction!);
      if (!res.success) {
        alert(res.message || "Ocurrió un error al simular el envío.");
        return;
      }
      // Navegar con el event param para disparar el toast de notificación
      router.push(`/orders/${orderId}?event=${currentAction}`);
    });
  };

  if (!currentAction) {
    if (orderStatus === "DELIVERED") {
      return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex gap-3">
            <span className="text-xl">📦</span>
            <div>
              <h3 className="font-extrabold text-emerald-800 text-sm uppercase tracking-wider">
                Simulador de Envíos (Dev Admin)
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                El flujo de envío para esta orden ya ha finalizado exitosamente (Entregado).
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null; // En PENDING_PAYMENT, CANCELLED o PAYMENT_FAILED no permitimos simular envío
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#FC7A1E]/30 bg-[#FC7A1E]/5 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#FC7A1E]" />
            <h3 className="font-extrabold text-[#FC7A1E] text-xs uppercase tracking-widest">
              Panel de Simulación de Envío (Admin)
            </h3>
          </div>
          <p className="text-sm font-bold text-[#1F2937] mt-1">
            Simular el siguiente paso logístico
          </p>
          <p className="text-xs text-[#6B7280] leading-relaxed max-w-md">
            {description}
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isPending}
          className="shrink-0 rounded-xl bg-[#FC7A1E] px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#FC7A1E]/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Simulando...
            </span>
          ) : (
            buttonLabel
          )}
        </button>
      </div>
    </div>
  );
}
