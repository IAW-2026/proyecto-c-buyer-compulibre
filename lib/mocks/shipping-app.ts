import {
  ShipmentCreateRequest,
  ShipmentCreateResponse,
} from "@/types";

const MOCK_COURIERS = ["Andreani", "OCA", "Correo Argentino", "DHL"];

/**
 * Simula POST /api/shipments/create en la Shipping App.
 * En Etapa 3 se reemplaza por un fetch real con SERVICE_TOKEN.
 *
 * Asigna un courier aleatorio y un trackingId generado localmente.
 */
export async function createMockShipment(
  request: ShipmentCreateRequest
): Promise<ShipmentCreateResponse> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 200));

  const courier = MOCK_COURIERS[Math.floor(Math.random() * MOCK_COURIERS.length)];
  const trackingId = `TRACK-${request.orderId.toUpperCase().slice(-6)}-${Date.now()}`;

  // Entrega estimada: entre 3 y 7 días hábiles
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 3);

  return {
    trackingId,
    courier,
    estimatedDelivery: deliveryDate.toISOString(),
    status: "CREATED",
  };
}
