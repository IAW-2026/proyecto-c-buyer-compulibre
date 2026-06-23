import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { validateSuperadminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    if (!validateSuperadminToken(request)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "No autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const search = searchParams.get("search") || "";
    const sortCol = searchParams.get("sortCol") || "fecha";
    const sortDir = searchParams.get("sortDir") || "desc";
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { id: { contains: search, mode: "insensitive" as const } },
        { buyerId: { contains: search, mode: "insensitive" as const } },
        { buyer: { fullName: { contains: search, mode: "insensitive" as const } } },
        { items: { some: { productName: { contains: search, mode: "insensitive" as const } } } }
      ]
    } : {};

    let orderQuery: Prisma.BuyerOrderOrderByWithRelationInput = { createdAt: "desc" };
    if (sortCol === "fecha") orderQuery = { createdAt: sortDir as Prisma.SortOrder };
    else if (sortCol === "comprador") orderQuery = { buyer: { fullName: sortDir as Prisma.SortOrder } };
    else if (sortCol === "estado") orderQuery = { status: sortDir as Prisma.SortOrder };
    else if (sortCol === "monto") orderQuery = { totalAmount: sortDir as Prisma.SortOrder };

    const [orders, totalItems] = await prisma.$transaction([
      prisma.buyerOrder.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: orderQuery,
        include: {
          buyer: { select: { fullName: true, id: true } }
        }
      }),
      prisma.buyerOrder.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { currentPage: page, itemsPerPage: limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
