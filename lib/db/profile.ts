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
  name?: string;
  surname?: string;
  address?: string;
  postalCode?: string;
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

  const name = formData.get("name")?.toString().trim() ?? "";
  const surname = formData.get("surname")?.toString().trim() ?? "";
  const fullName = `${name} ${surname}`.trim();
  const address = formData.get("address")?.toString().trim() ?? "";
  const postalCode = formData.get("postalCode")?.toString().trim() ?? "";
  const returnUrl = formData.get("returnUrl")?.toString().trim() || "/products";

  // 1. Validaciones estrictas de servidor
  if (name.length < 2 || surname.length < 2) {
    return { success: false, error: "El nombre y apellido son requeridos y deben tener al menos 2 caracteres cada uno.", name, surname, address, postalCode };
  }

  if (address.length < 10) {
    return { success: false, error: "La dirección es requerida y debe tener al menos 10 caracteres para ser válida.", name, surname, address, postalCode };
  }

  if (postalCode.length < 4) {
    return { success: false, error: "El código postal es requerido y debe ser válido.", name, surname, address, postalCode };
  }

  let success = false;

  try {
    // 2. Creación o actualización en la base de datos (upsert)
    await prisma.buyerProfile.upsert({
      where: { id: userId },
      update: {
        fullName,
        defaultShippingAddress: address,
        defaultPostalCode: postalCode,
        isActive: true,
      },
      create: {
        id: userId,
        fullName,
        defaultShippingAddress: address,
        defaultPostalCode: postalCode,
        isActive: true,
      },
    });
    success = true;
  } catch (err: unknown) {
    console.error("Error al registrar el BuyerProfile en base de datos:", err);
    return { 
      success: false, 
      error: "Error interno al guardar tu perfil. Es posible que el perfil ya esté registrado.",
      name, surname, address, postalCode
    };
  }

  // 3. Revalidar y redireccionar fuera del bloque try/catch para evitar capturar excepciones de redirección de Next.js
  if (success) {
    revalidatePath("/", "layout");
    redirect(returnUrl);
  }

  return null;
}

