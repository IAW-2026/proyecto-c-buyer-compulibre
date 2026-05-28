import { prisma as db } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { toggleBuyerStatus, clearUserOrders, resetUser } from "./actions";
import AdminShippingSimulator from "./AdminShippingSimulator";
import type { ShipmentStatus } from "@/types";

export default async function AdminBuyersPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string };
}) {
    // Validación de Seguridad
    const { sessionClaims } = await auth();

    const role = 
        (sessionClaims?.publicMetadata as { role?: string })?.role || 
        (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
        redirect("/"); // Expulsar si no es admin
    }

    // Parámetros de paginación y búsqueda
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    const take = 10;
    const skip = (page - 1) * take;

    const where = search ? {
        fullName: { contains: search, mode: "insensitive" as const },
    } : {};

    // Consulta a Prisma (orden alfabético)
    const buyers = await db.buyerProfile.findMany({
        where,
        skip,
        take,
        orderBy: {
            fullName: "asc", 
        },
    });

    const total = await db.buyerProfile.count({ where });

    // Órdenes activas para el simulador de envíos (PAID o SHIPPED)
    const activeShippingOrders = await db.buyerOrder.findMany({
        where: { status: { in: ["PAID", "SHIPPED"] } },
        orderBy: { createdAt: "asc" },
        include: { items: { take: 1 } },
    });

    return (
        <div className="min-h-screen bg-[#E7E7E7] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Cabecera del Panel */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1F2937]">Panel de Administración</h1>
                    <p className="text-[#6B7280] mt-2">Gestiona los compradores y revisa el rendimiento de CompuLibre.</p>
                </div>

                {/* Tabs / Navegación */}
                <div className="flex gap-4 mb-6 border-b border-gray-300 pb-4">
                    <div className="px-4 py-2 font-semibold text-[#485696] border-b-2 border-[#485696]">
                        Compradores
                    </div>
                    <div className="px-4 py-2 font-medium text-[#6B7280] hover:text-[#485696] cursor-not-allowed opacity-50">
                        Carritos Abandonados (Próximamente)
                    </div>
                    <div className="px-4 py-2 font-medium text-[#6B7280] hover:text-[#485696] cursor-not-allowed opacity-50">
                        Dashboard (Próximamente)
                    </div>
                </div>

                {/* ── Simulador de Envíos ── */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#FC7A1E]" />
                        <h2 className="text-lg font-extrabold text-[#1F2937]">Simulador de Envíos</h2>
                        <span className="rounded-full bg-[#FC7A1E]/10 border border-[#FC7A1E]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#FC7A1E] uppercase">
                            Etapa 2 — Dev
                        </span>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-4">
                        Órdenes esperando despacho o en curso. Avanzá el estado logístico de cada una.
                    </p>

                    {activeShippingOrders.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
                            <p className="text-sm text-[#6B7280]">No hay órdenes pendientes de envío en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
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

                {/* Contenido: Tabla de Usuarios */}
                <div className="bg-[#FFFFFF] rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-[#1F2937]">Listado de Compradores</h2>
                        
                        <form className="flex items-center" action="/admin" method="GET">
                            <input 
                                type="text" 
                                name="search"
                                defaultValue={search}
                                placeholder="Buscar comprador..." 
                                className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#485696] text-[#1F2937]"
                            />
                            <button type="submit" className="bg-[#485696] text-white px-4 py-2 rounded-r-lg hover:brightness-110 transition-all">
                                Buscar
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 text-[#6B7280]">
                                    <th className="py-3 px-4">Nombre Completo</th>
                                    <th className="py-3 px-4">Clerk ID</th>
                                    <th className="py-3 px-4">Estado</th>
                                    <th className="py-3 px-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buyers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-[#6B7280]">
                                            No se encontraron compradores.
                                        </td>
                                    </tr>
                                ) : (
                                    buyers.map((buyer) => (
                                        <tr key={buyer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-[#1F2937]">{buyer.fullName}</td>
                                            <td className="py-3 px-4 text-sm text-[#6B7280]">{buyer.id}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    buyer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                    {buyer.isActive ? "ACTIVO" : "SUSPENDIDO"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Botón de Suspender (Server Action) */}
                                                    <form action={toggleBuyerStatus}>
                                                        <input type="hidden" name="buyerId" value={buyer.id} />
                                                        <input type="hidden" name="currentStatus" value={String(buyer.isActive)} />
                                                        
                                                        {buyer.isActive ? (
                                                            <button type="submit" className="bg-[#FC7A1E] text-white px-3 py-1.5 rounded-lg hover:brightness-90 transition-all text-xs font-semibold shadow-sm">
                                                                Suspender
                                                            </button>
                                                        ) : (
                                                            <button type="submit" className="bg-[#485696] text-white px-3 py-1.5 rounded-lg hover:brightness-110 transition-all text-xs font-semibold shadow-sm">
                                                                Activar
                                                            </button>
                                                        )}
                                                    </form>

                                                    <form action={clearUserOrders}>
                                                        <input type="hidden" name="buyerId" value={buyer.id} />
                                                        <button type="submit" className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all text-xs font-semibold shadow-sm" title="Borrar historial de compras">
                                                            Borrar Órdenes
                                                        </button>
                                                    </form>

                                                    <form action={resetUser}>
                                                        <input type="hidden" name="buyerId" value={buyer.id} />
                                                        <button type="submit" className="bg-red-800 text-white px-3 py-1.5 rounded-lg hover:bg-red-900 transition-all text-xs font-semibold shadow-sm" title="Borrar compras, carrito y dirección de envío">
                                                            Hard Reset
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Paginación simple */}
                    <div className="flex justify-between items-center mt-6 text-[#6B7280] text-sm">
                        <span>Mostrando {buyers.length} de {total} resultados</span>
                        <div className="flex gap-2">
                            {page > 1 && (
                                <a href={`/admin?page=${page - 1}${search ? `&search=${search}` : ''}`} className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                                    Anterior
                                </a>
                            )}
                            {skip + take < total && (
                                <a href={`/admin?page=${page + 1}${search ? `&search=${search}` : ''}`} className="px-3 py-1 border rounded-lg hover:bg-gray-50">
                                    Siguiente
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
