// TODO (Etapa 3): Eliminar esta ruta de simulación cuando se elimine mock-payment.
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

  const appUrl = request.nextUrl.origin;
  const tokenToSend = process.env.BUYER_API_KEY ?? "";

  try {
    const webhookRes = await fetch(
      `${appUrl}/api/orders/${orderId}/payment-webhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": tokenToSend,
          ...(request.headers.get("cookie") ? { "Cookie": request.headers.get("cookie") as string } : {}),
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
