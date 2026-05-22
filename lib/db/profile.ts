"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Obtiene el perfil de comprador (BuyerProfile) para el usuario autenticado.
 * Retorna null si no está autenticado o si no posee perfil en la DB local.
 */
export async function getBuyerProfile() {
  const { userId } = await auth();
  if (!userId) return null;

  return await prisma.buyerProfile.findUnique({
    where: { id: userId },
  });
}

export interface OnboardingState {
  success: boolean;
  error?: string;
}

/**
 * Server Action para crear el BuyerProfile desde el formulario de Onboarding.
 * Valida los datos en el servidor y maneja de forma segura las excepciones de redirección de Next.js.
 */
export async function createProfileFromOnboarding(
  prevState: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState | null> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "No autorizado. Inicie sesión nuevamente." };
  }

  const fullName = formData.get("fullName")?.toString().trim() ?? "";
  const address = formData.get("address")?.toString().trim() ?? "";

  // 1. Validaciones estrictas de servidor
  if (fullName.length < 3) {
    return { success: false, error: "El nombre es requerido y debe tener al menos 3 caracteres." };
  }

  if (address.length < 10) {
    return { success: false, error: "La dirección es requerida y debe tener al menos 10 caracteres para ser válida." };
  }

  let success = false;

  try {
    // 2. Creación en la base de datos
    await prisma.buyerProfile.create({
      data: {
        id: userId,
        fullName,
        defaultShippingAddress: address,
        isActive: true,
      },
    });
    success = true;
  } catch (err: unknown) {
    console.error("Error al registrar el BuyerProfile en base de datos:", err);
    return { 
      success: false, 
      error: "Error interno al guardar tu perfil. Es posible que el perfil ya esté registrado." 
    };
  }

  // 3. Revalidar y redireccionar fuera del bloque try/catch para evitar capturar excepciones de redirección de Next.js
  if (success) {
    revalidatePath("/", "layout");
    redirect("/products");
  }

  return null;
}

