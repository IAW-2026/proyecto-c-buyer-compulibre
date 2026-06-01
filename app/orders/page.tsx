import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import type { BuyerOrderStatus } from "@prisma/client";
import type { ShipmentStatus } from "@/types";
import { ArchiveBoxIcon, TruckIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Mis Órdenes — CompuLibre",
  description: "Consultá el historial y estado de todas tus compras en CompuLibre.",
};

const SHIPMENT_STATUS_MAP: Record<ShipmentStatus, StatusBadgeConfig> = {
  LABEL_CREATED: {
    label: "Etiqueta creada",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  IN_TRANSIT: {
    label: "En camino",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  DELIVERED: {
    label: "Entregado",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

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
  }).format(new Date(date));

interface StatusBadgeConfig {
  label: string;
  className: string;
}

const STATUS_MAP: Record<BuyerOrderStatus, StatusBadgeConfig> = {
  PENDING_PAYMENT: {
    label: "Pago pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Pagado",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  SHIPPED: {
    label: "En camino",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DELIVERED: {
    label: "Entregado",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
  PAYMENT_FAILED: {
    label: "Pago rechazado",
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const orders = await prisma.buyerOrder.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { take: 1 }, // Solo para mostrar el nombre del primer item como preview
    },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {orders.length > 0 && (
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">
            Mis órdenes
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {`${orders.length} ${orders.length === 1 ? "orden" : "órdenes"} en total.`}
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
          <div className="mb-6 flex items-center justify-center">
            <ArchiveBoxIcon className="h-16 w-16 text-[#485696]/30" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
            Sin órdenes aún
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#6B7280] leading-relaxed">
            Cuando realices una compra, la vas a ver acá con su estado actualizado.
          </p>
          <Link
            href="/products"
            className="mt-8 rounded-xl bg-[#485696] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 hover:scale-[1.02] active:scale-[0.98]"
          >
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const badge = STATUS_MAP[order.status];
            const previewItem = order.items[0];

            return (
              <div
                key={order.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md hover:border-[#485696]/30 duration-200"
              >
                {/* Enlace invisible sobre toda la tarjeta para hacerla clickeable entera */}
                <Link
                  href={`/orders/${order.id}`}
                  className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#485696] focus:ring-offset-2"
                  aria-label={`Ver orden ${order.id}`}
                />

                {/* Info izquierda */}
                <div className="flex flex-col gap-1 min-w-0 relative z-10 pointer-events-none">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {order.shipmentStatus && SHIPMENT_STATUS_MAP[order.shipmentStatus as ShipmentStatus] && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          SHIPMENT_STATUS_MAP[order.shipmentStatus as ShipmentStatus].className
                        }`}
                      >
                        <TruckIcon className="h-3 w-3" aria-hidden="true" />
                        {SHIPMENT_STATUS_MAP[order.shipmentStatus as ShipmentStatus].label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#1F2937] truncate">
                    {previewItem?.productName ?? "Orden de compra"}
                    {order.items.length > 1 && (
                      <span className="ml-1 font-normal text-[#6B7280]">
                        +{order.items.length - 1} más
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatDate(order.createdAt)} ·{" "}
                    <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                  </p>
                </div>

                {/* Info derecha */}
                <div className="flex items-center gap-4 shrink-0 relative z-10 pointer-events-none">
                  <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
                    <span className="text-base font-extrabold text-[#1F2937]">
                      {formatCurrency(order.totalAmount.toNumber())}
                    </span>
                    {order.status === "PENDING_PAYMENT" && order.externalTransactionId && (
                      <a
                        href={`/checkout/mock-payment?txn=${order.externalTransactionId}&order_id=${order.id}&amount=${order.totalAmount.toNumber()}`}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Pagar ahora
                      </a>
                    )}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#9CA3AF] group-hover:text-[#485696] transition-colors"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
