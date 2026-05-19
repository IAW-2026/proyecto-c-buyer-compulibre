"use server";

import { prisma as db } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleBuyerStatus(formData: FormData) {
  const buyerId = formData.get("buyerId") as string;
  const currentStatusStr = formData.get("currentStatus") as string;
  const currentStatus = currentStatusStr === "true";

  const { sessionClaims } = await auth();
  const roles = (sessionClaims?.publicMetadata as { roles?: string[] })?.roles || [];
  
  if (!roles.includes("admin")) {
    throw new Error("No autorizado");
  }

  await db.buyerProfile.update({
    where: { id: buyerId },
    data: { isActive: !currentStatus },
  });

  revalidatePath("/admin");
}
