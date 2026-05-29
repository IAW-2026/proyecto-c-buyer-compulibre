import Link from "next/link";
import Image from "next/image";
import { SellerProductSummary } from "@/types";
import { formatCategory, formatCondition } from "@/lib/formatters";

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
      className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="relative aspect-4/3 w-full bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        {product.stock === 0 && (
          // Gris oscuro: estado bloqueante, el usuario no puede comprar
          <span className="absolute top-2 left-2 rounded-full bg-[#1F2937] px-2 py-0.5 text-xs font-medium text-white">
            Sin stock
          </span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          // Naranja CTA: urgencia positiva, empuja a la conversión
          <span className="absolute top-2 left-2 rounded-full bg-[#FC7A1E] px-2 py-0.5 text-xs font-medium text-white">
            Últimas {product.stock} unidades
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#485696] uppercase tracking-wide">
            {formatCategory(product.category)}
          </p>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
            product.condition === "NEW"
              ? "bg-green-50 text-green-700 border-green-200"
              : product.condition === "USED"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-indigo-50 text-[#485696] border-indigo-200"
          }`}>
            {formatCondition(product.condition)}
          </span>
        </div>
        
        <h2 className="text-sm font-semibold text-[#1F2937] line-clamp-2 leading-snug group-hover:text-[#485696] transition-colors">
          {product.name}
        </h2>
        
        <p className="text-xs text-[#6B7280]">
          Marca: <span className="font-semibold text-[#4B5563]">{product.brand}</span>
        </p>

        <p className="mt-auto pt-3 text-lg font-bold text-[#1F2937]">
          {formattedPrice}
        </p>
        <p className="text-xs text-[#6B7280]">por {product.sellerName}</p>
      </div>
    </Link>
  );
}
