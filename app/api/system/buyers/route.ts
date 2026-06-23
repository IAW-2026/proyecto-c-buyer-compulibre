import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { validateSuperadminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Validación del Token del Control Plane
    if (!validateSuperadminToken(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "No tienes permisos para acceder a esta API administrativa.",
        },
        { status: 401 }
      );
    }

    // 2. Extraer parámetros de paginación
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const whereClause = search ? {
      OR: [
        { id: { contains: search, mode: "insensitive" as const } },
        { fullName: { contains: search, mode: "insensitive" as const } }
      ]
    } : {};

    // 3. Consultas en paralelo con $transaction usando array literal
    const [buyers, totalItems] = await prisma.$transaction([
      prisma.buyerProfile.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.buyerProfile.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // 4. Formato de respuesta exitosa
    return NextResponse.json({
      success: true,
      data: buyers,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error en GET /api/system/buyers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Ocurrió un error inesperado al consultar los compradores.",
      },
      { status: 500 }
    );
  }
}
