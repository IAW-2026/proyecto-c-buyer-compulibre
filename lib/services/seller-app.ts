import { SellerProduct, SellerProductSummary } from "@/types";
import { fetchWithTimeout } from "./http-client";

export interface GetProductsParams {
  search?: string;
  category?: string;
  brand?: string;
  sellerId?: string;
  condition?: "NEW" | "USED" | "REFURBISHED";
  minPrice?: number;
  maxPrice?: number;
  sort?: "ascendingPrice" | "descendingPrice";
  page?: number;
  limit?: number;
}

const SELLER_APP_API_URL = process.env.SELLER_APP_API_URL || "http://localhost:3001";

export async function getProducts(
  params?: GetProductsParams
): Promise<{
  products: SellerProductSummary[];
  pagination: {
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
  };
  facets?: {
    brands: Array<{ id: string; count: number }>;
    categories: Array<{ id: string; count: number }>;
    conditions: Array<{ id: string; count: number }>;
    priceRange: { min: number; max: number };
  };
}> {
  const url = new URL(`${SELLER_APP_API_URL}/api/products`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  try {
    return await fetchWithTimeout(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BUYER_API_KEY && { "x-api-key": process.env.BUYER_API_KEY }),
      },
    });
  } catch (err) {
    console.error("Error fetching products from seller app:", err);
    return {
      products: [],
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        totalProducts: 0,
        totalPages: 0,
      },
      facets: {
        brands: [],
        categories: [],
        conditions: [],
        priceRange: { min: 0, max: 0 },
      }
    };
  }
}

export async function getProductById(id: string): Promise<SellerProduct | null> {
  try {
    return await fetchWithTimeout(`${SELLER_APP_API_URL}/api/products/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BUYER_API_KEY && { "x-api-key": process.env.BUYER_API_KEY }),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && !err.message.includes("404")) {
      console.error(`Error fetching product ${id}:`, err.message);
    }
    return null;
  }
}

export async function getProductsByIds(ids: string[]): Promise<SellerProductSummary[]> {
  if (!ids || ids.length === 0) return [];
  
  // Como fallback seguro, hacemos requests individuales en paralelo
  // Si la Seller App soporta ?ids=id1,id2, se podría optimizar aquí.
  try {
    const products = await Promise.all(
      ids.map(id => getProductById(id))
    );
    
    return products
      .filter((p): p is SellerProduct => p !== null)
      .map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        condition: p.condition,
        price: p.price,
        stock: p.stock,
        sellerId: p.sellerId,
        sellerName: p.sellerName,
        image: p.images?.[0]?.imageUrl || "",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
  } catch (err) {
    console.error(`Error fetching products by ids:`, err);
    return [];
  }
}

export async function getProductFacets() {
  const url = new URL(`${SELLER_APP_API_URL}/api/products`);
  url.searchParams.append("limit", "1000"); // Pedimos muchos productos para extraer los filtros globales
  
  try {
    const data = await fetchWithTimeout(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BUYER_API_KEY && { "x-api-key": process.env.BUYER_API_KEY }),
      },
      next: { revalidate: 3600 } // Cachear por 1 hora para no saturar a Seller App
    });
    
    const products = data.products || [];
    
    const categoriesSet = new Set<string>();
    const brandsSet = new Set<string>();
    let maxPrice = 0;
    const brandsByCategory: Record<string, string[]> = {};

    products.forEach((p: SellerProductSummary) => {
      if (p.category) categoriesSet.add(p.category);
      if (p.brand) brandsSet.add(p.brand);
      
      const priceNum = Number(p.price);
      if (!isNaN(priceNum) && priceNum > maxPrice) {
        maxPrice = priceNum;
      }

      if (p.category && p.brand) {
        if (!brandsByCategory[p.category]) brandsByCategory[p.category] = [];
        if (!brandsByCategory[p.category].includes(p.brand)) {
          brandsByCategory[p.category].push(p.brand);
        }
      }
    });

    const categories = Array.from(categoriesSet).map(c => ({ value: c, label: c }));
    const brands = Array.from(brandsSet).map(b => ({ value: b, label: b }));
    
    const formattedBrandsByCategory: Record<string, { value: string, label: string }[]> = {};
    for (const cat in brandsByCategory) {
      formattedBrandsByCategory[cat] = brandsByCategory[cat].map(b => ({ value: b, label: b }));
    }

    return {
      categories: categories.length > 0 ? categories : null,
      brands: brands.length > 0 ? brands : null,
      brandsByCategory: Object.keys(formattedBrandsByCategory).length > 0 ? formattedBrandsByCategory : null,
      maxPrice: maxPrice > 0 ? maxPrice : 3000000
    };
  } catch (err) {
    console.error("Error fetching facets:", err);
    return null;
  }
}
