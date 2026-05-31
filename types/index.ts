// ─── Entidades de base de datos ───────────────────────────────────────────────

export interface BuyerProfile {
  id: string; // clerk_user_id
  fullName: string;
  defaultShippingAddress: string | null;
  defaultPostalCode: string | null;
  isActive: boolean;
}
export interface Cart {
  id: string;
  buyerId: string;
  status: CartStatus;
  items?: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type CartStatus = "ACTIVE" | "ABANDONED" | "CONVERTED";

export interface CartItem {
  id: string;
  cartId: string;
  externalProductId: string;
  productName: string;
  quantity: number;
  cachedPrice: string; // Decimal serializado como string
  sellerId: string;
}

export type ShipmentStatus = "LABEL_CREATED" | "IN_TRANSIT" | "DELIVERED";

export interface BuyerOrder {
  id: string;
  buyerId: string;
  sellerId: string;
  totalAmount: string; // Decimal serializado como string
  status: BuyerOrderStatus;
  externalTransactionId: string | null;
  trackingId: string | null;
  courier: string | null;
  shipmentStatus: ShipmentStatus | null;
  items?: BuyerOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type BuyerOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_FAILED";

export interface BuyerOrderItem {
  id: string;
  buyerOrderId: string;
  externalProductId: string;
  productName: string;
  quantity: number;
  unitPrice: string; // Decimal serializado como string
}

// Imagen individual de un producto (multi-imagen, contrato API docs-ext/03-apis.md)
export interface ProductImage {
  id: string;
  imageUrl: string;
}

// Tipo para listados y carrito (sin description — thin)
export interface SellerProductSummary {
  id: string;
  name: string;
  brand: string;
  category: string;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  price: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  image: string;   // imagen principal (compatibilidad con listados y carrito)
  createdAt: string;
  updatedAt: string;
}

// Tipo para el detalle de producto (fat — incluye description y galería)
export interface SellerProduct extends Omit<SellerProductSummary, 'image'> {
  description: string;
  images: ProductImage[]; // array de imágenes adicionales (requerido según especificación)
}

// ─── Mocks: Payments App ─────────────────────────────────────────────────────

export interface PaymentInitRequest {
  orderReference: string;
  amount: number;
  currency: string;
  buyerId: string;
  buyerAddress: string;
  buyerCodigoPostal: string;
  items: Array<{
    productId: string;
    quantity: number;
    name: string;
    unitPrice: number;
    sellerId: string;
  }>;
}

export interface PaymentInitResponse {
  transactionId: string;
  checkoutUrl: string;
}

// ─── Mocks: Shipping App ─────────────────────────────────────────────────────

export interface ShipmentCreateRequest {
  sellerOrderId: string;
  buyerOrderId: string;
  sellerId: string;
  externalTrackingId: string;
  buyerAddress: string;
  originAddress: string;
  courier: string;
}

export interface ShipmentCreateResponse {
  trackingId: string;
  courier: string;
  status: ShipmentStatus;
  labelUrl: string;
}

// ─── Formato de error estándar ────────────────────────────────────────────────

export interface ApiError {
  success: false;
  error: string; // Código legible: "NOT_FOUND", "UNAUTHORIZED", etc.
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Paginación ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Webhooks ────────────────────────────────────────────────────────────────

export interface PaymentWebhookPayload {
  transactionId: string;
  status: "APPROVED" | "REJECTED"; // etc
  paymentMethod: string;
}

export interface ShippingWebhookPayload {
  trackingId: string;
  courier: string;
  status: ShipmentStatus;
}
