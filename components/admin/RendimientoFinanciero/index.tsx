import IngresosTotales from "./IngresosTotales";
import TicketPromedio from "./TicketPromedio";
import IngresosRetenidos from "./IngresosRetenidos";
import FugaCapital from "./FugaCapital";
import TransactionsTable from "./TransactionsTable";
import Search from "../Search";
import { BuyerOrder } from "@prisma/client";
import { formatCurrency } from "@/lib/formatters";

type OrderWithBuyer = BuyerOrder & { buyer: { fullName: string | null; id: string } };

// Componente orquestador de la pestana de Rendimiento Financiero. Muestra metricas de ingresos y tabla de transacciones.
export default function RendimientoFinanciero({
    totalSales,
    retainedRevenue,
    averageOrderValue,
    lostCapital,
    recentPaidOrders,
    sortCol,
    sortDir
}: {
    totalSales: number;
    retainedRevenue: number;
    averageOrderValue: number;
    lostCapital: number;
    recentPaidOrders: OrderWithBuyer[];
    sortCol?: string;
    sortDir?: string;
}) {

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Rendimiento Financiero</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <IngresosTotales value={formatCurrency(totalSales)} />
                    <TicketPromedio value={formatCurrency(averageOrderValue)} />
                    <IngresosRetenidos value={formatCurrency(retainedRevenue)} />
                    <FugaCapital value={formatCurrency(lostCapital)} />
                </div>
            </div>

            <div className="flex items-center justify-between mt-8 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Últimas Transacciones</h3>
                <div className="w-full max-w-sm">
                    <Search placeholder="Buscar por ID de orden o comprador..." />
                </div>
            </div>

            <TransactionsTable 
                recentPaidOrders={recentPaidOrders} 
                sortCol={sortCol} 
                sortDir={sortDir} 
            />
        </div>
    );
}
