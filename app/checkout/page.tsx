import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getBuyerProfile } from "@/lib/db/profile";
import { getProductsByIds } from "@/lib/mocks/seller-app";
import CheckoutConfirmButton from "./CheckoutConfirmButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirmar Compra — CompuLibre",
  description: "Revisá el resumen de tu compra antes de proceder al pago.",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [profile, cart] = await Promise.all([
    getBuyerProfile(),
    prisma.cart.findFirst({
      where: { buyerId: userId, status: "ACTIVE" },
      include: { items: { orderBy: { id: "asc" } } },
    }),
  ]);

  // Si el carrito está vacío o no existe, volver al carrito
  if (!cart || cart.items.length === 0) redirect("/cart");

  // Hidratar imágenes y nombres actuales desde el mock
  const productIds = cart.items.map((i) => i.externalProductId);
  const productsData = await getProductsByIds(productIds);

  const hydratedItems = cart.items.map((item) => {
    const product = productsData.find((p) => p.id === item.externalProductId);
    return {
      ...item,
      cachedPrice: item.cachedPrice.toString(),
      imageUrl: product?.image ?? "https://placehold.co/80x80?text=?",
      sellerName: product?.sellerName ?? "Vendedor",
    };
  });

  const subtotal = hydratedItems.reduce(
    (sum, i) => sum + Number(i.cachedPrice) * i.quantity,
    0
  );
  const shippingCost = subtotal > 300000 ? 0 : 4999;
  const total = subtotal + shippingCost;
  const totalItemsCount = hydratedItems.reduce((sum, i) => sum + i.quantity, 0);

  // Bloquear checkout si hay problema con el perfil
  const hasProfile = !!profile?.defaultShippingAddress;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#485696] hover:underline"
        >
          ← Volver al carrito
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">
          Confirmar compra
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Revisá el resumen antes de proceder al pago.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Columna izquierda: listado de ítems (solo lectura) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#1F2937]">
                {totalItemsCount} {totalItemsCount === 1 ? "producto" : "productos"}
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {hydratedItems.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-5">
                  {/* Imagen del producto */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Detalle */}
                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#1F2937] leading-snug line-clamp-2">
                        {item.productName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        Cantidad: {item.quantity} · {formatCurrency(Number(item.cachedPrice))} c/u
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-extrabold text-[#1F2937]">
                      {formatCurrency(Number(item.cachedPrice) * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Dirección de envío */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-5">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-[#1F2937]">
              Dirección de entrega
            </h2>
            {hasProfile ? (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">📍</span>
                <div>
                  <p className="text-sm font-semibold text-[#1F2937]">{profile.fullName}</p>
                  <p className="text-sm text-[#6B7280]">{profile.defaultShippingAddress}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-[#FC7A1E] font-medium">
                📢 No tenés una dirección registrada.{" "}
                <Link href="/onboarding?returnUrl=/checkout" className="font-bold underline">
                  Registrá tu dirección →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: resumen y CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-[#1F2937] pb-3 border-b border-gray-100">
              Resumen de pago
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal ({totalItemsCount} productos)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Envío</span>
                {shippingCost === 0 ? (
                  <span className="font-bold text-green-600">Gratis</span>
                ) : (
                  <span>{formatCurrency(shippingCost)}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-bold text-[#1F2937]">Total</span>
              <span className="text-xl font-extrabold text-[#1F2937]">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Métodos de pago aceptados */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Pagos seguros con
              </p>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "Amex", "Naranja X", "Mercado Pago"].map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-[#4B5563] shadow-xs"
                  >
                    {method}
                  </span>
                ))}
              </div>
              <p className="mt-2.5 flex items-center gap-1 text-[10px] text-[#6B7280]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
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
                Transacción cifrada con SSL
              </p>
            </div>

            {/* Botón CTA */}
            <CheckoutConfirmButton disabled={!hasProfile} />

            {!hasProfile && (
              <p className="text-center text-xs text-[#6B7280]">
                Registrá tu dirección para habilitar el pago.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
