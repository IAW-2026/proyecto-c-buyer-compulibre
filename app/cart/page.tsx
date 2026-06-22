import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getBuyerProfile } from "@/lib/db/profile";
import { getProductsByIds } from "@/lib/services/seller-app";
import CartContainer from "./CartContainer";
import { HydratedCartItem } from "./types";

export const metadata = {
  title: "Carrito de Compras — CompuLibre",
  description: "Revisá y gestioná los productos en tu carrito antes de proceder al pago.",
};

export default async function CartPage() {
  const { userId } = await auth();

  // 1. Validar autenticación
  if (!userId) {
    redirect("/sign-in");
  }

  // 2 y 3. Obtener el perfil y el carrito activo en paralelo
  const [profile, cart] = await Promise.all([
    getBuyerProfile(),
    prisma.cart.findFirst({
      where: {
        buyerId: userId,
        status: "ACTIVE",
      },
      include: {
        items: {
          orderBy: {
            id: "asc",
          },
        },
      },
    }),
  ]);

  let hydratedItems: HydratedCartItem[] = [];

  // 4. Si el carrito existe y tiene ítems, hidratarlos en lote (batch) desde el mock
  if (cart && cart.items.length > 0) {
    const productIds = cart.items.map((item) => item.externalProductId);
    const productsData = await getProductsByIds(productIds);

    hydratedItems = cart.items.map((item) => {
      const productData = productsData.find(
        (p) => p.id === item.externalProductId
      );
      return {
        id: item.id,
        externalProductId: item.externalProductId,
        productName: item.productName,
        cachedPrice: item.cachedPrice.toString(), // Prisma Decimal serializado como string
        quantity: item.quantity,
        sellerId: item.sellerId,
        // Hidratación desde la API mock de la Seller App:
        sellerName: productData?.sellerName ?? "Vendedor Desconocido",
        imageUrl: productData?.image ?? "https://placehold.co/400x300?text=Sin+Imagen",
        stock: productData?.stock ?? 0,
        condition: productData?.condition ?? "new",
      };
    });
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <CartContainer items={hydratedItems} hasProfile={!!profile} />
    </main>
  );
}
