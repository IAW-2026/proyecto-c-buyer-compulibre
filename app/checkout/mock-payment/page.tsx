import Link from "next/link";
import type { Metadata } from "next";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "CompuLibre Pay — Simulador de Pago",
  description: "Entorno de simulación de pagos para desarrollo.",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

interface MockPaymentPageProps {
  searchParams: Promise<{
    order_id?: string;
    txn?: string;
    amount?: string;
  }>;
}

export default async function MockPaymentPage({ searchParams }: MockPaymentPageProps) {
  const { order_id, txn, amount } = await searchParams;

  if (!order_id || !txn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-2xl bg-white p-8 shadow-lg text-center max-w-sm">
          <ExclamationTriangleIcon className="mx-auto mb-2 h-10 w-10 text-amber-500" aria-hidden="true" />
          <h1 className="font-bold text-[#1F2937] mb-2">Parámetros inválidos</h1>
          <p className="text-sm text-[#6B7280] mb-4">
            Faltan datos de la transacción.
          </p>
          <Link href="/cart" className="text-sm font-bold text-[#485696] underline">
            Volver al carrito
          </Link>
        </div>
      </main>
    );
  }

  const amountNumber = amount ? Number(amount) : null;

  return (
    // Fondo distinto para simular "salida" de la app CompuLibre
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#1a1f3c] to-[#2d3561] p-4">
      <div className="w-full max-w-md">
        {/* Card de la pasarela simulada */}
        <div className="rounded-3xl bg-white shadow-2xl overflow-hidden">
          {/* Header de la "pasarela" */}
          <div className="bg-[#485696] px-8 pt-8 pb-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="11" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-sm font-bold tracking-widest uppercase opacity-80">
                Pago Seguro
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">CompuLibre Pay</h1>
            <p className="mt-1 text-xs text-white/60">Entorno de simulación · Etapa 2</p>
          </div>

          {/* Cuerpo */}
          <div className="px-8 py-7 space-y-6">
            {/* Monto */}
            {amountNumber !== null && (
              <div className="text-center">
                <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider mb-1">
                  Total a pagar
                </p>
                <p className="text-4xl font-extrabold text-[#1F2937]">
                  {formatCurrency(amountNumber)}
                </p>
              </div>
            )}

            {/* IDs de referencia */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 divide-y divide-gray-200 text-xs">
              <div className="flex justify-between px-4 py-3">
                <span className="font-semibold text-[#6B7280] uppercase tracking-wide">
                  Orden
                </span>
                <span className="font-mono font-bold text-[#1F2937] truncate max-w-[160px]">
                  {order_id}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="font-semibold text-[#6B7280] uppercase tracking-wide">
                  Transacción
                </span>
                <span className="font-mono font-bold text-[#1F2937] truncate max-w-[160px]">
                  {txn}
                </span>
              </div>
            </div>

            {/* Botones de simulación */}
            <div className="space-y-3">
              <Link
                id="mock-approve-btn"
                href={`/checkout/mock-success?order_id=${order_id}&txn=${txn}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-green-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
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
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Aprobar Pago
              </Link>

              <Link
                id="mock-reject-btn"
                href={`/checkout/mock-failure?order_id=${order_id}&txn=${txn}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3.5 text-sm font-extrabold text-red-600 hover:bg-red-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
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
                >
                  <path d="M18 6 6 18" />
                </svg>
                Rechazar Pago
              </Link>

              <Link
                id="mock-cancel-btn"
                href={`/checkout/mock-cancel?order_id=${order_id}&txn=${txn}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-gray-50 py-3.5 text-sm font-extrabold text-gray-600 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
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
                >
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                Cancelar Pago
              </Link>
            </div>

            <p className="text-center text-[10px] text-[#9CA3AF]">
              Este es un entorno de simulación. No se procesará ningún pago real.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/40">
          CompuLibre · Entorno de desarrollo seguro
        </p>
      </div>
    </main>
  );
}
