import { prisma as db } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { toggleBuyerStatus } from "./actions";

export default async function AdminBuyersPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string };
}) {
    // 1. Validación de Seguridad (Regla de la skill)
    const { sessionClaims } = await auth();
    console.log("=== ADMIN ROUTE DEBUG ===");
    console.log("sessionClaims:", JSON.stringify(sessionClaims, null, 2));
    const role = 
        (sessionClaims?.publicMetadata as { role?: string })?.role || 
        (sessionClaims?.metadata as { role?: string })?.role;
    console.log("Resolved role:", role);
    console.log("=========================");

    if (role !== "admin") {
        redirect("/"); // Expulsar si no es admin
    }

    // 2. Parámetros de paginación y búsqueda
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    const take = 10;
    const skip = (page - 1) * take;

    const where = search ? {
        fullName: { contains: search, mode: "insensitive" as const },
    } : {};

    // 3. Consulta a Prisma aplicando la NUEVA REGLA (orden alfabético)
    const buyers = await db.buyerProfile.findMany({
        where,
        skip,
        take,
        orderBy: {
            fullName: "asc", 
        },
    });

    const total = await db.buyerProfile.count({ where });

    return (
        <div className="min-h-screen bg-[#E7E7E7] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Cabecera del Panel */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1F2937]">Panel de Administración</h1>
                    <p className="text-[#6B7280] mt-2">Gestiona los compradores y revisa el rendimiento de CompuLibre.</p>
                </div>

                {/* Tabs / Navegación (Respondiendo a tu duda) */}
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
                                                {/* Botón de Suspender (Server Action) */}
                                                <form action={toggleBuyerStatus}>
                                                    <input type="hidden" name="buyerId" value={buyer.id} />
                                                    <input type="hidden" name="currentStatus" value={String(buyer.isActive)} />
                                                    
                                                    {buyer.isActive ? (
                                                        <button type="submit" className="bg-[#FC7A1E] text-white px-4 py-2 rounded-lg hover:brightness-90 transition-all text-sm font-semibold shadow-sm">
                                                            Suspender
                                                        </button>
                                                    ) : (
                                                        <button type="submit" className="bg-[#485696] text-white px-4 py-2 rounded-lg hover:brightness-110 transition-all text-sm font-semibold shadow-sm">
                                                            Activar
                                                        </button>
                                                    )}
                                                </form>
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
