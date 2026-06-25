export interface HydratedCartItem {
  id: string;
  externalProductId: string;
  productName: string;
  cachedPrice: string; // Decimal serializado como string
  quantity: number;
  sellerId: string;
  sellerName: string;
  imageUrl: string;
  stock: number;
  condition: string;
}
