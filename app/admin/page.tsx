import { prisma as db } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { toggleBuyerStatus, clearUserOrders, resetUser, resetUserOnboarding } from "./actions";
import AdminShippingSimulator from "./AdminShippingSimulator";
import type { ShipmentStatus } from "@/types";
import {
  UserGroupIcon,
  CircleStackIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArchiveBoxXMarkIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default async function AdminBuyersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; tab?: string }>;
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
    const activeTab = params.tab || "metrics"; // tab activa: "metrics" (Panel General) o "buyers" (Compradores)
    const take = 10;
    const skip = (page - 1) * take;

    const where = search ? {
        fullName: { contains: search, mode: "insensitive" as const },
    } : {};

    // 1. Cómputo de Métricas Optimizadas (Promise.all + Agregaciones nativas)
    const [
        salesSum,
        totalBuyers,
        totalCarts,
        convertedCarts,
        buyers,
        totalBuyersCount,
        activeShippingOrders,
        abandonedCarts,
        stuckOrders
    ] = await db.$transaction([
        db.buyerOrder.aggregate({
            _sum: { totalAmount: true },
            where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }
        }),
        db.buyerProfile.count(),
        db.cart.count(),
        db.cart.count({ where: { status: "CONVERTED" } }),
        db.buyerProfile.findMany({
            where,
            skip,
            take,
            orderBy: { fullName: "asc" }
        }),
        db.buyerProfile.count({ where }),
        db.buyerOrder.findMany({
            where: { status: { in: ["PAID", "SHIPPED"] } },
            orderBy: { createdAt: "asc" },
            include: { items: { take: 1 } }
        }),
        db.cart.count({ where: { status: { in: ["CANCELLED", "REJECTED"] } } }),
        db.buyerOrder.count({ where: { status: "PAID" } })
    ]);

    const totalSales = Number(salesSum._sum.totalAmount) || 0;
    const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;
    const averageOrderValue = convertedCarts > 0 ? totalSales / convertedCarts : 0;

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(value);

    return (
        <div className="min-h-screen bg-[#E7E7E7] py-6 sm:py-8">
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
                        <p className="text-[#6B7280] mt-1 text-sm">Gestioná las métricas de la app, despachá envíos y administrá compradores.</p>
                    </div>
                </div>

                {/* Grid con Sidebar e Info Principal */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    
                    {/* Sidebar de Navegación Lateral (Inspirado en test.html) */}
                    <aside className="w-full lg:w-60 shrink-0 h-fit bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                        <ul className="space-y-1 font-medium">
                            <li>
                                <a 
                                    href="/admin?tab=metrics" 
                                    className={`flex items-center px-3 py-2 text-sm rounded-xl transition group ${
                                        activeTab === "metrics" 
                                            ? "bg-[#485696] text-white font-bold shadow-sm" 
                                            : "text-gray-700 hover:bg-gray-50 hover:text-[#485696]"
                                    }`}
                                >
                                    <CircleStackIcon className={`w-5 h-5 mr-3 shrink-0 transition ${
                                        activeTab === "metrics" ? "text-white" : "text-gray-400 group-hover:text-[#485696]"
                                    }`} />
                                    <span>Panel General</span>
                                </a>
                            </li>
                            <li>
                                <a 
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
                                </a>
                            </li>
                            <li>
                                <a 
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
                                    <span>Simulador Envíos</span>
                                </a>
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

                    {/* Contenido Principal */}
                    <div className="flex-1 min-w-0 space-y-6">
                        
                        {/* TAB PANEL GENERAL (Métricas y Simulador de Envíos) */}
                        {activeTab === "metrics" && (
                            <div className="space-y-8">
                                
                                {/* BLOQUE 1: RENDIMIENTO FINANCIERO */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Rendimiento Financiero</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        
                                        {/* Volumen de Ventas */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100 text-green-600 mt-1">
                                                <CurrencyDollarIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volumen Ventas</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{formatCurrency(totalSales)}</h3>
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Ingresos totales generados por todas las órdenes pagadas y entregadas.</p>
                                            </div>
                                        </div>

                                        {/* Ticket Promedio */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 text-emerald-600 mt-1">
                                                <ChartBarIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Promedio</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{formatCurrency(averageOrderValue)}</h3>
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Monto promedio que gasta un usuario cada vez que concreta una compra.</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* BLOQUE 2: EMBUDO DE VENTAS Y USUARIOS */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Embudo y Usuarios</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        
                                        {/* Compradores */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                                                    <UserGroupIcon className="h-5 w-5" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compradores</p>
                                            </div>
                                            <h3 className="text-xl font-extrabold text-gray-900">{totalBuyers}</h3>
                                            <p className="text-xs text-gray-500 mt-2">Usuarios únicos registrados en la plataforma.</p>
                                        </div>

                                        {/* Conversión */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-[#FC7A1E]/10 flex items-center justify-center shrink-0 border border-[#FC7A1E]/20 text-[#FC7A1E]">
                                                    <ShoppingCartIcon className="h-5 w-5" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tasa Conversión</p>
                                            </div>
                                            <h3 className="text-xl font-extrabold text-gray-900">{conversionRate.toFixed(1)}%</h3>
                                            <p className="text-xs text-gray-500 mt-2">Porcentaje de carritos creados que terminan en un pago exitoso.</p>
                                        </div>

                                        {/* Abandonos */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-red-600">
                                                    <ArchiveBoxXMarkIcon className="h-5 w-5" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Carritos Aband.</p>
                                            </div>
                                            <h3 className="text-xl font-extrabold text-gray-900">{abandonedCarts}</h3>
                                            <p className="text-xs text-gray-500 mt-2">Usuarios que armaron un pedido pero no finalizaron el pago.</p>
                                        </div>

                                    </div>
                                </div>

                                {/* BLOQUE 3: OPERACIONES Y LOGÍSTICA */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Logística Operativa</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        
                                        {/* Estancadas */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 text-orange-600 mt-1">
                                                <ClockIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pendientes Despacho</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stuckOrders}</h3>
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Órdenes pagadas que el vendedor aún no ha entregado al correo.</p>
                                            </div>
                                        </div>

                                        {/* Envíos Activos */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 text-amber-600 mt-1">
                                                <TruckIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Envíos en Tránsito</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{activeShippingOrders.length}</h3>
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Paquetes actualmente en manos de la empresa de transporte.</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        )}

                        {/* TAB SIMULADOR DE ENVÍOS */}
                        {activeTab === "simulator" && (
                            <div className="space-y-6">
                                {/* Simulador de Envíos (Logística de la Tienda) */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#FC7A1E]" />
                                        <h2 className="text-lg font-bold text-gray-900">Simulador de Envíos en Curso</h2>
                                        <span className="rounded-full bg-[#FC7A1E]/10 border border-[#FC7A1E]/20 px-2 py-0.5 text-[10px] font-bold text-[#FC7A1E] uppercase">
                                            Dev
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Órdenes que están marcadas como pagadas o despachadas. Permite simular los cambios de estado logísticos que provee la Shipping App externa mediante webhooks.
                                    </p>

                                    {activeShippingOrders.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center">
                                            <p className="text-sm text-gray-400">No hay órdenes con envíos activos en este momento.</p>
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
                        )}

                        {/* TAB COMPRADORES (Lista y Acciones Avanzadas) */}
                        {activeTab === "buyers" && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                                
                                {/* Encabezado de la tabla y Formulario de Búsqueda */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Listado de Compradores</h2>
                                        <p className="text-xs text-gray-400 mt-1">Total registrados: {totalBuyersCount}</p>
                                    </div>
                                    
                                    <form className="relative flex items-center w-full sm:max-w-xs group" action="/admin" method="GET">
                                        <input type="hidden" name="tab" value="buyers" />
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            name="search"
                                            defaultValue={search}
                                            placeholder="Buscar por nombre..." 
                                            className="block w-full rounded-xl border border-gray-300 py-2 pl-9 pr-24 text-sm text-gray-900 focus:border-[#485696] focus:ring-1 focus:ring-[#485696] focus:outline-none"
                                        />
                                        <button 
                                            type="submit" 
                                            className="absolute right-1 top-1 bottom-1 bg-[#485696] text-white px-3 py-1 rounded-lg hover:brightness-110 transition text-xs font-semibold"
                                        >
                                            Buscar
                                        </button>
                                    </form>
                                </div>

                                {/* Tabla Responsiva */}
                                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/50 text-[#6B7280] text-xs font-bold uppercase tracking-wider">
                                                <th className="py-3.5 px-4">Comprador</th>
                                                <th className="py-3.5 px-4">Identificador Clerk</th>
                                                <th className="py-3.5 px-4">Estado Cuenta</th>
                                                <th className="py-3.5 px-4 text-right">Acciones Comerciales</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {buyers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-12 text-[#6B7280]">
                                                        Ningún comprador coincide con los criterios de búsqueda.
                                                    </td>
                                                </tr>
                                            ) : (
                                                buyers.map((buyer) => (
                                                    <tr key={buyer.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <div className="font-bold text-gray-900 leading-normal">{buyer.fullName}</div>
                                                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={buyer.defaultShippingAddress ?? "Sin dirección registrada"}>
                                                                {buyer.defaultShippingAddress ?? "Dirección: No cargada"}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 font-mono text-xs text-gray-500">{buyer.id}</td>
                                                        <td className="py-4 px-4">
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                                                buyer.isActive 
                                                                    ? "bg-green-50 text-green-700 border-green-200" 
                                                                    : "bg-red-50 text-red-700 border-red-200"
                                                            }`}>
                                                                {buyer.isActive ? "Activo" : "Suspendido"}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex justify-end gap-1.5 flex-wrap">
                                                                {/* 1. Suspender / Activar */}
                                                                <form action={toggleBuyerStatus}>
                                                                    <input type="hidden" name="buyerId" value={buyer.id} />
                                                                    <input type="hidden" name="currentStatus" value={String(buyer.isActive)} />
                                                                    
                                                                    {buyer.isActive ? (
                                                                        <button type="submit" className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg transition text-xs font-bold shadow-sm flex items-center gap-1">
                                                                            <NoSymbolIcon className="h-3.5 w-3.5" />
                                                                            Suspender
                                                                        </button>
                                                                    ) : (
                                                                        <button type="submit" className="bg-[#485696] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg transition text-xs font-bold shadow-sm flex items-center gap-1">
                                                                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                                                                            Activar
                                                                        </button>
                                                                    )}
                                                                </form>

                                                                {/* 2. Restablecer Onboarding (No borra órdenes) */}
                                                                <form action={resetUserOnboarding}>
                                                                    <input type="hidden" name="buyerId" value={buyer.id} />
                                                                    <button 
                                                                        type="submit" 
                                                                        className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg transition text-xs font-bold shadow-sm flex items-center gap-1"
                                                                        title="Limpia la dirección del perfil para forzar al usuario a ingresar nuevos datos logísticos sin alterar su historial"
                                                                    >
                                                                        <ArrowPathIcon className="h-3.5 w-3.5" />
                                                                        Re-onboarding
                                                                    </button>
                                                                </form>

                                                                {/* 3. Borrar Órdenes */}
                                                                <form action={clearUserOrders}>
                                                                    <input type="hidden" name="buyerId" value={buyer.id} />
                                                                    <button type="submit" className="bg-gray-50 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-500 px-2.5 py-1.5 rounded-lg transition text-xs font-bold shadow-sm flex items-center gap-1" title="Borrar únicamente historial de órdenes">
                                                                        <TrashIcon className="h-3.5 w-3.5" />
                                                                        Borrar Órdenes
                                                                    </button>
                                                                </form>

                                                                {/* 4. Hard Reset (Comportamiento agresivo de prueba) */}
                                                                <form action={resetUser}>
                                                                    <input type="hidden" name="buyerId" value={buyer.id} />
                                                                    <button type="submit" className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg transition text-xs font-bold shadow-sm flex items-center gap-1" title="Eliminar carritos, compras y dirección">
                                                                        <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
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

                                {/* Paginación Lateral Simple */}
                                <div className="flex justify-between items-center text-[#6B7280] text-xs">
                                    <span>Mostrando {buyers.length} de {totalBuyersCount} resultados</span>
                                    <div className="flex gap-2">
                                        {page > 1 && (
                                            <a 
                                                href={`/admin?tab=buyers&page=${page - 1}${search ? `&search=${search}` : ''}`} 
                                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-semibold"
                                            >
                                                Anterior
                                            </a>
                                        )}
                                        {skip + take < totalBuyersCount && (
                                            <a 
                                                href={`/admin?tab=buyers&page=${page + 1}${search ? `&search=${search}` : ''}`} 
                                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-semibold"
                                            >
                                                Siguiente
                                            </a>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}
                        
                    </div>
                </div>

            </div>
        </div>
    );
}
