import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import type { BuyerOrderStatus } from "@prisma/client";
import type { ShipmentStatus } from "@/types";
import ShippingSimulationPanel from "./ShippingSimulationPanel";
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  ArchiveBoxIcon,
  NoSymbolIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
  EnvelopeOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// ─── Mapas de UI ──────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  className: string;
}

const STATUS_MAP: Record<BuyerOrderStatus, StatusConfig> = {
  PENDING_PAYMENT: {
    label: "Pago pendiente",
    icon: <ClockIcon className="h-3.5 w-3.5" />,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Pagado — en preparación",
    icon: <CheckCircleIcon className="h-3.5 w-3.5" />,
    className: "bg-green-50 text-green-700 border-green-200",
  },
  SHIPPED: {
    label: "En camino",
    icon: <TruckIcon className="h-3.5 w-3.5" />,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DELIVERED: {
    label: "Entregado",
    icon: <ArchiveBoxIcon className="h-3.5 w-3.5" />,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelado",
    icon: <NoSymbolIcon className="h-3.5 w-3.5" />,
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
  PAYMENT_FAILED: {
    label: "Pago rechazado",
    icon: <XCircleIcon className="h-3.5 w-3.5" />,
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

// Pasos del timeline en orden cronológico
const SHIPMENT_STEPS: Array<{
  status: ShipmentStatus;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
  doneColor: string;
}> = [
  {
    status: "LABEL_CREATED",
    label: "Despachado",
    icon: <ClipboardDocumentIcon className="h-4 w-4" />,
    activeColor: "text-blue-700 font-bold",
    doneColor: "text-gray-400",
  },
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

const STEP_ORDER: Record<ShipmentStatus, number> = {
  LABEL_CREATED: 0,
  IN_TRANSIT: 1,
  DELIVERED: 2,
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value));

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

// ─── Page ─────────────────────────────────────────────────────────────────────

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; event?: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Orden #${id.slice(-8).toUpperCase()} — CompuLibre`,
  };
}

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const roles =
    (sessionClaims?.publicMetadata as { roles?: string[] })?.roles ?? [];
  const isAdmin = roles.includes("admin");

  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.buyerOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  // 404 si no existe o no pertenece al usuario (autorización)
  if (!order || order.buyerId !== userId) {
    notFound();
  }

  const badge = STATUS_MAP[order.status];
  const shippingAppUrl = process.env.NEXT_PUBLIC_SHIPPING_APP_URL;

  const subtotal = order.items.reduce(
    (sum, i) => sum + Number(i.unitPrice) * i.quantity,
    0
  );

  const currentShipmentStatus = order.shipmentStatus as ShipmentStatus | null;
  const currentStepIndex =
    currentShipmentStatus !== null ? STEP_ORDER[currentShipmentStatus] : -1;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">

      {/* Volver */}
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#485696] hover:underline"
      >
        ← Mis órdenes
      </Link>

      {/* Banner de resultado de pago */}
      {success === "true" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-green-50 border border-green-200 p-5">
          <SparklesIcon className="h-7 w-7 shrink-0 text-green-600 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-green-800">¡Pago aprobado!</h2>
            <p className="text-sm text-green-700 mt-0.5">
              Tu compra fue confirmada. Te avisaremos cuando tu pedido sea despachado.
            </p>
          </div>
        </div>
      )}
      {success === "false" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-5">
          <XCircleIcon className="h-7 w-7 shrink-0 text-red-500 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-red-800">Pago rechazado</h2>
            <p className="text-sm text-red-700 mt-0.5">
              No pudimos procesar tu pago. Podés volver a intentarlo desde tu carrito.
            </p>
            <Link
              href="/cart"
              className="mt-2 inline-block text-xs font-bold text-red-700 underline"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      )}

      {/* Encabezado de la orden */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#1F2937]">
            Orden{" "}
            <span className="font-mono text-[#485696]">
              #{order.id.slice(-8).toUpperCase()}
            </span>
          </h1>
          <p className="mt-1 text-xs text-[#6B7280]">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${badge.className}`}
        >
          {badge.icon} {badge.label}
        </span>
      </div>

      <div className="space-y-5">
        {/* Panel de simulación de envío — solo admins */}
        {isAdmin && (
          <ShippingSimulationPanel
            orderId={order.id}
            orderStatus={order.status}
            shipmentStatus={currentShipmentStatus}
          />
        )}

        {/* ── Sección de envío (arriba del todo) ── */}
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
                  href={`${shippingAppUrl}/tracking/${order.trackingId}`}
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
                <div className="rounded-xl border border-dashed border-gray-300 py-3 text-center text-xs text-[#9CA3AF]">
                  Seguimiento disponible próximamente
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-[#6B7280]">
              <EnvelopeOpenIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
              <p>
                {order.status === "PENDING_PAYMENT" || order.status === "PAYMENT_FAILED"
                  ? "El envío se gestiona una vez confirmado el pago."
                  : "Los datos de envío estarán disponibles cuando el vendedor despache tu pedido."}
              </p>
            </div>
          )}
        </div>

        {/* ── Productos comprados ── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1F2937]">
              Productos
            </h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1F2937] line-clamp-2">
                    {item.productName}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {item.quantity} × {formatCurrency(item.unitPrice.toNumber())}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-[#1F2937]">
                  {formatCurrency(Number(item.unitPrice) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {/* Totales */}
          <div className="border-t border-gray-100 px-6 py-4 space-y-2">
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>Envío</span>
              <span>
                {Number(order.totalAmount) - subtotal === 0
                  ? "Gratis"
                  : formatCurrency(Number(order.totalAmount) - subtotal)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="font-bold text-[#1F2937]">Total</span>
              <span className="text-lg font-extrabold text-[#1F2937]">
                {formatCurrency(order.totalAmount.toNumber())}
              </span>
            </div>
          </div>
        </div>

        {/* Referencia de transacción */}
        {order.externalTransactionId && (
          <p className="text-center text-[10px] text-[#9CA3AF] font-mono">
            Ref. transacción: {order.externalTransactionId}
          </p>
        )}
      </div>
    </main>
  );
}
