import Link from "next/link";
import { SparklesIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface PaymentStatusBannersProps {
  success?: string;
  status: string;
  externalTransactionId: string | null;
  orderId: string;
  totalAmount: number;
}

export default function PaymentStatusBanners({
  success,
  status,
  externalTransactionId,
  orderId,
  totalAmount,
}: PaymentStatusBannersProps) {
  return (
    <>
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
            <Link href="/cart" className="mt-2 inline-block text-xs font-bold text-red-700 underline">
              Volver al carrito
            </Link>
          </div>
        </div>
      )}

      {/* Banner de pago pendiente */}
      {status === "PENDING_PAYMENT" && !success && (
        <div className="mb-6 flex flex-col sm:flex-row items-start gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <ClockIcon className="h-7 w-7 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="font-bold text-amber-800">Falta completar el pago</h2>
            <p className="text-sm text-amber-700 mt-0.5">
              Tu orden está reservada, pero el pago no se ha completado. Podés continuar desde donde dejaste.
            </p>
          </div>
          {externalTransactionId ? (
            <a
              href={`/checkout/mock-payment?txn=${externalTransactionId}&order_id=${orderId}&amount=${totalAmount}`}
              className="mt-2 sm:mt-0 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              Completar pago
            </a>
          ) : null}
        </div>
      )}
    </>
  );
}
