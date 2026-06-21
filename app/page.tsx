import Link from "next/link";
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  CreditCardIcon
} from "@heroicons/react/24/outline";
import { getProducts } from "@/lib/mocks/seller-app";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import HeroCarousel from "@/components/HeroCarousel";

export default async function StorefrontPage() {
  // Fetch a few featured products for the storefront
  const { products } = await getProducts({ limit: 4 });

  // Lista estática de imágenes segura para Vercel
  const heroImages = [
    "/images/principal/hero-1.jpg",
    "/images/principal/hero-2.jpg",
    "/images/principal/hero-3.jpg"
  ];

  return (
    <div className="min-h-screen bg-[#E7E7E7] flex flex-col">
      <div className="grow pb-12">
        {/* 1. HERO SECTION */}
        <section className="w-full">
          <HeroCarousel images={heroImages} />
        </section>

        {/* 2. SECCIÓN DE BENEFICIOS (Trust Signals) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center pt-4 md:pt-0">
              <TruckIcon className="h-10 w-10 text-[#485696] mb-3" />
              <h3 className="font-bold text-gray-900">Envíos Simulados</h3>
              <p className="text-sm text-gray-500 mt-1">Integración logística en tiempo real</p>
            </div>
            <div className="flex flex-col items-center pt-4 md:pt-0">
              <CreditCardIcon className="h-10 w-10 text-[#485696] mb-3" />
              <h3 className="font-bold text-gray-900">Pagos Seguros</h3>
              <p className="text-sm text-gray-500 mt-1">Tus datos de pago están cifrados de extremo a extremo.</p>
            </div>
            <div className="flex flex-col items-center pt-4 md:pt-0">
              <ShieldCheckIcon className="h-10 w-10 text-[#485696] mb-3" />
              <h3 className="font-bold text-gray-900">Compra Garantizada</h3>
              <p className="text-sm text-gray-500 mt-1">Historial de órdenes y seguimiento</p>
            </div>
          </div>
        </section>

        {/* 3. CATEGORÍAS PRINCIPALES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Categorías Destacadas</h2>
            <Link href="/products" className="text-[#485696] font-bold hover:underline text-sm">
              Ver catálogo completo &rarr;
            </Link>
          </div>
          
          <CategoryCarousel />
        </section>

        {/* 4. PRODUCTOS DESTACADOS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Novedades en tienda</h2>
            <Link href="/products" className="text-[#485696] font-bold hover:underline text-sm">
              Ver todos &rarr;
            </Link>
          </div>
          
          <ProductGrid products={products} />
        </section>
      </div>

      <Footer />
    </div>
  );
}
