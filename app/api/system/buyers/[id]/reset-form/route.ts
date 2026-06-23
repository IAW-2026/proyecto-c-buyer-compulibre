import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withSuperadminAndBuyer } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return withSuperadminAndBuyer(request, id, async (buyer) => {
    await prisma.buyerProfile.update({
      where: { id: buyer.id },
      data: { defaultShippingAddress: null, defaultPostalCode: null },
    });

    return NextResponse.json({
      success: true,
      message: "Formulario de envío reseteado correctamente.",
    });
  });
}
