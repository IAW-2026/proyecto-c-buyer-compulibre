"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellIcon, TruckIcon, ArchiveBoxArrowDownIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import type { ShipmentStatus } from "@/types";

type NotifiableStatus = "LABEL_CREATED" | "IN_TRANSIT";

// Solo notificamos estos dos eventos (DELIVERED excluido según diseño)
const NOTIFIABLE_STATUSES: ShipmentStatus[] = ["LABEL_CREATED", "IN_TRANSIT"];

const STATUS_CONFIG: Record<
  NotifiableStatus,
  { label: string; description: string; icon: React.ReactNode; color: string }
> = {
  LABEL_CREATED: {
    label: "Pedido despachado",
    description: "El vendedor generó la etiqueta de envío.",
    icon: <ArchiveBoxArrowDownIcon className="h-4 w-4" />,
    color: "text-blue-600",
  },
  IN_TRANSIT: {
    label: "Paquete en tránsito",
    description: "Tu paquete está en camino a tu domicilio.",
    icon: <TruckIcon className="h-4 w-4" />,
    color: "text-indigo-600",
  },
};

const LS_KEY = "compulibre_read_notifications";

interface OrderNotification {
  orderId: string;
  shipmentStatus: NotifiableStatus;
  /** Timestamp de cuando lo detectamos — más reciente = número mayor */
  detectedAt: number;
}

function loadReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function saveReadSet(set: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...set]));
  } catch {}
}

/** Clave única para cada (orderId, status) */
const notifKey = (orderId: string, status: string) => `${orderId}:${status}`;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // useRef para que el polling siempre lea el set actualizado (evita el bug de closure stale)
  const readSetRef = useRef<Set<string>>(new Set());
  // Mapa interno de orderId → último estado conocido (sin trigger de re-render)
  const knownStates = useRef<Record<string, string>>({});
  // Lista persistente de notificaciones detectadas con timestamps
  const detectedNotifs = useRef<OrderNotification[]>([]);

  // ── Inicializar readSetRef desde localStorage ──────────────────────────────
  useEffect(() => {
    readSetRef.current = loadReadSet();
  }, []);

  // ── Polling ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const orders: { id: string; shipmentStatus: string | null }[] =
          await res.json();

        let changed = false;

        for (const order of orders) {
          const status = order.shipmentStatus as ShipmentStatus | null;
          if (!status || !NOTIFIABLE_STATUSES.includes(status)) continue;

          const prev = knownStates.current[order.id];

          if (prev !== status) {
            knownStates.current[order.id] = status;
            const key = notifKey(order.id, status);

            const alreadyDetected = detectedNotifs.current.some(
              (n) => notifKey(n.orderId, n.shipmentStatus) === key
            );
            if (!alreadyDetected) {
              detectedNotifs.current = [
                { orderId: order.id, shipmentStatus: status as NotifiableStatus, detectedAt: Date.now() },
                ...detectedNotifs.current,
              ];
              changed = true;
            }
          }
        }

        if (changed || detectedNotifs.current.length !== notifications.length) {
          const sorted = [...detectedNotifs.current].sort(
            (a, b) => b.detectedAt - a.detectedAt
          );
          setNotifications(sorted);
          // Siempre usa readSetRef.current — nunca queda stale
          const unread = sorted.filter(
            (n) => !readSetRef.current.has(notifKey(n.orderId, n.shipmentStatus))
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("NotificationBell polling error:", err);
      }
    };

    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cerrar dropdown al hacer click fuera ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Marcar todas como leídas y abrir/cerrar dropdown ─────────────────────
  const handleOpen = () => {
    // Actualizar el ref Y localStorage con todas las notificaciones actuales
    notifications.forEach((n) =>
      readSetRef.current.add(notifKey(n.orderId, n.shipmentStatus))
    );
    saveReadSet(readSetRef.current);
    setUnreadCount(0);
    setOpen((prev) => !prev);
  };

  // ── Marcar como leída al hacer click en una notificación individual ────────
  const handleNotifClick = (orderId: string, status: NotifiableStatus) => {
    readSetRef.current.add(notifKey(orderId, status));
    saveReadSet(readSetRef.current);
    // Recalcular el badge con el ref actualizado
    setUnreadCount(
      notifications.filter(
        (n) => !readSetRef.current.has(notifKey(n.orderId, n.shipmentStatus))
      ).length
    );
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* ── Botón campana ── */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        aria-label={`Notificaciones${unreadCount > 0 ? ` — ${unreadCount} sin leer` : ""}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="h-5 w-5 text-[#FC7A1E]" aria-hidden="true" />
        ) : (
          <BellIcon className="h-5 w-5" aria-hidden="true" />
        )}

        {/* Badge de conteo */}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FC7A1E] text-[10px] font-bold text-white ring-2 ring-[#485696]"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          id="notification-dropdown"
          role="dialog"
          aria-label="Panel de notificaciones"
          className="absolute right-0 top-full mt-2 z-50 w-80 origin-top-right"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl ring-1 ring-black/5">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-extrabold text-[#1F2937]">Notificaciones</p>
              {notifications.length > 0 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                  {notifications.length}
                </span>
              )}
            </div>

            {/* Lista */}
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
                <BellIcon className="h-8 w-8 opacity-40" />
                <p className="text-xs font-medium">Sin notificaciones por ahora</p>
              </div>
            ) : (
              <ul className="max-h-80 divide-y divide-gray-50 overflow-y-auto">
                {notifications.map((notif) => {
                  const config = STATUS_CONFIG[notif.shipmentStatus];
                  const key = notifKey(notif.orderId, notif.shipmentStatus);
                  const orderShort = notif.orderId.slice(-8).toUpperCase();

                  return (
                    <li key={key}>
                      <Link
                        href={`/orders/${notif.orderId}`}
                        onClick={() => handleNotifClick(notif.orderId, notif.shipmentStatus)}
                        className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-gray-50"
                      >
                        <span className={`mt-0.5 shrink-0 ${config.color}`} aria-hidden="true">
                          {config.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#1F2937] leading-snug">
                            {config.label}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#6B7280] leading-snug">
                            {config.description}
                          </p>
                          <p className="mt-1 text-[10px] font-mono font-semibold text-[#485696]">
                            Orden #{orderShort}
                          </p>
                        </div>
                        <span className="shrink-0 self-center text-gray-300">›</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2.5">
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-semibold text-[#485696] transition hover:underline"
              >
                Ver todas mis compras →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
