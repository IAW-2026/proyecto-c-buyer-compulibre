import Link from "next/link";
import { 
  TruckIcon, 
  BuildingStorefrontIcon, 
  CreditCardIcon
} from "@heroicons/react/24/outline";
import { getProducts } from "@/lib/mocks/seller-app";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import HeroCarousel from "@/components/HeroCarousel";

export default async function StorefrontPage() {
  // Fetch featured products for the storefront
  const { products } = await getProducts({ limit: 8 });

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

        {/* 2. PRODUCTOS DESTACADOS (Novedades) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-12">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Novedades en tienda</h2>
            <Link href="/products" className="text-[#485696] font-bold hover:underline text-sm">
              Ver todos &rarr;
            </Link>
          </div>
          
          <ProductGrid products={products} />
        </section>

        {/* 3. SECCIÓN DE BENEFICIOS (Trust Signals) - FULL WIDTH */}
        <section className="w-full bg-white mt-16 md:mt-24 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
              
              <div className="flex flex-col items-center pb-6 md:pb-0">
                <TruckIcon className="h-10 w-10 text-[#485696] mb-3 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Logística Asegurada</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-normal">Seguí tus productos con nuestros sistemas avanzados en tiempo real.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center py-6 md:py-0">
                <CreditCardIcon className="h-10 w-10 text-[#485696] mb-3 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">Pago 100% Seguro</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-normal">Tu pago está seguro con nosotros.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center pt-6 md:pt-0">
                <BuildingStorefrontIcon className="h-10 w-10 text-[#485696] mb-3 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900">¿Necesitás vender?</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-normal">Subí tus propios productos al catálogo directamente desde nuestra app.</p>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* 4. CATEGORÍAS PRINCIPALES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-12">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Categorías Destacadas</h2>
            <Link href="/products" className="text-[#485696] font-bold hover:underline text-sm">
              Ver catálogo completo &rarr;
            </Link>
          </div>
          
          <CategoryCarousel />
        </section>
      </div>

      {/* 5. BANNER PROMOCIONAL (Envío Gratis) - FULL WIDTH, PEGADO AL FOOTER */}
      <section className="w-full relative flex items-center justify-center min-h-[350px] md:min-h-[400px]">
        {/* Fondo de imagen con Overlay oscuro */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/promo.jpg')" }}
        ></div>
        <div className="absolute inset-0 z-0 bg-black/30 bg-linear-to-r from-black/50 via-black/20 to-black/50"></div>
        
        {/* Contenido centrado */}
        <div className="relative z-10 px-4 sm:px-6 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight md:leading-tight drop-shadow-lg">
            ¡ENVÍOS GRATIS A TODO EL PAÍS <br className="hidden md:block"/> EN EQUIPOS SELECCIONADOS!
          </h2>
          
          <p className="mt-4 md:mt-6 text-sm md:text-base text-gray-200 font-medium tracking-wide drop-shadow-md">
            Aprovechá envío sin cargo en compras superiores a $150.000. Por tiempo limitado.
          </p>
          
          <div className="mt-8 md:mt-10">
            <Link 
              href="/products" 
              className="inline-block bg-[#FC7A1E] text-white font-bold text-sm md:text-base py-3.5 px-10 rounded shadow-lg hover:bg-[#e66a15] transition-all transform hover:scale-105"
            >
              Comprar Ahora
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
