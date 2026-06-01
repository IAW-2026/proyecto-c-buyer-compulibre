export default async function MockShippingAppPage({
  params,
}: {
  params: Promise<{ tracking_id: string }>;
}) {
  const { tracking_id } = await params;

  const mockShipmentData = {
    trackingId: tracking_id,
    externalSellerOrderId: "sell_ord_888",
    courier: "Andreani",
    originAddress: "Av. Siempreviva 742, Springfield",
    destinationAddress: "Calle Falsa 123, Belgrano",
    status: "IN_TRANSIT",
    createdAt: "2026-05-19T14:32:00.000Z",
    updatedAt: "2026-05-20T10:15:00.000Z",
    events: [
      {
        id: 1,
        trackingId: tracking_id,
        statusUpdate: "LABEL_CREATED",
        location: "Sucursal de origen Andreani",
        timestamp: "2026-05-19T14:32:00.000Z",
      },
      {
        id: 2,
        trackingId: tracking_id,
        statusUpdate: "IN_TRANSIT",
        location: "Centro de distribución principal",
        timestamp: "2026-05-20T10:15:00.000Z",
      },
    ],
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Mock Shipping App</h1>
      <p>Este es un entorno de pruebas simulado de la Shipping App.</p>
      
      <h2>Datos del envío</h2>
      <ul>
        <li><strong>Tracking ID:</strong> {mockShipmentData.trackingId}</li>
        <li><strong>ID Orden Vendedor:</strong> {mockShipmentData.externalSellerOrderId}</li>
        <li><strong>Courier:</strong> {mockShipmentData.courier}</li>
        <li><strong>Estado actual:</strong> {mockShipmentData.status}</li>
        <li><strong>Dirección de origen:</strong> {mockShipmentData.originAddress}</li>
        <li><strong>Dirección de destino:</strong> {mockShipmentData.destinationAddress}</li>
        <li><strong>Fecha creación:</strong> {new Date(mockShipmentData.createdAt).toLocaleString("es-AR")}</li>
        <li><strong>Última actualización:</strong> {new Date(mockShipmentData.updatedAt).toLocaleString("es-AR")}</li>
      </ul>

      <h2>Historial de eventos</h2>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>ID Evento</th>
            <th>Estado</th>
            <th>Ubicación</th>
            <th>Fecha y Hora</th>
          </tr>
        </thead>
        <tbody>
          {mockShipmentData.events.map((event) => (
            <tr key={event.id}>
              <td>{event.id}</td>
              <td>{event.statusUpdate}</td>
              <td>{event.location}</td>
              <td>{new Date(event.timestamp).toLocaleString("es-AR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
