import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getProductById } from "@/lib/services/seller-app";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductImageGallery from "@/components/ProductImageGallery";
import { getCartSnapshot } from "@/lib/utils/cart-snapshot";
import ProductBreadcrumbs from "@/components/ProductBreadcrumbs";
import ProductFeatures from "@/components/ProductFeatures";
import { ProductImage } from "@/types";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generación de metadatos dinámicos para SEO.
 * Next.js 15+: params es una Promise.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Producto no encontrado — CompuLibre" };
  }

  return {
    title: `${product.name} — CompuLibre`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  // 1 y 2. Resolución paralela de parámetros, producto y perfil
  const { userId } = await auth();
  const { id } = await params;

  const [product, cart] = await Promise.all([
    getProductById(id),
    userId ? import("@/lib/db/prisma").then(m => m.prisma.cart.findFirst({ where: { buyerId: userId, status: "ACTIVE" }, include: { items: true } })) : Promise.resolve(null),
  ]);

  const hasItemsInCart = (cart?.items?.length || 0) > 0;
  const cartSellers = cart?.items ? Array.from(new Set(cart.items.map(item => item.sellerId))) : [];

  const cartSnapshot = await getCartSnapshot(cart);

  if (!product) {
    notFound();
  }

  // 3. Obtener el array de imágenes para la galería
  const galleryImages: ProductImage[] = product.images;

  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <ProductBreadcrumbs productName={product.name} category={product.category} />

      {/* Volver */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#485696] transition duration-200 hover:-translate-x-0.5 hover:brightness-95"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden xs:inline">Volver a la lista de productos</span>
          <span className="xs:hidden">Volver</span>
        </Link>
      </div>

      {/* Grid principal: Galería | Info + Buy Box */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        {/* ── Columna Izquierda: Galería de imágenes ── */}
        <div className="lg:col-span-7">
          <ProductImageGallery
            images={galleryImages}
            productName={product.name}
          />
        </div>

        {/* ── Columna Derecha: Información + Buy Box ── */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 flex flex-col pt-2 lg:pt-0">
            
            {/* Título */}
            <h1 
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4 wrap-break-word line-clamp-3"
              title={product.name}
            >
              {product.name}
            </h1>

            {/* Descripción */}
            <p className="text-base text-gray-600 mb-8 leading-relaxed wrap-break-word line-clamp-6">
              {product.description}
            </p>

            {/* Buy Box (Precio, Stock, Selector y Botones) */}
            <ProductBuyBox product={product} hasItemsInCart={hasItemsInCart} cartSellers={cartSellers} cartSnapshot={cartSnapshot} />

            {/* Detalles Adicionales */}
            <ProductFeatures product={product} />
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}