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
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import PaymentStatusBanners from "@/components/Order/PaymentStatusBanners";
import ShipmentTimeline, { STEP_ORDER } from "@/components/Order/ShipmentTimeline";
import OrderProductsList from "@/components/Order/OrderProductsList";
import PendingPaymentActions from "./PendingPaymentActions";
import { formatDate } from "@/lib/formatters";

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
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#485696] hover:underline transition-transform hover:-translate-x-0.5"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        <span>Mis Compras</span>
      </Link>

      {/* Banners */}
      <PaymentStatusBanners
        success={success}
        status={order.status}
        externalTransactionId={order.externalTransactionId}
        orderId={order.id}
        totalAmount={order.totalAmount.toNumber()}
      />

      {/* Botones de acción para pago pendiente */}
      {order.status === "PENDING_PAYMENT" && (
        <PendingPaymentActions orderId={order.id} />
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
        <ShipmentTimeline
          order={order}
          currentShipmentStatus={currentShipmentStatus}
          currentStepIndex={currentStepIndex}
          shippingAppUrl={shippingAppUrl}
        />

        {/* ── Productos comprados ── */}
        <OrderProductsList
          items={order.items}
          subtotal={subtotal}
          totalAmount={order.totalAmount.toNumber()}
        />

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
