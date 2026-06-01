import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  UserGroupIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

import AdminTabContent from "./AdminTabContent";
import AdminTabSkeleton from "./AdminTabSkeleton";

export default async function AdminBuyersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; tab?: string; sortCol?: string; sortDir?: string }>;
}) {
    // Seguridad y Roles
    const { sessionClaims } = await auth();
    const role = 
        (sessionClaims?.publicMetadata as { role?: string })?.role || 
        (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
        redirect("/"); // Expulsar si no es admin
    }

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const search = params.search || "";
    const activeTab = params.tab || "metrics";
    const sortCol = params.sortCol || "fecha";
    const sortDir = params.sortDir || "desc";

    return (
        <div className="min-h-screen bg-[#E6E6E6] py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Cabecera del Panel */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-300/60 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2937] flex items-center gap-2">
                            <span>Panel de Control</span>
                            <span className="rounded-full bg-[#485696]/10 border border-[#485696]/20 px-2 py-0.5 text-xs font-bold text-[#485696]">
                                Admin
                            </span>
                        </h1>
                        <p className="text-[#6B7280] mt-1 text-sm font-medium">Métricas históricas acumuladas · Actualizado en tiempo real</p>
                    </div>
                </div>

                {/* Grid con Sidebar e Info Principal */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    
                    {/* Sidebar de Navegación Lateral */}
                    <aside className="w-full lg:w-60 shrink-0 h-fit bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                        <ul className="space-y-1 font-medium">
                            <li>
                                <Link 
                                    href="/admin?tab=metrics" 
                                    className={`flex items-center px-3 py-2 text-sm rounded-xl transition group ${
                                        activeTab === "metrics" 
                                            ? "bg-[#485696] text-white font-bold shadow-sm" 
                                            : "text-gray-700 hover:bg-gray-50 hover:text-[#485696]"
                                    }`}
                                >
                                    <CurrencyDollarIcon className={`w-5 h-5 mr-3 shrink-0 transition ${
                                        activeTab === "metrics" ? "text-white" : "text-gray-400 group-hover:text-[#485696]"
                                    }`} />
                                    <span>Rendimiento Financiero</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin?tab=carts" 
                                    className={`flex items-center px-3 py-2 text-sm rounded-xl transition group ${
                                        activeTab === "carts" 
                                            ? "bg-[#485696] text-white font-bold shadow-sm" 
                                            : "text-gray-700 hover:bg-gray-50 hover:text-[#485696]"
                                    }`}
                                >
                                    <ShoppingCartIcon className={`w-5 h-5 mr-3 shrink-0 transition ${
                                        activeTab === "carts" ? "text-white" : "text-gray-400 group-hover:text-[#485696]"
                                    }`} />
                                    <span>Análisis de Carritos</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin?tab=simulator" 
                                    className={`flex items-center px-3 py-2 text-sm rounded-xl transition group ${
                                        activeTab === "simulator" 
                                            ? "bg-[#485696] text-white font-bold shadow-sm" 
                                            : "text-gray-700 hover:bg-gray-50 hover:text-[#485696]"
                                    }`}
                                >
                                    <TruckIcon className={`w-5 h-5 mr-3 shrink-0 transition ${
                                        activeTab === "simulator" ? "text-white" : "text-gray-400 group-hover:text-[#485696]"
                                    }`} />
                                    <span>Logística Operativa</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/admin?tab=buyers" 
                                    className={`flex items-center px-3 py-2 text-sm rounded-xl transition group ${
                                        activeTab === "buyers" 
                                            ? "bg-[#485696] text-white font-bold shadow-sm" 
                                            : "text-gray-700 hover:bg-gray-50 hover:text-[#485696]"
                                    }`}
                                >
                                    <UserGroupIcon className={`w-5 h-5 mr-3 shrink-0 transition ${
                                        activeTab === "buyers" ? "text-white" : "text-gray-400 group-hover:text-[#485696]"
                                    }`} />
                                    <span>Compradores</span>
                                </Link>
                            </li>
                            
                            <li className="pt-4 border-t border-gray-100 mt-4">
                                <Link 
                                    href="/products" 
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#485696] rounded-xl transition group"
                                >
                                    <HomeIcon className="w-5 h-5 mr-3 shrink-0 text-gray-400 group-hover:text-[#485696]" />
                                    <span>Ir al Catálogo</span>
                                </Link>
                            </li>
                        </ul>
                    </aside>

                    {/* Contenido Principal (Extraído para habilitar Suspense y cargas parciales) */}
                    <Suspense key={activeTab} fallback={<AdminTabSkeleton />}>
                        <AdminTabContent activeTab={activeTab} page={page} search={search} sortCol={sortCol} sortDir={sortDir} />
                    </Suspense>

                </div>
            </div>
        </div>
    );
}
