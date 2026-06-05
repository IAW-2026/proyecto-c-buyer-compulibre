import AdminShippingSimulator from "./AdminShippingSimulator";
import type { ShipmentStatus } from "@/types";
import { BuyerOrder } from "@prisma/client";
import OrdenesEstancadas from "./OrdenesEstancadas";
import EnviosTransito from "./EnviosTransito";

// Componente orquestador de la pestana de Simulador de Envios. Contiene metricas de envios y el panel de control.
export default function Simulador({
    activeShippingOrders,
    stuckOrders
}: {
    activeShippingOrders: BuyerOrder[];
    stuckOrders: number;
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Logística Operativa</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <OrdenesEstancadas value={stuckOrders} />
                <EnviosTransito value={activeShippingOrders.length - stuckOrders} />
            </div>

            {/* Simulador de Envíos */}
            <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#FC7A1E]" />
                    <h2 className="text-lg font-bold text-gray-900">Simulador de Envíos en Curso</h2>
                    <span className="rounded-full bg-[#FC7A1E]/10 border border-[#FC7A1E]/20 px-2 py-0.5 text-[10px] font-bold text-[#FC7A1E] uppercase">
                        Dev
                    </span>
                </div>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                    Utiliza este panel para simular los cambios de estado logísticos que provee la Shipping App externa mediante webhooks.
                </p>

                {activeShippingOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center bg-gray-50/50">
                        <p className="text-sm text-gray-400 font-medium">No hay órdenes con envíos activos en este momento.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {activeShippingOrders.map((order) => (
                            <AdminShippingSimulator
                                key={order.id}
                                orderId={order.id}
                                orderShortId={order.id.slice(-8).toUpperCase()}
                                buyerName={order.buyerId}
                                orderStatus={order.status}
                                shipmentStatus={order.shipmentStatus as ShipmentStatus | null}
                                courier={order.courier}
                                trackingId={order.trackingId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
