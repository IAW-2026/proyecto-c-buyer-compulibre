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
  const tokenToSend = process.env.SERVICE_TOKEN ?? "";
  console.log(`[MOCK-SUCCESS DEBUG] Intentando enviar token: '${tokenToSend}'`);

  try {
    const webhookRes = await fetch(
      `${appUrl}/api/orders/${orderId}/payment-webhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Incluido para estar preparado para Etapa 3
          "x-service-token": tokenToSend,
          // Reenviamos las cookies del navegador para sortear la protección de Vercel Preview
          ...(request.headers.get("cookie") ? { "Cookie": request.headers.get("cookie") as string } : {}),
        },
        body: JSON.stringify({
          transactionId: txn ?? `txn_mock_${Date.now()}`,
          status: "APPROVED",
          paymentMethod: "mock",
        }),
      }
    );

    if (!webhookRes.ok) {
      const error = await webhookRes.json();
      console.error("Error del payment-webhook (success):", error);
    }
  } catch (err) {
    console.error("Error al llamar al payment-webhook internamente:", err);
  }

  redirect(`/orders/${orderId}?success=true`);
}
