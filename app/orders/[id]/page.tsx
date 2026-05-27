import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import type { BuyerOrderStatus } from "@prisma/client";
import ShippingSimulationPanel from "./ShippingSimulationPanel";

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

interface StatusConfig {
  label: string;
  icon: string;
  className: string;
}

const STATUS_MAP: Record<BuyerOrderStatus, StatusConfig> = {
  PENDING_PAYMENT: {
    label: "Pago pendiente",
    icon: "⏳",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Pagado — en preparación",
    icon: "✅",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  SHIPPED: {
    label: "En camino",
    icon: "🚚",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DELIVERED: {
    label: "Entregado",
    icon: "📦",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelado",
    icon: "🚫",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
  PAYMENT_FAILED: {
    label: "Pago rechazado",
    icon: "❌",
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
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

  const role = 
    (sessionClaims?.publicMetadata as { role?: string })?.role || 
    (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "admin";

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
          <span className="text-2xl">🎉</span>
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
          <span className="text-2xl">❌</span>
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
        {isAdmin && (
          <ShippingSimulationPanel
            orderId={order.id}
            orderStatus={order.status}
            shipmentStatus={order.shipmentStatus}
          />
        )}

        {/* Ítems comprados */}
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

        {/* Información de envío */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-5">
          <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[#1F2937]">
            Envío
          </h2>

          {order.trackingId ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
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
                  <p className="font-mono font-bold text-[#1F2937]">{order.trackingId}</p>
                </div>
                {order.shipmentStatus && (
                  <div className="col-span-2">
                    <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wide mb-1">
                      Estado del envío
                    </p>
                    <p className="font-bold text-[#1F2937]">{order.shipmentStatus}</p>
                  </div>
                )}
              </div>

              {/* Botón "Seguir envío" — funcionalidad principal de esta pantalla */}
              {shippingAppUrl ? (
                <a
                  id="tracking-link"
                  href={`${shippingAppUrl}/tracking/${order.trackingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#485696] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95 hover:scale-[1.01] active:scale-[0.99]"
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
                  Seguir envío →
                </a>
              ) : (
                <div className="mt-2 rounded-xl border border-dashed border-gray-300 py-3 text-center text-xs text-[#9CA3AF]">
                  Seguimiento disponible próximamente
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-[#6B7280]">
              <span className="text-2xl">📬</span>
              <p>
                {order.status === "PENDING_PAYMENT" || order.status === "PAYMENT_FAILED"
                  ? "El envío se gestiona una vez confirmado el pago."
                  : "Los datos de envío estarán disponibles cuando el vendedor despache tu pedido."}
              </p>
            </div>
          )}
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
