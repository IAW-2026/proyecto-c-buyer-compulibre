import type { BuyerOrder } from "@prisma/client";
import OrdenesEstancadas from "./OrdenesEstancadas";
import EnviosTransito from "./EnviosTransito";

// Logística Operativa: métricas de envíos sin simulador manual.
export default function Simulador({
    activeShippingOrders,
    stuckOrders
}: {
    activeShippingOrders: BuyerOrder[];
    stuckOrders: number;
}) {
    const inTransitCount = activeShippingOrders.filter(o => o.status === "SHIPPED").length;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Logística Operativa</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OrdenesEstancadas value={stuckOrders} />
                <EnviosTransito value={inTransitCount} />
            </div>
        </div>
    );
}
