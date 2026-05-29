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
  // 1. Verificación de onboarding para usuarios autenticados
  const { userId } = await auth();
  if (userId) {
    const profile = await getBuyerProfile();
    if (!profile) {
      return <ProfileRedirector />;
    }
  }

  // 2. Obtener el producto; 404 si no existe
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  // 3. Obtener el array de imágenes para la galería
  const galleryImages: ProductImage[] = product.images;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6B7280]">
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
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#485696] transition duration-200 hover:translate-x-[-2px] hover:brightness-95"
        >
          <span>←</span> Volver a la lista de productos
        </Link>
      </div>

      {/* Grid principal: Galería | Info + Buy Box */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ── Columna Izquierda: Galería de imágenes ── */}
        <div className="lg:col-span-7">
          <ProductImageGallery
            images={galleryImages}
            productName={product.name}
          />
        </div>

        {/* ── Columna Derecha: Información + Buy Box ── */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Badges: Categoría + Condición */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#485696]/10 px-3 py-1 text-xs font-bold text-[#485696]">
                {formatCategory(product.category)}
              </span>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                  product.condition === "NEW"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : product.condition === "USED"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-indigo-200 bg-indigo-50 text-[#485696]"
                }`}
              >
                {formatCondition(product.condition)}
              </span>
            </div>

            {/* Nombre */}
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-[#1F2937] sm:text-3xl">
              {product.name}
            </h1>

            {/* Marca */}
            <p className="mt-2 text-sm text-[#6B7280]">
              Marca:{" "}
              <span className="font-semibold text-[#1F2937]">
                {product.brand}
              </span>
            </p>

            {/* Vendedor */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#485696]/10 bg-[#485696]/5 px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#485696]/10">
                <span className="text-sm font-bold text-[#485696]">
                  {product.sellerName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                  Vendedor verificado
                </p>
                <p className="text-sm font-semibold text-[#1F2937]">
                  {product.sellerName}
                </p>
              </div>
              <span className="ml-auto text-green-600" aria-hidden="true">
                ✓
              </span>
            </div>

            {/* Descripción */}
            <div className="mt-6 border-t border-gray-100 pb-2 pt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Descripción del producto
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563]">
                {product.description}
              </p>
            </div>
          </div>

          {/* Buy Box — Client Component con carrito, cantidad y modal */}
          <ProductBuyBox product={product} />
        </div>
      </div>

      {/* Especificaciones técnicas */}
      <div className="mt-16 border-t border-gray-200 pt-12">
        <h2 className="mb-6 text-xl font-bold text-[#1F2937]">
          Características principales
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[
            { label: "Marca", value: product.brand },
            { label: "Categoría", value: formatCategory(product.category) },
            { label: "Condición", value: formatCondition(product.condition) },
            { label: "Stock disponible", value: `${product.stock} unidades` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}