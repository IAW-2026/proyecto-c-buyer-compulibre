import { ClipboardDocumentIcon, TruckIcon, CheckCircleIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline";
import { ShipmentStatus } from "@/types";
import { BuyerOrder } from "@prisma/client";

export const SHIPMENT_STEPS: Array<{
  status: ShipmentStatus;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  doneColor: string;
}> = [
  {
    status: "IN_TRANSIT",
    label: "En camino",
    icon: <TruckIcon className="h-4 w-4" />,
    activeColor: "text-indigo-700 font-bold",
    doneColor: "text-gray-400",
  },
  {
    status: "DELIVERED",
    label: "Entregado",
    icon: <CheckCircleIcon className="h-4 w-4" />,
    activeColor: "text-emerald-700 font-bold",
    doneColor: "text-gray-400",
  },
];

export const STEP_ORDER: Record<ShipmentStatus, number> = {
  LABEL_CREATED: -1, // No se muestra en el timeline
  IN_TRANSIT: 0,
  DELIVERED: 1,
};

interface ShipmentTimelineProps {
  order: Pick<BuyerOrder, "status" | "trackingId" | "courier">;
  currentShipmentStatus: ShipmentStatus | null;
  currentStepIndex: number;
  shippingAppUrl?: string;
}

export default function ShipmentTimeline({ order, currentStepIndex, shippingAppUrl }: ShipmentTimelineProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-5">
      <h2 className="mb-5 text-sm font-extrabold uppercase tracking-wider text-[#1F2937]">
        Estado del envío
      </h2>

      {order.trackingId ? (
        <div className="space-y-5">
          {/* Timeline de pasos */}
          <div className="flex items-start gap-0">
            {SHIPMENT_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;

              return (
                <div key={step.status} className="flex-1 flex flex-col items-center relative">
                  {/* Línea conectora izquierda */}
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 transition-colors ${
                        isPast || isActive ? "bg-[#485696]" : "bg-gray-200"
                      }`}
                    />
                  )}

                  {/* Círculo */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-all ${
                      isActive
                        ? "border-[#485696] bg-[#485696] text-white shadow-md"
                        : isPast
                        ? "border-gray-300 bg-white text-gray-400"
                        : "border-gray-200 bg-white text-gray-300"
                    }`}
                  >
                    {isPast ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="text-xs">{step.icon}</span>
                    )}
                  </div>

                  {/* Etiqueta */}
                  <p
                    className={`mt-2 text-center text-[11px] leading-tight ${
                      isFuture
                        ? "text-gray-300 font-normal"
                        : isPast
                        ? "text-gray-400 font-normal"
                        : step.activeColor
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Datos del envío: Courier + Tracking ID */}
          <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mb-1">
                Courier
              </p>
              <p className="font-bold text-[#1F2937]">{order.courier ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mb-1">
                Tracking ID
              </p>
              <p className="font-mono font-bold text-[#1F2937] text-xs truncate">
                {order.trackingId}
              </p>
            </div>
          </div>

          {/* Botón "Seguir envío" o placeholder */}
          {shippingAppUrl ? (
            <a
              id="tracking-link"
              href={`${shippingAppUrl.replace(/\/$/, "")}/track/${order.trackingId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#485696] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
              Seguir envío en {order.courier ?? "la app de envíos"} →
            </a>
          ) : (
            <a
              href={`${(process.env.NEXT_PUBLIC_SHIPPING_APP_URL || "").replace(/\/$/, "")}/track/${order.trackingId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#485696] bg-transparent py-3 text-sm font-bold text-[#485696] transition hover:bg-[#485696]/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
              Ver seguimiento →
            </a>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-[#6B7280]">
          <EnvelopeOpenIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
          <p>
            {order.status === "PENDING_PAYMENT"
              ? "El envío se gestiona una vez confirmado el pago."
              : order.status === "PAYMENT_FAILED" || order.status === "CANCELLED"
              ? "El envío no se realizará ya que la orden fue cancelada o el pago rechazado."
              : "Los datos de envío estarán disponibles cuando el vendedor despache tu pedido."}
          </p>
        </div>
      )}
    </div>
  );
}
