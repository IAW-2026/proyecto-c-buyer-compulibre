"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import type { ShipmentStatus } from "@/types";
import {
  ArchiveBoxArrowDownIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface ToastConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  className: string;
}

const EVENT_TOAST_MAP: Record<ShipmentStatus, ToastConfig> = {
  LABEL_CREATED: {
    icon: <ArchiveBoxArrowDownIcon className="h-5 w-5" />,
    title: "¡Tu pedido fue despachado!",
    message: "El vendedor generó la etiqueta de envío. Tu paquete está en camino.",
    className: "bg-blue-600 text-white",
  },
  IN_TRANSIT: {
    icon: <TruckIcon className="h-5 w-5" />,
    title: "Tu paquete está en tránsito",
    message: "El transportista retiró el paquete. Pronto estará en tu domicilio.",
    className: "bg-indigo-600 text-white",
  },
  DELIVERED: {
    icon: <CheckCircleIcon className="h-5 w-5" />,
    title: "¡Paquete entregado!",
    message: "Tu pedido fue entregado exitosamente en tu domicilio.",
    className: "bg-emerald-600 text-white",
  },
};

const VALID_EVENTS: ShipmentStatus[] = ["LABEL_CREATED", "IN_TRANSIT", "DELIVERED"];

function isShipmentStatus(value: string | null): value is ShipmentStatus {
  return VALID_EVENTS.includes(value as ShipmentStatus);
}

export default function ShippingEventToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Un único estado: null = oculto, ToastConfig = visible.
  // Unificar en un solo estado evita múltiples setState síncronos en el efecto.
  const [activeToast, setActiveToast] = useState<ToastConfig | null>(null);

  useEffect(() => {
    const event = searchParams.get("event");
    if (!isShipmentStatus(event)) return;

    // Usar setTimeout para evitar llamar a setState de forma síncrona dentro del efecto,
    // previniendo el error "cascading renders" del linter.
    const startTimer = setTimeout(() => {
      setActiveToast(EVENT_TOAST_MAP[event]);
    }, 0);

    // Limpiar el query param de la URL sin recargar la página
    const params = new URLSearchParams(searchParams.toString());
    params.delete("event");
    const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, "", newUrl);

    // Auto-dismiss después de 5 segundos
    const endTimer = setTimeout(() => setActiveToast(null), 5000);
    
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [searchParams, pathname]);

  if (!activeToast) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed bottom-6 right-6 z-50 flex w-80 items-start gap-3 rounded-2xl p-4 shadow-2xl
        animate-in slide-in-from-bottom-4 fade-in duration-300
        ${activeToast.className}
      `}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">{activeToast.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold leading-tight">{activeToast.title}</p>
        <p className="mt-0.5 text-xs opacity-90 leading-snug">{activeToast.message}</p>
      </div>
      <button
        onClick={() => setActiveToast(null)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none mt-0.5"
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}
