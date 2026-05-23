// ─── Entidades de base de datos ───────────────────────────────────────────────

export interface BuyerProfile {
  id: string; // clerk_user_id
  fullName: string;
  defaultShippingAddress: string | null;
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

export interface BuyerOrder {
  id: string;
  buyerId: string;
  sellerId: string;
  totalAmount: string; // Decimal serializado como string
  status: BuyerOrderStatus;
  externalTransactionId: string | null;
  trackingId: string | null;
  courier: string | null;
  shipmentStatus: string | null;
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

// ─── Mocks: Seller App ────────────────────────────────────────────────────────

export interface SellerProduct {
  productId: string;
  name: string;
  brand: string;
  category: string;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  price: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  imageUrl: string;
  description: string;
}

// ─── Mocks: Payments App ─────────────────────────────────────────────────────

export interface PaymentInitRequest {
  orderReference: string;
  amount: number;
  currency: string;
  sellerId: string;
  buyerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    name: string;
    unitPrice: number;
  }>;
}

export interface PaymentInitResponse {
  transactionId: string;
  checkoutUrl: string;
  status: "PENDING";
}

// ─── Mocks: Shipping App ─────────────────────────────────────────────────────

export interface ShipmentCreateRequest {
  orderId: string;
  buyerAddress: string;
  sellerId: string;
  items: Array<{
    externalProductId: string;
    productName: string;
    quantity: number;
  }>;
}

export interface ShipmentCreateResponse {
  trackingId: string;
  courier: string;
  estimatedDelivery: string; // ISO date string
  status: "CREATED";
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
  status: string;
}
