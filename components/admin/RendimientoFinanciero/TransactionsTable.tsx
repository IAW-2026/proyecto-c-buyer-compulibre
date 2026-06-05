import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { BuyerOrder } from "@prisma/client";

type OrderWithBuyer = BuyerOrder & { buyer: { fullName: string | null } };

// Tabla que lista las ultimas ordenes de compra concretadas y su desglose financiero.
export default function TransactionsTable({ 
    recentPaidOrders, 
    sortCol, 
    sortDir 
}: { 
    recentPaidOrders: OrderWithBuyer[]; 
    sortCol?: string; 
    sortDir?: string; 
}) {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(value);

    return (
        <div>
            <h4 className="text-md font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Últimas Transacciones</h4>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-auto shadow-sm max-h-[400px]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                            {[
                                { id: "fecha", label: "Fecha", align: "left" },
                                { id: "comprador", label: "Comprador", align: "left" },
                                { id: "estado", label: "Estado", align: "left" },
                                { id: "monto", label: "Monto", align: "right" }
                            ].map((col) => {
                                const isSorted = sortCol === col.id;
                                const nextDir = isSorted && sortDir === "desc" ? "asc" : "desc";
                                return (
                                    <th key={col.id} className={`px-5 py-3.5 font-bold text-gray-600 ${col.align === "right" ? "text-right" : "text-left"}`}>
                                        <Link 
                                            href={`/admin?tab=metrics&sortCol=${col.id}&sortDir=${nextDir}`}
                                            className={`inline-flex items-center gap-1 hover:text-gray-900 transition-colors ${col.align === "right" ? "flex-row-reverse" : ""}`}
                                        >
                                            {col.label}
                                            {isSorted ? (
                                                sortDir === "asc" ? <ChevronUpIcon className="w-4 h-4 text-gray-900" /> : <ChevronDownIcon className="w-4 h-4 text-gray-900" />
                                            ) : (
                                                <ChevronUpDownIcon className="w-4 h-4 opacity-30" />
                                            )}
                                        </Link>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recentPaidOrders.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-8 text-center text-gray-400 font-medium">
                                    Aún no se han registrado transacciones.
                                </td>
                            </tr>
                        ) : (
                            recentPaidOrders.map(order => {
                                let statusLabel = "";
                                let statusColor = "";
                                switch (order.status) {
                                    case "PENDING_PAYMENT": statusLabel = "Pendiente"; statusColor = "bg-amber-50 text-amber-700 border-amber-200"; break;
                                    case "PAID": statusLabel = "Aprobado"; statusColor = "bg-green-50 text-green-700 border-green-200"; break;
                                    case "SHIPPED": statusLabel = "En camino"; statusColor = "bg-blue-50 text-blue-700 border-blue-200"; break;
                                    case "DELIVERED": statusLabel = "Entregado"; statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200"; break;
                                    case "CANCELLED": statusLabel = "Cancelado"; statusColor = "bg-gray-100 text-gray-500 border-gray-200"; break;
                                    case "PAYMENT_FAILED": statusLabel = "Rechazado"; statusColor = "bg-red-50 text-red-600 border-red-200"; break;
                                    default: statusLabel = order.status; statusColor = "bg-gray-50 text-gray-700 border-gray-200"; break;
                                }

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-4 text-gray-500 font-medium whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString("es-AR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-gray-900">{order.buyer.fullName || "*No definido*"}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-bold rounded-lg border ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className={`px-5 py-4 text-right font-extrabold whitespace-nowrap ${["PAID", "SHIPPED", "DELIVERED"].includes(order.status) ? "text-emerald-600" : "text-gray-400"}`}>
                                            {formatCurrency(Number(order.totalAmount))}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
