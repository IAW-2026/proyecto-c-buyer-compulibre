import { PaymentInitRequest, PaymentInitResponse } from "@/types";
import { fetchWithTimeout } from "./http-client";

const PAYMENTS_APP_API_URL = process.env.PAYMENTS_APP_API_URL || "http://localhost:3002";

/**
 * Llama a POST /api/payments/checkout en la Payments App.
 */
export async function initPayment(
  request: PaymentInitRequest
): Promise<PaymentInitResponse> {
  const url = `${PAYMENTS_APP_API_URL}/api/payments/checkout`;
  
  return fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.PAYMENTS_API_KEY!,
    },
    body: JSON.stringify(request),
  });
}
