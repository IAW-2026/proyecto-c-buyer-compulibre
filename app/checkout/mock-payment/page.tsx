import Link from "next/link";
import type { Metadata } from "next";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "Payments App",
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
    <main className="flex min-h-screen items-center justify-center bg-gray-400 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-100">
          {/* Header simple */}
          <div className="px-6 py-6 border-b border-gray-100 text-center">
            <h1 className="text-xl font-bold text-gray-900">Payments app</h1>
            <p className="mt-1 text-sm text-gray-500">Entorno de prueba (Etapa 2)</p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Monto */}
            {amountNumber !== null && (
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium mb-1">Total a pagar</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(amountNumber)}
                </p>
              </div>
            )}

            {/* IDs de referencia con break-all para evitar cortes */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 text-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Orden</span>
                <span className="block font-mono text-gray-900 break-all">{order_id}</span>
              </div>
              <div className="px-4 py-3">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Transacción</span>
                <span className="block font-mono text-gray-900 break-all">{txn}</span>
              </div>
            </div>

            {/* Botones de simulación simples */}
            <div className="space-y-3 pt-2">
              <Link
                id="mock-approve-btn"
                prefetch={false}
                href={`/checkout/mock-success?order_id=${order_id}&txn=${txn}`}
                className="flex w-full items-center justify-center rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                Aprobar Pago
              </Link>

              <Link
                id="mock-reject-btn"
                prefetch={false}
                href={`/checkout/mock-failure?order_id=${order_id}&txn=${txn}`}
                className="flex w-full items-center justify-center rounded-lg bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Rechazar Pago
              </Link>

              <Link
                id="mock-cancel-btn"
                prefetch={false}
                href={`/checkout/mock-cancel?order_id=${order_id}&txn=${txn}`}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar Pago
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
