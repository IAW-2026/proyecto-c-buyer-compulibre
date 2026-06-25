import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import type { BuyerOrderStatus } from "@prisma/client";

import { ShoppingBagIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Mis Compras — CompuLibre",
  description: "Consultá el historial y estado de todas tus compras en CompuLibre.",
};



import { getProductsByIds } from "@/lib/services/seller-app";

function getUnifiedStatus(order: { status: BuyerOrderStatus; shipmentStatus: string | null }) {
  if (order.status === 'CANCELLED') return { label: 'Cancelado', desc: 'La compra fue cancelada', color: 'text-gray-500' };
  if (order.status === 'PAYMENT_FAILED') return { label: 'Pago rechazado', desc: 'Tu pago no pudo procesarse', color: 'text-red-600' };
  if (order.status === 'PENDING_PAYMENT') return { label: 'Pago pendiente', desc: 'Esperando confirmación del pago', color: 'text-amber-600' };
  
  if (order.shipmentStatus === 'DELIVERED') return { label: 'Entregado', desc: 'Recibiste la compra', color: 'text-emerald-600' };
  if (order.shipmentStatus === 'IN_TRANSIT') return { label: 'En camino', desc: 'Tu compra está en viaje', color: 'text-blue-600' };
  if (order.shipmentStatus === 'LABEL_CREATED') return { label: 'Preparando envío', desc: 'El vendedor está preparando tu paquete', color: 'text-blue-600' };
  
  if (order.status === 'PAID') return { label: 'Pagado', desc: 'El pago fue aprobado. Preparando envío.', color: 'text-green-600' };
  if (order.status === 'DELIVERED') return { label: 'Entregado', desc: 'Recibiste la compra', color: 'text-emerald-600' };
  if (order.status === 'SHIPPED') return { label: 'En camino', desc: 'Tu compra está en viaje', color: 'text-blue-600' };
  
  return { label: 'Procesando', desc: 'Estamos procesando tu orden', color: 'text-gray-600' };
}

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const orders = await prisma.buyerOrder.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { take: 1 }, 
    },
  });

  // Fetch images for the first item of each order
  const productIds = Array.from(new Set(orders.map(o => o.items[0]?.externalProductId).filter(Boolean)));
  const products = await getProductsByIds(productIds);
  const imageMap = Object.fromEntries(products.map(p => [p.id, p.image]));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {orders.length > 0 && (
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">
            Mis Compras
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {`${orders.length} ${orders.length === 1 ? "compra" : "compras"} en total.`}
          </p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
          <div className="mb-6 flex items-center justify-center">
            <ShoppingBagIcon className="h-16 w-16 text-[#485696]/30" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">
            Tu primera compra te está esperando
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#6B7280] leading-relaxed">
            Explorá nuestro catálogo y equipá tu PC con el mejor hardware.
          </p>
          <Link
            href="/products"
            className="mt-8 rounded-xl bg-[#485696] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-95 hover:scale-[1.02] active:scale-[0.98]"
          >
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const previewItem = order.items[0];
            const unifiedStatus = getUnifiedStatus(order);
            const imageUrl = previewItem ? imageMap[previewItem.externalProductId] : null;

            return (
              <div
                key={order.id}
                className="group relative flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition duration-200 hover:shadow-md hover:border-[#485696]/40 cursor-pointer"
              >
                {/* Enlace invisible para toda la tarjeta (z-10 para cubrir el contenido) */}
                <Link
                  href={`/orders/${order.id}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Ver orden ${order.id}`}
                />

                {/* Header de la tarjeta: Fecha arriba */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3.5 bg-gray-50/50">
                  <span className="text-sm font-bold text-gray-900">
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="text-sm text-[#485696] group-hover:text-[#323d6b] font-medium transition-colors">
                    Ver detalle
                  </span>
                </div>

                {/* Body de la tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6 gap-4 sm:gap-6">
                  
                  {/* Agrupamos Imagen y Textos para que SIEMPRE estén lado a lado (incluso en móvil) */}
                  <div className="flex flex-row items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    
                    {/* Contenedor de la Imagen a la izquierda */}
                    <div className="shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-1.5 sm:p-2 shadow-sm">
                      {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={imageUrl} 
                          alt={previewItem?.productName || "Producto"} 
                          className="object-contain w-full h-full" 
                        />
                      ) : (
                        <PhotoIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" aria-hidden="true" />
                      )}
                    </div>

                    {/* Información y estado realista */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className={`text-sm sm:text-base font-extrabold ${unifiedStatus.color}`}>
                        {unifiedStatus.label}
                      </h3>
                      <p className="text-[13px] sm:text-[15px] text-gray-800 mt-0.5 sm:mt-1 font-medium">
                        {unifiedStatus.desc}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-2 sm:mt-3 line-clamp-1">
                        {previewItem?.productName ?? "Orden de compra"}
                        {order.items.length > 1 && (
                          <span className="ml-1 font-medium text-gray-400">
                            (+{order.items.length - 1} más)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Botón extra en caso de pago pendiente (z-20 para ser clickeable) */}
                  {order.status === "PENDING_PAYMENT" && order.externalTransactionId && (
                    <div className="mt-2 sm:mt-0 sm:ml-auto relative z-20 shrink-0 w-full sm:w-auto">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-block w-full sm:w-auto text-center rounded-lg bg-[#FC7A1E] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e66a15] hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Completar pago
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
