import Link from "next/link";
import { formatCategory } from "@/lib/formatters";

interface ProductBreadcrumbsProps {
  productName: string;
  category: string;
}

export default function ProductBreadcrumbs({ productName, category }: ProductBreadcrumbsProps) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#6B7280] sm:mb-6 sm:gap-2">
      <Link href="/products" className="transition hover:text-[#485696]">
        Inicio
      </Link>
      <span>/</span>
      <Link
        href={`/products?category=${encodeURIComponent(category)}`}
        className="transition hover:text-[#485696]"
      >
        {formatCategory(category)}
      </Link>
      <span>/</span>
      <span className="flex-1 truncate text-[#1F2937]" title={productName}>
        {productName}
      </span>
    </nav>
  );
}
