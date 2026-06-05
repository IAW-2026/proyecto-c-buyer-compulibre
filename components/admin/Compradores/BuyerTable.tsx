import Link from "next/link";
import BuyerActionButtons from "./BuyerActionButtons";
import { toggleBuyerStatus, clearUserOrders, resetUser, resetUserOnboarding } from "@/app/admin/actions";
import { BuyerProfile } from "@prisma/client";

export default function BuyerTable({
    buyers,
    totalBuyersCount,
    adminIds,
    page,
    search,
    skip,
    take
}: {
    buyers: BuyerProfile[];
    totalBuyersCount: number;
    adminIds: string[];
    page: number;
    search: string;
    skip: number;
    take: number;
}) {
    return (
        <>
            <div className="relative overflow-x-auto shadow-sm sm:rounded-xl border border-gray-300 bg-white">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-300">
                        <tr>
                            <th scope="col" className="py-4 px-5 font-bold">Comprador</th>
                            <th scope="col" className="py-4 px-5 font-bold">Identificador Clerk</th>
                            <th scope="col" className="py-4 px-5 font-bold">Estado de Cuenta</th>
                            <th scope="col" className="py-4 px-5 font-bold text-right">Acciones Comerciales</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {buyers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-[#6B7280] font-medium">
                                    Ningún comprador coincide con los criterios de búsqueda.
                                </td>
                            </tr>
                        ) : (
                            buyers.map((buyer) => (
                                <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-5 px-5 align-top">
                                        <div className="font-bold text-gray-900 leading-normal">{buyer.fullName || "*No definido*"}</div>
                                        <div className="text-xs text-gray-500 mt-1.5 wrap-break-word whitespace-normal leading-relaxed">
                                            {buyer.defaultShippingAddress ?? "Dirección: No cargada"}
                                        </div>
                                    </td>
                                    <td className="py-5 px-5 font-mono text-xs text-gray-500 align-top break-all min-w-[120px] max-w-[160px]">
                                        {buyer.id}
                                    </td>
                                    <td className="py-5 px-5 align-top">
                                        <div className="flex gap-2 items-center">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                                buyer.isActive 
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                                    : "bg-red-50 text-red-700 border-red-200"
                                            }`}>
                                                {buyer.isActive ? "Activa" : "Suspendida"}
                                            </span>
                                            {adminIds.includes(buyer.id) && (
                                                <span className="inline-flex items-center rounded-full bg-[#485696]/10 border border-[#485696]/20 px-2.5 py-0.5 text-xs font-bold text-[#485696]">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-5 px-5 align-top">
                                        <div className="flex justify-end w-full max-w-[220px] ml-auto">
                                            <BuyerActionButtons
                                                buyerId={buyer.id}
                                                isActive={buyer.isActive}
                                                isAdmin={adminIds.includes(buyer.id)}
                                                onToggleStatus={toggleBuyerStatus}
                                                onResetOnboarding={resetUserOnboarding}
                                                onClearOrders={clearUserOrders}
                                                onHardReset={resetUser}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center text-gray-500 text-sm font-medium mt-4 gap-4">
                <span>Mostrando {buyers.length} de {totalBuyersCount} resultados</span>
                <div className="flex gap-2">
                    {page > 1 && (
                        <Link 
                            href={`/admin?tab=buyers&page=${page - 1}${search ? `&search=${search}` : ''}`} 
                            className="flex items-center justify-center px-4 h-9 text-sm font-bold text-gray-700 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm active:bg-gray-200"
                        >
                            &larr; Anterior
                        </Link>
                    )}
                    {skip + take < totalBuyersCount && (
                        <Link 
                            href={`/admin?tab=buyers&page=${page + 1}${search ? `&search=${search}` : ''}`} 
                            className="flex items-center justify-center px-4 h-9 text-sm font-bold text-gray-700 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm active:bg-gray-200"
                        >
                            Siguiente &rarr;
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
