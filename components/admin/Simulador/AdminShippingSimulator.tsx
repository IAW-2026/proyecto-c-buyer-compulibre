"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { simulateShippingAction } from "@/app/admin/actions";
import type { ShipmentStatus } from "@/types";
import {
  ClipboardDocumentIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface AdminShippingSimulatorProps {
  orderId: string;
  orderShortId: string;
  buyerName: string;
  orderStatus: string;
  shipmentStatus: ShipmentStatus | null;
  courier: string | null;
  trackingId: string | null;
}

const STEP_CONFIG: Record<
  ShipmentStatus,
  { label: string; icon: React.ReactNode; activeClass: string }
> = {
  LABEL_CREATED: {
    label: "Etiqueta creada",
    icon: <ClipboardDocumentIcon className="h-3 w-3" />,
    activeClass: "bg-blue-100 text-blue-800 border-blue-300",
  },
  IN_TRANSIT: {
    label: "En tránsito",
    icon: <TruckIcon className="h-3 w-3" />,
    activeClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  DELIVERED: {
    label: "Entregado",
    icon: <CheckCircleIcon className="h-3 w-3" />,
    activeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
};

// Panel de control para el simulador de envios. Permite avanzar el tiempo u obligar actualizaciones de estado. (TODO: ver si es necesario cambiarlo en etapa 3)
export default function AdminShippingSimulator({
  orderId,
  orderShortId,
  buyerName,
  orderStatus,
  shipmentStatus,
  courier,
  trackingId,
}: AdminShippingSimulatorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  let nextAction: ShipmentStatus | null = null;
  let buttonLabel = "";
  let description = "";

  if (orderStatus === "PAID") {
    nextAction = "LABEL_CREATED";
    buttonLabel = "Simular despacho";
    description = "Genera la etiqueta de envío y pasa la orden a SHIPPED.";
  } else if (orderStatus === "SHIPPED") {
    if (!shipmentStatus || shipmentStatus === "LABEL_CREATED") {
      nextAction = "IN_TRANSIT";
      buttonLabel = "Simular en tránsito";
      description = "El transportista retiró el paquete.";
    } else if (shipmentStatus === "IN_TRANSIT") {
      nextAction = "DELIVERED";
      buttonLabel = "Simular entrega";
      description = "El paquete fue entregado en el domicilio.";
    }
  }

  const handleSimulate = () => {
    if (!nextAction) return;
    startTransition(async () => {
      const res = await simulateShippingAction(orderId, nextAction!);
      if (!res.success) {
        alert(res.message ?? "Error al simular el envío.");
        return;
      }
      router.refresh();
    });
  };

  const currentStepConfig =
    shipmentStatus ? STEP_CONFIG[shipmentStatus] : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      {/* Encabezado de la orden */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-mono text-[#6B7280]">
            #{orderShortId}
          </p>
          <p className="text-sm font-bold text-[#1F2937]">{buyerName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Estado de la orden */}
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">
            {orderStatus}
          </span>
          {/* Estado de envío */}
          {currentStepConfig && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${currentStepConfig.activeClass}`}
            >
              {currentStepConfig.icon} {currentStepConfig.label}
            </span>
          )}
        </div>
      </div>

      {/* Courier + Tracking (si existen) */}
      {trackingId && (
        <div className="flex gap-4 text-xs text-[#6B7280]">
          <span>
            <span className="font-semibold">Courier:</span> {courier ?? "—"}
          </span>
          <span>
            <span className="font-semibold">Tracking:</span>{" "}
            <span className="font-mono">{trackingId}</span>
          </span>
        </div>
      )}

      {/* Acción de simulación */}
      {nextAction ? (
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100 flex-wrap">
          <p className="text-xs text-[#6B7280]">{description}</p>
          <button
            onClick={handleSimulate}
            disabled={isPending}
            id={`simulate-${orderId}`}
            className="shrink-0 rounded-lg bg-[#FC7A1E] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#FC7A1E]/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <svg
                  className="animate-spin h-3 w-3 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Simulando...
              </span>
            ) : (
              buttonLabel
            )}
          </button>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-1 border-t border-gray-100">
          <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Flujo de envío completado para esta orden.
        </p>
      )}
    </div>
  );
}
