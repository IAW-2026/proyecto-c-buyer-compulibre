"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellIcon, TruckIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import { markAllNotificationsAsReadAction } from "@/lib/actions/notifications";

interface DBNotification {
  id: string;
  orderId: string | null;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Polling ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data: DBNotification[] = await res.json();
        
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("NotificationBell polling error:", err);
      }
    };

    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();
    return () => clearInterval(interval);
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
  const handleOpen = async () => {
    setOpen((prev) => !prev);
    
    // Si lo estamos abriendo y hay unread
    if (!open && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // Call server action in background
      await markAllNotificationsAsReadAction();
    }
  };

  const getIconForTitle = (title: string) => {
    if (title.toLowerCase().includes("entregado")) {
      return { icon: <CheckCircleIcon className="h-4 w-4" />, color: "text-emerald-600" };
    }
    // Default: En camino / Tránsito
    return { icon: <TruckIcon className="h-4 w-4" />, color: "text-indigo-600" };
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
                  const { icon, color } = getIconForTitle(notif.title);
                  const orderShort = notif.orderId ? notif.orderId.slice(-8).toUpperCase() : "";

                  return (
                    <li key={notif.id} className={!notif.isRead ? "bg-blue-50/50" : ""}>
                      <Link
                        href={notif.href || "/orders"}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-gray-50"
                      >
                        <span className={`mt-0.5 shrink-0 ${color}`} aria-hidden="true">
                          {icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs leading-snug ${!notif.isRead ? "font-bold text-[#1F2937]" : "font-semibold text-gray-700"}`}>
                            {notif.title}
                          </p>
                          <p className={`mt-0.5 text-[11px] leading-snug ${!notif.isRead ? "text-gray-700 font-medium" : "text-[#6B7280]"}`}>
                            {notif.message}
                          </p>
                          {orderShort && (
                            <p className="mt-1 text-[10px] font-mono font-semibold text-[#485696]">
                              Orden #{orderShort}
                            </p>
                          )}
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
