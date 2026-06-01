import Link from "next/link";
import Image from "next/image";
import { SellerProductSummary } from "@/types";
import { FireIcon } from "@heroicons/react/24/solid";

interface ProductCardProps {
  product: SellerProductSummary;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <Link
      href={`/products/${product.id}`}
      // Agregado h-full para que ocupe todo el alto disponible en su celda del grid
      className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-[6px] shadow-sm transition-shadow hover:shadow-md"
    >
      {/* 1. Contenedor de la Imagen Protagonista */}
      <div className="relative flex h-[240px] w-full shrink-0 items-center justify-center rounded-xl bg-gray-50 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          // Reduje el padding de p-4 a p-2 para que la imagen sea más grande
          className="object-contain p-2" 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        
        {/* Badge de Sin Stock */}
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 z-10 rounded-md bg-[#1F2937] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            Agotado
          </span>
        )}

        {/* Badge de Últimas unidades */}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded bg-[#FC7A1E] px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            <FireIcon className="h-3.5 w-3.5" />
            ÚLTIMAS {product.stock}
          </span>
        )}
      </div>

      {/* 2. Detalles del Producto */}
      <div className="flex flex-1 flex-col p-2 pt-3">
        
        {/* Título */}
        <h3 className="line-clamp-2 text-[14px] font-normal text-gray-800 leading-snug">
          {product.name}
        </h3>

        {/* Vendedor */}
        <span className="mt-1 line-clamp-1 text-[12px] text-gray-500" title={`Por ${product.sellerName}`}>
          Por {product.sellerName}
        </span>

        {/* Precio */}
        <div className="mt-2 text-[22px] font-normal text-gray-900">
          {formattedPrice}
        </div>

        {/* Condición - Contenedor con altura fija (h-[18px]) para que nunca rompa la grilla */}
        <div className="mt-1 h-[18px] text-[12px] text-gray-500">
          {product.condition !== "NEW" && (
            <span className="font-medium px-1.5 py-0.5 rounded bg-gray-100 text-green-700">
              {product.condition === "USED" ? "Usado" : "Reacondicionado"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}