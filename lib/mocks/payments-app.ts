import {
  PaymentInitRequest,
  PaymentInitResponse,
} from "@/types";

/**
 * Simula POST /api/payments/checkout en la Payments App.
 * En Etapa 3 se reemplaza por un fetch real con SERVICE_TOKEN.
 *
 * Retorna una URL de checkout falsa y un transactionId generado localmente.
 */
export async function initMockPayment(
  request: PaymentInitRequest
): Promise<PaymentInitResponse> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 200));

  const transactionId = `txn_mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  return {
    transactionId,
    checkoutUrl: `/checkout/mock-payment?txn=${transactionId}&order_id=${request.orderReference}&amount=${request.amount}`,
  };
}
