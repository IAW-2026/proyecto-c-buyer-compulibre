import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getProductById } from "@/lib/mocks/seller-app";
import { getBuyerProfile } from "@/lib/db/profile";
import ProfileRedirector from "@/components/ProfileRedirector";
import ProductBuyBox from "./ProductBuyBox";
import ProductImageGallery from "@/components/ProductImageGallery";
import { formatCategory, formatCondition } from "@/lib/formatters";
import { ProductImage } from "@/types";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

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

  const [profile, product] = await Promise.all([
    userId ? getBuyerProfile() : Promise.resolve(null),
    getProductById(id),
  ]);

  if (userId && !profile) {
    return <ProfileRedirector />;
  }

  if (!product) {
    notFound();
  }

  // 3. Obtener el array de imágenes para la galería
  const galleryImages: ProductImage[] = product.images;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#6B7280] sm:mb-6 sm:gap-2">
        <Link href="/products" className="transition hover:text-[#485696]">
          Inicio
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="transition hover:text-[#485696]"
        >
          {formatCategory(product.category)}
        </Link>
        <span>/</span>
        <span className="max-w-[200px] truncate text-[#1F2937] sm:max-w-none">
          {product.name}
        </span>
      </nav>

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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              {product.name}
            </h1>

            {/* Descripción */}
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Buy Box (Precio, Stock, Selector y Botones) */}
            <ProductBuyBox product={product} />

            {/* Detalles Adicionales */}
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h3 className="font-medium text-[#485696] mb-4">
                Características Generales
              </h3>
              <div className="text-sm text-gray-600">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Marca: {product.brand}</li>
                  <li>Categoría: {formatCategory(product.category)}</li>
                  <li>Condición: {formatCondition(product.condition)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}