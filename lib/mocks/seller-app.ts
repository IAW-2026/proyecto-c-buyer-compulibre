import { SellerProduct, SellerProductSummary } from "@/types";

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────

const MOCK_PRODUCTS: SellerProduct[] = [
  {
    productId: "prod_001",
    name: 'Monitor LG UltraWide 34"',
    description:
      "Monitor curvo UltraWide de 34 pulgadas con resolución WQHD (3440x1440) y panel IPS.",
    price: 349999,
    stock: 12,
    imageUrl: "/assets/products/monitor-lg.jpeg",
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "MONITOR",
    brand: "LG",
    condition: "NEW",
  },
  {
    productId: "prod_002",
    name: "RTX 4070 Super 12GB",
    description:
      "Tarjeta de video NVIDIA GeForce RTX 4070 Super con 12GB GDDR6X.",
    price: 899999,
    stock: 5,
    imageUrl: "/assets/products/rtx-4070.jpg",
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "GPU",
    brand: "NVIDIA",
    condition: "NEW",
  },
  {
    productId: "prod_003",
    name: "Ryzen 7 7800X3D",
    description:
      "Procesador AMD Ryzen 7 7800X3D con 3D V-Cache, 8 núcleos / 16 hilos, hasta 5.0GHz boost.",
    price: 749999,
    stock: 8,
    imageUrl: "/assets/products/ryzen-7-7800x3d.jpg",
    sellerId: "seller_002",
    sellerName: "PC Components BA",
    category: "CPU",
    brand: "AMD",
    condition: "NEW",
  },
  {
    productId: "prod_004",
    name: "Samsung 990 Pro 2TB NVMe",
    description:
      "SSD NVMe PCIe 4.0 con lecturas de hasta 7,450 MB/s. Formato M.2 2280.",
    price: 219999,
    stock: 20,
    imageUrl: "https://placehold.co/400x300?text=Samsung+SSD",
    sellerId: "seller_002",
    sellerName: "PC Components BA",
    category: "STORAGE",
    brand: "Samsung",
    condition: "USED",
  },
  {
    productId: "prod_005",
    name: "Corsair Vengeance DDR5 32GB (2x16)",
    description: "Kit de memoria RAM DDR5 6000MHz CL30 con XMP 3.0 y EXPO.",
    price: 159999,
    stock: 15,
    imageUrl: "https://placehold.co/400x300?text=RAM+DDR5",
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "RAM",
    brand: "Corsair",
    condition: "NEW",
  },
  {
    productId: "prod_006",
    name: "ASUS ROG Strix B650E-F",
    description:
      "Motherboard AMD AM5 con soporte DDR5, PCIe 5.0 y conectividad WiFi 6E.",
    price: 389999,
    stock: 7,
    imageUrl: "https://placehold.co/400x300?text=ASUS+ROG",
    sellerId: "seller_003",
    sellerName: "GamingGear Shop",
    category: "MOTHERBOARD",
    brand: "ASUS",
    condition: "REFURBISHED",
  },
];

// ─── Funciones del mock ───────────────────────────────────────────────────────

/**
 * Simula GET /api/products con soporte de búsqueda y paginación.
 * En Etapa 3 se reemplaza por fetch a la Seller App real.
 */
export async function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: SellerProductSummary[]; page: number; limit: number; total: number }> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 150));

  let filtered = [...MOCK_PRODUCTS];

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (params?.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }

  const total = filtered.length;
  const page = params?.page ?? 1;
  const limit = params?.pageSize ?? 12;
  const start = (page - 1) * limit;

  // Omitir description: el listado solo necesita el resumen (thin)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items: SellerProductSummary[] = filtered
    .slice(start, start + limit)
    .map(({ description: _desc, ...rest }) => rest);

  return { items, page, limit, total };
}

/**
 * Simula GET /api/products/:id
 */
export async function getProductById(
  id: string
): Promise<SellerProduct | null> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_PRODUCTS.find((p) => p.productId === id) ?? null;
}

/**
 * Simula GET /api/products (solo los IDs dados).
 * Útil para hidratar el carrito con datos actualizados.
 */
export async function getProductsByIds(
  ids: string[]
): Promise<SellerProductSummary[]> {
  await new Promise((r) => setTimeout(r, 100));
  // Omitir description: el carrito no la necesita (thin)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return MOCK_PRODUCTS
    .filter((p) => ids.includes(p.productId))
    .map(({ description: _desc, ...rest }) => rest);
}
