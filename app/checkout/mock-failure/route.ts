import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const orderId = searchParams.get("order_id");
  const txn = searchParams.get("txn");

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "MISSING_PARAMS", message: "order_id requerido." },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const tokenToSend = process.env.SERVICE_TOKEN ?? "";

  try {
    const webhookRes = await fetch(
      `${appUrl}/api/orders/${orderId}/payment-webhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-service-token": tokenToSend,
        },
        body: JSON.stringify({
          transactionId: txn ?? `txn_mock_${Date.now()}`,
          status: "REJECTED",
          paymentMethod: "mock",
        }),
      }
    );

    if (!webhookRes.ok) {
      const error = await webhookRes.json();
      console.error("Error del payment-webhook (failure):", error);
    }
  } catch (err) {
    console.error("Error al llamar al payment-webhook internamente:", err);
  }

  redirect(`/orders/${orderId}?success=false`);
}
