import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withSuperadminAndBuyer } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return withSuperadminAndBuyer(request, id, async (buyer) => {
    const updatedBuyer = await prisma.buyerProfile.update({
      where: { id: buyer.id },
      data: { isActive: !buyer.isActive },
    });

    return NextResponse.json({
      success: true,
      data: updatedBuyer,
    });
  });
}
