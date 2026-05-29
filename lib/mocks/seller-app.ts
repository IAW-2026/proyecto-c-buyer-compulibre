import { SellerProduct, SellerProductSummary } from "@/types";

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────

const MOCK_PRODUCTS: SellerProduct[] = [
  {
    id: "prod_001",
    name: 'Monitor LG UltraWide 34"',
    description:
      "Monitor curvo UltraWide de 34 pulgadas con resolución WQHD (3440x1440) y panel IPS.",
    price: 349999,
    stock: 12,
    images: [
      { id: "img_001_1", imageUrl: "/assets/products/monitor-lg.jpeg" },
      { id: "img_001_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Monitor+LG+Lateral" },
      { id: "img_001_3", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Monitor+LG+Trasera" },
    ],
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "MONITOR",
    brand: "LG",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_002",
    name: "RTX 4070 Super 12GB",
    description:
      "Tarjeta de video NVIDIA GeForce RTX 4070 Super con 12GB GDDR6X.",
    price: 899999,
    stock: 5,
    images: [
      { id: "img_002_1", imageUrl: "/assets/products/rtx-4070.jpg" },
      { id: "img_002_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=RTX+4070+Lateral" },
      { id: "img_002_3", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=RTX+4070+Puertos" },
    ],
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "GPU",
    brand: "NVIDIA",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_003",
    name: "Ryzen 7 7800X3D",
    description:
      "Procesador AMD Ryzen 7 7800X3D con 3D V-Cache, 8 núcleos / 16 hilos, hasta 5.0GHz boost.",
    price: 749999,
    stock: 8,
    images: [
      { id: "img_003_1", imageUrl: "/assets/products/ryzen-7-7800x3d.jpg" },
      { id: "img_003_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Ryzen+7+Frente" },
      { id: "img_003_3", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Ryzen+7+Caja" },
    ],
    sellerId: "seller_002",
    sellerName: "PC Components BA",
    category: "CPU",
    brand: "AMD",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_004",
    name: "Samsung 990 Pro 2TB NVMe",
    description:
      "SSD NVMe PCIe 4.0 con lecturas de hasta 7,450 MB/s. Formato M.2 2280.",
    price: 219999,
    stock: 20,
    images: [
      { id: "img_004_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Samsung+SSD+Frente" },
      { id: "img_004_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Samsung+SSD+Lateral" },
    ],
    sellerId: "seller_002",
    sellerName: "PC Components BA",
    category: "STORAGE",
    brand: "Samsung",
    condition: "USED",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_005",
    name: "Corsair Vengeance DDR5 32GB (2x16)",
    description: "Kit de memoria RAM DDR5 6000MHz CL30 con XMP 3.0 y EXPO.",
    price: 159999,
    stock: 15,
    images: [
      { id: "img_005_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=RAM+DDR5+Kit" },
      { id: "img_005_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=RAM+DDR5+Detalle" },
    ],
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "RAM",
    brand: "Corsair",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_006",
    name: "ASUS ROG Strix B650E-F",
    description:
      "Motherboard AMD AM5 con soporte DDR5, PCIe 5.0 y conectividad WiFi 6E.",
    price: 389999,
    stock: 7,
    images: [
      { id: "img_006_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Frente" },
      { id: "img_006_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Lateral" },
      { id: "img_006_3", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Puertos" },
    ],
    sellerId: "seller_003",
    sellerName: "GamingGear Shop",
    category: "MOTHERBOARD",
    brand: "ASUS",
    condition: "REFURBISHED",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
];

// ─── Tipos de parámetros alineados con la API real ───────────────────────────

export interface GetProductsParams {
  /** Texto libre — busca en nombre, descripción y categoría */
  query?: string;
  category?: string;
  condition?: "NEW" | "USED" | "REFURBISHED";
  minPrice?: number;
  maxPrice?: number;
  /** "ascendingPrice" | "descendingPrice" */
  sort?: "ascendingPrice" | "descendingPrice";
  page?: number;
  limit?: number;
}

// ─── Funciones del mock ───────────────────────────────────────────────────────

/**
 * Simula GET /api/products con todos los query params acordados.
 * En Etapa 3 se reemplaza por un fetch a la Seller App real sin cambiar
 * la firma ni la estructura de respuesta.
 */
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
}> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 150));

  let filtered = [...MOCK_PRODUCTS];

  // ── Filtros ──────────────────────────────────────────────────────────────────

  if (params?.query) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (params?.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }

  if (params?.condition) {
    filtered = filtered.filter((p) => p.condition === params.condition);
  }

  if (params?.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= params.minPrice!);
  }

  if (params?.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= params.maxPrice!);
  }

  // ── Ordenamiento ─────────────────────────────────────────────────────────────

  if (params?.sort === "ascendingPrice") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (params?.sort === "descendingPrice") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  // ── Paginación ───────────────────────────────────────────────────────────────

  const totalProducts = filtered.length;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const start = (page - 1) * limit;
  const totalPages = Math.ceil(totalProducts / limit) || 1;

  const products: SellerProductSummary[] = filtered
    .slice(start, start + limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      condition: p.condition,
      price: p.price,
      stock: p.stock,
      sellerId: p.sellerId,
      sellerName: p.sellerName,
      image: p.images[0]?.imageUrl ?? "https://placehold.co/400x300?text=Sin+Imagen",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

  return {
    products,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,
    },
  };
}

/**
 * Simula GET /api/products/:id
 */
export async function getProductById(
  id: string
): Promise<SellerProduct | null> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}

/**
 * Simula GET /api/products (solo los IDs dados).
 * Útil para hidratar el carrito con datos actualizados.
 */
export async function getProductsByIds(
  ids: string[]
): Promise<SellerProductSummary[]> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_PRODUCTS
    .filter((p) => ids.includes(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      condition: p.condition,
      price: p.price,
      stock: p.stock,
      sellerId: p.sellerId,
      sellerName: p.sellerName,
      image: p.images[0]?.imageUrl ?? "https://placehold.co/400x300?text=Sin+Imagen",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
}
