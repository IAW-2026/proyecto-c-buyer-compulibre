import {
  ShipmentCreateRequest,
  ShipmentCreateResponse,
} from "@/types";
import { prisma } from "@/lib/db/prisma";

const MOCK_COURIERS = ["Andreani", "OCA", "Correo Argentino", "DHL"];

/**
 * Simula POST /api/shipments en la Shipping App.
 * En Etapa 3 se reemplaza por un fetch real con SERVICE_TOKEN.
 *
 * Asigna un courier aleatorio y un trackingId generado localmente.
 */
export async function createMockShipment(
  request: ShipmentCreateRequest
): Promise<ShipmentCreateResponse> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 200));

  const courier = request.courier ?? MOCK_COURIERS[Math.floor(Math.random() * MOCK_COURIERS.length)];
  const trackingId = `TRACK-${request.buyerOrderId.toUpperCase().slice(-6)}-${Date.now()}`;

  return {
    trackingId,
    courier,
    status: "LABEL_CREATED",
    labelUrl: `https://shipping-app.compulibre.com/track/${trackingId}`,
  };
}

/**
 * Simula GET /api/shipments/:tracking_id
 * Lee de Prisma para sincronizar el estado real del paquete con el historial ficticio.
 */
export async function getMockShipmentByTrackingId(trackingId: string) {
  await new Promise((r) => setTimeout(r, 200));

  const order = await prisma.buyerOrder.findFirst({
    where: { trackingId },
    include: { buyer: true },
  });

  if (!order) {
    throw new Error("Shipment not found");
  }

  const events = [];
  
  // 1. Etiqueta creada
  events.push({
    id: 1,
    trackingId,
    statusUpdate: "LABEL_CREATED",
    location: `Depósito del vendedor (${order.sellerId.substring(0, 8)})`,
    timestamp: order.createdAt.toISOString(),
  });

  // 2. En tránsito
  if (order.shipmentStatus === "IN_TRANSIT" || order.shipmentStatus === "DELIVERED") {
    events.push({
      id: 2,
      trackingId,
      statusUpdate: "IN_TRANSIT",
      location: "Centro de distribución principal",
      timestamp: new Date(order.createdAt.getTime() + 86400000).toISOString(),
    });
  }

  // 3. Entregado
  if (order.shipmentStatus === "DELIVERED") {
    events.push({
      id: 3,
      trackingId,
      statusUpdate: "DELIVERED",
      location: order.buyer.defaultShippingAddress ?? "Domicilio del comprador",
      timestamp: new Date(order.createdAt.getTime() + 172800000).toISOString(),
    });
  }

  return {
    trackingId,
    externalSellerOrderId: `sell_ord_${order.sellerId.substring(0, 8)}`,
    courier: order.courier ?? "Andreani",
    originAddress: `Depósito principal del vendedor`,
    destinationAddress: order.buyer.defaultShippingAddress ?? "Sin dirección configurada",
    status: order.shipmentStatus ?? "LABEL_CREATED",
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    events,
  };
}
