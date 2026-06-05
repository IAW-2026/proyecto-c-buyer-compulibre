import { prisma as db } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import RendimientoFinanciero from "@/components/admin/RendimientoFinanciero";
import AnalisisCarritos from "@/components/admin/AnalisisCarritos";
import Simulador from "@/components/admin/Simulador";
import Compradores from "@/components/admin/Compradores";

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
    if (activeTab === "metrics") {
        let orderQuery: Prisma.BuyerOrderOrderByWithRelationInput = { createdAt: "desc" };
        if (sortCol === "fecha") orderQuery = { createdAt: sortDir as Prisma.SortOrder };
        else if (sortCol === "comprador") orderQuery = { buyer: { fullName: sortDir as Prisma.SortOrder } };
        else if (sortCol === "estado") orderQuery = { status: sortDir as Prisma.SortOrder };
        else if (sortCol === "monto") orderQuery = { totalAmount: sortDir as Prisma.SortOrder };

        const [
            salesSum,
            retainedRevenueSum,
            lostCapitalItems,
            recentPaidOrders,
            paidOrdersCount
        ] = await db.$transaction([
            db.buyerOrder.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } }),
            db.buyerOrder.aggregate({ _sum: { totalAmount: true }, where: { status: { in: ["PAID", "SHIPPED"] } } }),
            db.cartItem.findMany({ where: { cart: { status: { in: ["CANCELLED", "REJECTED"] } } }, select: { quantity: true, cachedPrice: true } }),
            db.buyerOrder.findMany({ orderBy: orderQuery, take: 15, include: { buyer: { select: { fullName: true } } } }),
            db.buyerOrder.count({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } })
        ]);

        const totalSales = Number(salesSum._sum.totalAmount) || 0;
        const retainedRevenue = Number(retainedRevenueSum._sum.totalAmount) || 0;
        const averageOrderValue = paidOrdersCount > 0 ? totalSales / paidOrdersCount : 0;
        const lostCapital = lostCapitalItems.reduce((acc, item) => acc + (item.quantity * Number(item.cachedPrice)), 0);

        return (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <RendimientoFinanciero 
                    totalSales={totalSales}
                    retainedRevenue={retainedRevenue}
                    averageOrderValue={averageOrderValue}
                    lostCapital={lostCapital}
                    recentPaidOrders={recentPaidOrders}
                    sortCol={sortCol}
                    sortDir={sortDir}
                />
            </div>
        );
    }

    if (activeTab === "carts") {
        // Usar groupBy para obtener todos los conteos en 1 sola consulta y no agotar el pool de Neon
        const cartStats = await db.cart.groupBy({
            by: ['status'],
            _count: {
                _all: true
            }
        });

        let totalCarts = 0;
        let convertedCarts = 0;
        let cancelledCarts = 0;
        let rejectedCarts = 0;

        cartStats.forEach(stat => {
            totalCarts += stat._count._all;
            if (stat.status === "CONVERTED") convertedCarts = stat._count._all;
            if (stat.status === "CANCELLED") cancelledCarts = stat._count._all;
            if (stat.status === "REJECTED") rejectedCarts = stat._count._all;
        });

        const conversionRate = totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;
        const activeCarts = totalCarts - convertedCarts - cancelledCarts - rejectedCarts;

        return (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <AnalisisCarritos 
                    convertedCarts={convertedCarts}
                    activeCarts={activeCarts}
                    cancelledCarts={cancelledCarts}
                    rejectedCarts={rejectedCarts}
                    conversionRate={conversionRate}
                />
            </div>
        );
    }

    if (activeTab === "simulator") {
        const [
            activeShippingOrders,
            stuckOrders
        ] = await db.$transaction([
            db.buyerOrder.findMany({ where: { status: { in: ["PAID", "SHIPPED"] } }, orderBy: { createdAt: "asc" }, include: { items: { take: 1 } } }),
            db.buyerOrder.count({ where: { status: "PAID" } })
        ]);

        return (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <Simulador 
                    activeShippingOrders={activeShippingOrders}
                    stuckOrders={stuckOrders}
                />
            </div>
        );
    }

    if (activeTab === "buyers") {
        const take = 10;
        const skip = (page - 1) * take;

        const where = search ? {
            fullName: { contains: search, mode: "insensitive" as const },
        } : {};

        const [
            buyers,
            totalBuyersCount
        ] = await db.$transaction([
            db.buyerProfile.findMany({ where, skip, take, orderBy: { fullName: "asc" } }),
            db.buyerProfile.count({ where })
        ]);

        const client = await clerkClient();
        const users = await client.users.getUserList({ limit: 100 });
        const adminIds = users.data
            .filter(u => (u.publicMetadata as { role?: string })?.role === "admin" || (u.privateMetadata as { role?: string })?.role === "admin")
            .map(u => u.id);

        return (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <Compradores 
                    buyers={buyers}
                    totalBuyersCount={totalBuyersCount}
                    adminIds={adminIds}
                    page={page}
                    search={search}
                    skip={skip}
                    take={take}
                />
            </div>
        );
    }

    return null;
}
