"use client";

import { useEffect, useState, useRef } from "react";
import type { ShipmentStatus } from "@/types";

interface ToastConfig {
  icon: string;
  title: string;
  message: string;
  className: string;
}

const EVENT_TOAST_MAP: Record<ShipmentStatus, ToastConfig> = {
  LABEL_CREATED: {
    icon: "📦",
    title: "¡Tu pedido fue despachado!",
    message: "El vendedor generó la etiqueta de envío. Tu paquete está en camino.",
    className: "bg-blue-600 text-white",
  },
  IN_TRANSIT: {
    icon: "🚚",
    title: "Tu paquete está en tránsito",
    message: "El transportista retiró el paquete. Pronto estará en tu domicilio.",
    className: "bg-indigo-600 text-white",
  },
  DELIVERED: {
    icon: "✅",
    title: "¡Paquete entregado!",
    message: "Tu pedido fue entregado exitosamente en tu domicilio.",
    className: "bg-emerald-600 text-white",
  },
};

export default function GlobalNotificationSystem() {
  const [activeToast, setActiveToast] = useState<ToastConfig | null>(null);
  
  // Guardamos el historial de lo que ya notificamos para no repetirlo
  // Key: orderId, Value: shipmentStatus
  const notifiedStates = useRef<Record<string, string>>({});

  useEffect(() => {
    // Restaurar historial de notificaciones previas desde localStorage
    try {
      const stored = localStorage.getItem("compulibre_notified_states");
      if (stored) {
        notifiedStates.current = JSON.parse(stored);
      }
    } catch {}

    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const orders: { id: string; shipmentStatus: string | null }[] = await res.json();
        
        for (const order of orders) {
          if (!order.shipmentStatus) continue;
          
          const lastNotifiedStatus = notifiedStates.current[order.id];
          
          // Si el estado es nuevo o cambió respecto a lo que sabíamos
          if (lastNotifiedStatus !== order.shipmentStatus) {
            notifiedStates.current[order.id] = order.shipmentStatus;
            
            // Guardar en localStorage para persistencia
            localStorage.setItem("compulibre_notified_states", JSON.stringify(notifiedStates.current));
            
            // Mostrar el toast
            const config = EVENT_TOAST_MAP[order.shipmentStatus as ShipmentStatus];
            if (config) {
              setActiveToast(config);
              // Auto-dismiss a los 8 segundos
              setTimeout(() => setActiveToast(null), 8000);
            }
          }
        }
      } catch (err) {
        console.error("Error checking notifications:", err);
      }
    };

    // Polling cada 5 segundos
    const interval = setInterval(checkNotifications, 5000);
    // Ejecutar inmediatamente
    checkNotifications();

    return () => clearInterval(interval);
  }, []);

  if (!activeToast) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed bottom-6 right-6 z-9999 flex w-80 items-start gap-3 rounded-2xl p-4 shadow-2xl
        animate-in slide-in-from-bottom-4 fade-in duration-300
        ${activeToast.className}
      `}
    >
      <span className="mt-0.5 text-xl shrink-0">{activeToast.icon}</span>
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
