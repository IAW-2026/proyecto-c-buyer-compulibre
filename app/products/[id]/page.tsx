import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductById } from "@/lib/mocks/seller-app";
import { auth } from "@clerk/nextjs/server";
import { getBuyerProfile } from "@/lib/db/profile";
import ProfileRedirector from "@/components/ProfileRedirector";
import ProductBuyBox from "./ProductBuyBox";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generación de metadatos dinámicos para SEO
 * Cumple con Next.js 15+ tratando params como Promise
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    return {
      title: "Producto no encontrado — CompuLibre",
    };
  }

  return {
    title: `${product.name} — CompuLibre`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  // 1. Verificación de onboarding para usuarios autenticados
  // Esto previene que se puedan saltear el formulario inicial
  const { userId } = await auth();
  if (userId) {
    const profile = await getBuyerProfile();
    if (!profile) {
      return <ProfileRedirector />;
    }
  }

  // 2. Obtener parámetros de la ruta
  const { id } = await params;
  const product = await getProductById(id);

  // 3. Si no existe el producto, disparamos notFound() para redirigir a app/not-found.tsx
  if (!product) {
    notFound();
  }

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
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[#1F2937] truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* Volver a productos */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#485696] transition hover:brightness-95 hover:translate-x-[-2px] duration-200"
        >
          <span>←</span> Volver a la lista de productos
        </Link>
      </div>

      {/* Grid de Detalle del Producto */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Columna Izquierda: Imagen */}
        <div className="lg:col-span-7">
          <div className="relative flex aspect-square w-full items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm overflow-hidden hover:scale-[1.005] transition-transform duration-300">
            <div className="relative h-full w-full max-h-[480px] max-w-[480px]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Categoría */}
            <span className="inline-flex rounded-full bg-[#485696]/10 px-3 py-1 text-xs font-bold text-[#485696]">
              {product.category}
            </span>

            {/* Nombre del Producto */}
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#1F2937] sm:text-3xl leading-tight">
              {product.name}
            </h1>

            {/* Vendedor */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50/50 border border-green-100/50 px-3 py-2 text-xs">
              <span className="text-sm shrink-0">🤝</span>
              <div>
                <p className="font-bold text-[#1F2937]">Vendedor Verificado</p>
                <p className="text-[#6B7280]">{product.sellerName}</p>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Descripción del producto
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563]">
                {product.description}
              </p>
            </div>
          </div>

          {/* Buy Box (Client Component) */}
          <ProductBuyBox product={product} />
        </div>
      </div>
    </main>
  );
}
