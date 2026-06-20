import { formatCategory, formatCondition } from "@/lib/formatters";
import { SellerProduct } from "@/types";

interface ProductFeaturesProps {
  product: SellerProduct;
}

export default function ProductFeatures({ product }: ProductFeaturesProps) {
  return (
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
  );
}
