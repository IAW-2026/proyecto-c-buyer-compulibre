import { prisma as db } from "@/lib/db/prisma";
import { Suspense } from "react";
import { toggleBuyerStatus, clearUserOrders, resetUser, resetUserOnboarding } from "./actions";
import AdminShippingSimulator from "./AdminShippingSimulator";
import CartStatusChart from "./CartStatusChart";
import BuyerSearchBar from "./BuyerSearchBar";
import BuyerActionButtons from "./BuyerActionButtons";
import type { ShipmentStatus } from "@/types";
import { Prisma } from "@prisma/client";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
  ChartBarIcon,
  ArchiveBoxXMarkIcon,
  BanknotesIcon,
  ArrowTrendingDownIcon,
  NoSymbolIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronUpDownIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";

export default async function AdminTabContent({
    activeTab,
    page,
    search,
    sortCol = "fecha",
    sortDir = "desc"
}: {
    activeTab: string;
    page: number;
    search: string;
    sortCol?: string;
    sortDir?: string;
}) {
    const take = 10;
    const skip = (page - 1) * take;

    const where = search ? {
        fullName: { contains: search, mode: "insensitive" as const },
    } : {};

    let orderQuery: Prisma.BuyerOrderOrderByWithRelationInput = { createdAt: "desc" };
    if (sortCol === "fecha") orderQuery = { createdAt: sortDir as Prisma.SortOrder };
    else if (sortCol === "comprador") orderQuery = { buyer: { fullName: sortDir as Prisma.SortOrder } };
    else if (sortCol === "estado") orderQuery = { status: sortDir as Prisma.SortOrder };
    else if (sortCol === "monto") orderQuery = { totalAmount: sortDir as Prisma.SortOrder };

    // 1. Cómputo Condicional de Métricas (Solo ejecuta las queries necesarias para la pestaña actual)
    const [
        salesSum,
        retainedRevenueSum,
        lostCapitalItems,
        recentPaidOrders,
        metricsConvertedCarts,
        paidOrdersCount
    ] = activeTab === "metrics" ? await db.$transaction([
        db.buyerOrder.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
        db.buyerOrder.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "SHIPPED"] } } }),
        db.cartItem.findMany({ where: { cart: { status: { in: ["CANCELLED", "REJECTED"] } } }, select: { quantity: true, cachedPrice: true } }),
        db.buyerOrder.findMany({ orderBy: orderQuery, take: 15, include: { buyer: { select: { fullName: true } } } }),
        db.cart.count({ where: { status: "CONVERTED" } }),
        db.buyerOrder.count({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } })
    ]) : [{ _sum: { totalAmount: null } }, { _sum: { totalAmount: null } }, [], [], 0, 0];

    const [
        totalCarts,
        convertedCarts,
        cancelledCarts,
        rejectedCarts
    ] = activeTab === "carts" ? await db.$transaction([
        db.cart.count(),
        db.cart.count({ where: { status: "CONVERTED" } }),
        db.cart.count({ where: { status: "CANCELLED" } }),
        db.cart.count({ where: { status: "REJECTED" } })
    ]) : [0, 0, 0, 0];

    const [
        activeShippingOrders,
        stuckOrders
    ] = activeTab === "simulator" ? await db.$transaction([
        db.buyerOrder.findMany({ where: { status: { in: ["PAID", "SHIPPED"] } }, orderBy: { createdAt: "asc" }, include: { items: { take: 1 } } }),
        db.buyerOrder.count({ where: { status: "PAID" } })
    ]) : [[], 0];

    const [
        buyers,
        totalBuyersCount
    ] = activeTab === "buyers" ? await db.$transaction([
        db.buyerProfile.findMany({ where, skip, take, orderBy: { fullName: "asc" } }),
        db.buyerProfile.count({ where })
    ]) : [[], 0];

    let adminIds: string[] = [];
    if (activeTab === "buyers") {
        const client = await clerkClient();
        const users = await client.users.getUserList({ limit: 100 });
        adminIds = users.data
            .filter(u => (u.publicMetadata as { role?: string })?.role === "admin" || (u.privateMetadata as { role?: string })?.role === "admin")
            .map(u => u.id);
    }

    const actualConvertedCarts = activeTab === "metrics" ? metricsConvertedCarts : convertedCarts;

    const totalSales = Number(salesSum._sum.totalAmount) || 0;
    const retainedRevenue = Number(retainedRevenueSum._sum.totalAmount) || 0;
    const conversionRate = totalCarts > 0 ? (actualConvertedCarts / totalCarts) * 100 : 0;
    const averageOrderValue = paidOrdersCount > 0 ? totalSales / paidOrdersCount : 0;
    const lostCapital = lostCapitalItems.reduce((acc, item) => acc + (item.quantity * Number(item.cachedPrice)), 0);
    const activeCarts = totalCarts - actualConvertedCarts - cancelledCarts - rejectedCarts;

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(value);

    return (
        <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                        
                        {/* TAB: RENDIMIENTO FINANCIERO */}
                        {activeTab === "metrics" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Rendimiento Financiero</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        
                                        {/* Volumen de Ventas */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100 text-green-600 mt-1">
                                                <CurrencyDollarIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Totales</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{formatCurrency(totalSales)}</h3>
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Total histórico generado por todas las órdenes pagadas y entregadas.</p>
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
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Monto promedio histórico que gasta un usuario al concretar una compra.</p>
                                            </div>
                                        </div>

                                        {/* Ingresos Retenidos */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 text-amber-600 mt-1">
                                                <BanknotesIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos Retenidos</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{formatCurrency(retainedRevenue)}</h3>
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Capital asegurado de órdenes pagadas que están en preparación o en tránsito logístico.</p>
                                            </div>
                                        </div>

                                        {/* Capital Perdido */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-red-600 mt-1">
                                                <ArrowTrendingDownIcon className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fuga de Capital</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{formatCurrency(lostCapital)}</h3>
                                                <p className="text-xs text-gray-500 mt-2 leading-snug">Total histórico de dinero retenido en carritos que fueron cancelados o rechazados.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Historial de Transacciones */}
                                <div>
                                    <h4 className="text-md font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Últimas Transacciones</h4>
                                    <div className="bg-white rounded-2xl border border-gray-200 overflow-auto shadow-sm max-h-[400px]">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-200 border-b border-gray-200 sticky top-0 z-10">
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
                            </div>
                        )}

                        {/* TAB: ANÁLISIS DE CARRITOS */}
                        {activeTab === "carts" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Análisis de Carritos</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    
                                    {/* Gráfico (Ocupa 1 columna en móvil, 1 en desktop pero más ancha si queremos, por ahora normal) */}
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">Distribución Histórica</h3>
                                        <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-100 rounded-2xl w-full" />}>
                                            <CartStatusChart 
                                                converted={convertedCarts}
                                                active={activeCarts}
                                                cancelled={cancelledCarts}
                                                rejected={rejectedCarts}
                                            />
                                        </Suspense>
                                    </div>

                                    {/* Tarjetas de Métricas (Ocupan 2 columnas en desktop) */}
                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
                                        {/* Conversión */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 text-emerald-600">
                                                    <ShoppingCartIcon className="h-5 w-5" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tasa de Conversión</p>
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-gray-900">{conversionRate.toFixed(1)}%</h3>
                                            <p className="text-xs text-gray-500 mt-2 leading-snug">Total histórico de carritos creados que lograron completar el pago exitosamente de principio a fin.</p>
                                        </div>

                                        {/* Cancelados Manualmente */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                                                    <ArchiveBoxXMarkIcon className="h-5 w-5" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cancelados Manual.</p>
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-gray-900">{cancelledCarts}</h3>
                                            <p className="text-xs text-gray-500 mt-2 leading-snug">Total histórico de usuarios que iniciaron el proceso de pago pero decidieron cancelar la operación manualmente.</p>
                                        </div>

                                        {/* Rechazados */}
                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-red-600">
                                                    <NoSymbolIcon className="h-5 w-5" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rechazos Pasarela</p>
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-gray-900">{rejectedCarts}</h3>
                                            <p className="text-xs text-gray-500 mt-2 leading-snug">Total histórico de carritos cuya transacción de pago fue rechazada por la entidad emisora o pasarela externa.</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TAB: LOGÍSTICA OPERATIVA */}
                        {activeTab === "simulator" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Logística Operativa</h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                                    {/* Pendientes Despacho */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                        <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 text-orange-600 mt-1">
                                            <ClockIcon className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Órdenes Estancadas</p>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stuckOrders}</h3>
                                            <p className="text-xs text-gray-500 mt-2 leading-snug">Compras pagadas que el vendedor aún no ha despachado.</p>
                                        </div>
                                    </div>

                                    {/* Envíos Activos */}
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                                        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 text-amber-600 mt-1">
                                            <TruckIcon className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Envíos en Tránsito</p>
                                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{activeShippingOrders.length - stuckOrders}</h3>
                                            <p className="text-xs text-gray-500 mt-2 leading-snug">Paquetes que actualmente están en viaje hacia el comprador.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulador de Envíos */}
                                <div className="bg-gray-200 rounded-2xl border border-gray-200 p-6 shadow-sm">
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
                        )}

                        {/* TAB COMPRADORES */}
                        {activeTab === "buyers" && (
                            <div className="bg-gray-200 rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                                
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Listado de Compradores</h2>
                                        <p className="text-xs text-gray-400 mt-1 font-medium">Total de perfiles registrados: {totalBuyersCount}</p>
                                    </div>
                                    
                                    <BuyerSearchBar defaultValue={search} />
                                </div>

                                {/* TABLA MEJORADA */}
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

                                {/* PAGINACIÓN MEJORADA */}
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

                            </div>
                        )}
        </div>
    );
}
