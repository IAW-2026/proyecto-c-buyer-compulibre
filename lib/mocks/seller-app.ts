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
      { id: "img_001_2", imageUrl: "/assets/products/lg-lado.jpg" },
      { id: "img_001_3", imageUrl: "/assets/products/lg-mov.png" },
      { id: "img_001_4", imageUrl: "/assets/products/lg-atras-montura.png" },
      { id: "img_001_5", imageUrl: "/assets/products/lg-atras.png" },
      { id: "img_001_6", imageUrl: "/assets/products/lg-costado-atras.png" },
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
      { id: "img_004_1", imageUrl: "/assets/products/ssd-samsung.jpg" },
      { id: "img_004_2", imageUrl: "/assets/products/ssd-generico.webp" },
      { id: "img_004_3", imageUrl: "/assets/products/ssd-atras.png" },
      { id: "img_004_4", imageUrl: "/assets/products/ssd-arriba.webp" },
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
      { id: "img_006_4", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Frente" },
      { id: "img_006_5", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Lateral" },
      { id: "img_006_6", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Puertos" },
      { id: "img_006_7", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Frente" },
      { id: "img_006_8", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Lateral" },
      { id: "img_006_9", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Puertos" },
      { id: "img_006_10", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Frente" },
      { id: "img_006_11", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Lateral" },
      { id: "img_006_12", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Puertos" },
      { id: "img_006_13", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Frente" },
      { id: "img_006_14", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Lateral" },
      { id: "img_006_15", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=ASUS+ROG+Puertos" },
    ],
    sellerId: "seller_003",
    sellerName: "GamingGear Shop",
    category: "MOTHERBOARD",
    brand: "ASUS",
    condition: "REFURBISHED",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_007",
    name: "MSI GeForce RTX 4060 Ti Ventus 3X 16GB",
    description:
      "Placa de video de 16GB GDDR6 con tres ventiladores premium Ventus para máxima refrigeración y excelente rendimiento a 1080p y 1440p.",
    price: 629999,
    stock: 6,
    images: [
      { id: "img_007_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=MSI+RTX+4060+Ti+Frente" },
      { id: "img_007_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=MSI+RTX+4060+Ti+Atras" },
    ],
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "GPU",
    brand: "MSI",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_008",
    name: "Intel Core i9-14900K",
    description:
      "Procesador Intel Core i9 de 14ª generación con 24 núcleos (8 de rendimiento + 16 de eficiencia) y frecuencia de hasta 6.0 GHz desbloqueado.",
    price: 829999,
    stock: 4,
    images: [
      { id: "img_008_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Intel+i9+14900K+Caja" },
      { id: "img_008_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Intel+i9+14900K+Chip" },
    ],
    sellerId: "seller_002",
    sellerName: "PC Components BA",
    category: "CPU",
    brand: "Intel",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_009",
    name: "Monitor MSI Optix G241 24\" IPS",
    description:
      "Monitor gaming de 24 pulgadas con resolución Full HD, panel IPS, frecuencia de actualización de 144Hz y tiempo de respuesta de 1ms.",
    price: 199999,
    stock: 15,
    images: [
      { id: "img_009_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=MSI+Optix+G241+Frente" },
      { id: "img_009_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=MSI+Optix+G241+Conectores" },
    ],
    sellerId: "seller_003",
    sellerName: "GamingGear Shop",
    category: "MONITOR",
    brand: "MSI",
    condition: "REFURBISHED",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_010",
    name: "SSD Kingston A400 960GB SATA3",
    description:
      "Unidad de estado sólido de alta velocidad de lectura de 500 MB/s y escritura de 450 MB/s en formato ultra compacto de 2.5 pulgadas.",
    price: 89999,
    stock: 35,
    images: [
      { id: "img_010_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Kingston+A400+Frente" },
    ],
    sellerId: "seller_002",
    sellerName: "PC Components BA",
    category: "STORAGE",
    brand: "Kingston",
    condition: "USED",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_011",
    name: "Memoria RAM Kingston Fury Beast 16GB DDR4",
    description:
      "Módulo único de memoria de 16GB DDR4 a 3200MHz con disipador térmico elegante y bajo perfil, compatible con Intel XMP 2.0 y AMD Ryzen.",
    price: 54999,
    stock: 40,
    images: [
      { id: "img_011_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Kingston+Fury+Beast+Frente" },
      { id: "img_011_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Kingston+Fury+Beast+Detalle" },
    ],
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "RAM",
    brand: "Kingston",
    condition: "REFURBISHED",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_012",
    name: "Gigabyte B650 Gaming X AX WiFi",
    description:
      "Motherboard AMD socket AM5 con regulador de voltaje digital directo, soporte DDR5, PCIe 4.0, conectores M.2 NVMe con disipadores y WiFi 6E integrado.",
    price: 299999,
    stock: 8,
    images: [
      { id: "img_012_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Gigabyte+B650+Frente" },
      { id: "img_012_2", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Gigabyte+B650+Caja" },
    ],
    sellerId: "seller_003",
    sellerName: "GamingGear Shop",
    category: "MOTHERBOARD",
    brand: "Gigabyte",
    condition: "USED",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_013",
    name: "Corsair RM850x 850W 80 Plus Gold",
    description: "Fuente de alimentación totalmente modular con certificación 80 Plus Gold y ventilador de levitación magnética para un rendimiento silencioso.",
    price: 189999,
    stock: 0,
    images: [
      { id: "img_013_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Corsair+RM850x" },
    ],
    sellerId: "seller_002",
    sellerName: "PC Components BA",
    category: "PSU",
    brand: "Corsair",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_014",
    name: "Gabinete NZXT H5 Flow Compact ATX",
    description: "Gabinete mid-tower con panel frontal perforado para máximo flujo de aire. Incluye dos ventiladores de 120mm preinstalados.",
    price: 135000,
    stock: 10,
    images: [
      { id: "img_014_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=NZXT+H5+Flow" },
    ],
    sellerId: "seller_001",
    sellerName: "TechStore Argentina",
    category: "CASE",
    brand: "NZXT",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
  {
    id: "prod_015",
    name: "Watercooler Deepcool LT720 360mm",
    description: "Sistema de refrigeración líquida AIO de alto rendimiento con radiador de 360mm, bomba multidimensional y ventiladores FK120.",
    price: 245000,
    stock: 0,
    images: [
      { id: "img_015_1", imageUrl: "https://placehold.co/600x600/f3f4f6/1f2937?text=Deepcool+LT720" },
    ],
    sellerId: "seller_003",
    sellerName: "GamingGear Shop",
    category: "COOLING",
    brand: "Deepcool",
    condition: "NEW",
    createdAt: "2026-05-28T14:20:00.000Z",
    updatedAt: "2026-05-28T14:20:00.000Z",
  },
];

// ─── Tipos de parámetros alineados con la API real ───────────────────────────

export interface GetProductsParams {
  /** Texto libre — busca en nombre, descripción y categoría */
  search?: string;
  category?: string;
  brand?: string;
  sellerId?: string;
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

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (params?.brand) {
    filtered = filtered.filter((p) => p.brand === params.brand);
  }

  if (params?.sellerId) {
    filtered = filtered.filter((p) => p.sellerId === params.sellerId);
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
