import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getBuyerProfile } from "@/lib/db/profile";
import { getProductsByIds } from "@/lib/mocks/seller-app";
import CheckoutConfirmButton from "./CheckoutConfirmButton";
import { calculateCartTotals } from "@/lib/utils/cart";
import { formatCurrency } from "@/lib/formatters";
import type { Metadata } from "next";
import { ArrowLeftIcon, MapPinIcon, TruckIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Confirmar Compra — CompuLibre",
  description: "Revisá el resumen de tu compra antes de proceder al pago.",
};

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [profile, cart, orderCount] = await Promise.all([
    getBuyerProfile(),
    prisma.cart.findFirst({
      where: { buyerId: userId, status: "ACTIVE" },
      include: { items: { orderBy: { id: "asc" } } },
    }),
    prisma.buyerOrder.count({ where: { buyerId: userId } }),
  ]);

  // Si el carrito está vacío o no existe, volver al carrito
  if (!cart || cart.items.length === 0) redirect("/cart");

  // Verificar si hay múltiples vendedores (esto se debe resolver en el carrito)
  const uniqueSellers = new Set(cart.items.map((item) => item.sellerId));
  if (uniqueSellers.size > 1) {
    redirect("/cart");
  }

  const hasProfile = !!profile?.defaultShippingAddress;
  if (!hasProfile) {
    // Si no tiene perfil, redirigir al onboarding antes del checkout
    redirect("/onboarding?returnUrl=/checkout");
  }

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
      productName: product?.name ?? item.productName,
    };
  });

  const { subtotal, shippingCost, totalAmount: total, totalItemsCount } = calculateCartTotals(hydratedItems);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50/50 pt-8 pb-16">
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#485696] hover:text-[#374151] transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            <span>Volver al carrito</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Finalizar compra
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Casi listo. Revisá los detalles y confirmá tu pedido.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Columna izquierda: Información y Resumen */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Tarjeta de Dirección de envío */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-gray-900">
                  <MapPinIcon className="h-5 w-5 text-[#485696]" />
                  Dirección de entrega
                </h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-base font-bold text-gray-900">{profile.fullName}</p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                      {profile.defaultShippingAddress}
                    </p>
                    {orderCount > 0 && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        La dirección no se puede editar porque ya registraste compras previas.
                      </p>
                    )}
                  </div>
                  {orderCount === 0 && (
                    <Link
                      href="/onboarding?returnUrl=/checkout"
                      className="text-sm font-semibold text-[#FC7A1E] hover:underline"
                    >
                      Editar
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Tarjeta de Productos */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
                <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-gray-900">
                  <TruckIcon className="h-5 w-5 text-[#485696]" />
                  Tu pedido
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {totalItemsCount} {totalItemsCount === 1 ? "artículo" : "artículos"}
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {hydratedItems.map((item) => (
                  <li key={item.id} className="flex gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
                    {/* Imagen del producto */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    {/* Detalle */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                          {item.productName}
                        </p>
                        <span className="shrink-0 text-base font-extrabold text-gray-900">
                          {formatCurrency(Number(item.cachedPrice) * item.quantity)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        Cantidad: {item.quantity} × {formatCurrency(Number(item.cachedPrice))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Columna derecha: Resumen de pago y CTA */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                  Resumen de la compra
                </h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal de productos</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Costo de envío</span>
                  {shippingCost === 0 ? (
                    <span className="font-bold text-green-600">¡Gratis!</span>
                  ) : (
                    <span className="font-medium text-gray-900">{formatCurrency(shippingCost)}</span>
                  )}
                </div>

                <div className="my-4 border-t border-dashed border-gray-200"></div>

                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-900">Total a pagar</span>
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {formatCurrency(total)}
                  </span>
                </div>

                <div className="pt-6">
                  <CheckoutConfirmButton />
                </div>
                
                <p className="mt-4 text-center text-xs text-gray-500">
                  Al confirmar, aceptás los Términos y Condiciones de CompuLibre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
