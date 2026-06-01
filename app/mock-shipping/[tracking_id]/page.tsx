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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl bg-white shadow-xl overflow-hidden border border-gray-100">
          {/* Header simple */}
          <div className="px-6 py-6 border-b border-gray-100 text-center">
            <h1 className="text-xl font-bold text-gray-900">Shipping app</h1>
            <p className="mt-1 text-sm text-gray-500">Entorno de prueba (Etapa 2)</p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Datos principales */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 text-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tracking ID</span>
                <span className="block font-mono text-gray-900 break-all">{mockShipmentData.trackingId}</span>
              </div>
              <div className="px-4 py-3 border-b border-gray-200">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ID Orden Vendedor</span>
                <span className="block font-mono text-gray-900 break-all">{mockShipmentData.externalSellerOrderId}</span>
              </div>
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Courier</span>
                  <span className="block font-medium text-gray-900">{mockShipmentData.courier}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado Actual</span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {mockShipmentData.status}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-gray-200">
                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ruta</span>
                <p className="text-gray-900"><span className="text-gray-500">Origen:</span> {mockShipmentData.originAddress}</p>
                <p className="text-gray-900"><span className="text-gray-500">Destino:</span> {mockShipmentData.destinationAddress}</p>
              </div>
              <div className="px-4 py-3 text-xs text-gray-500 sm:flex sm:justify-between space-y-1 sm:space-y-0">
                <span>Creado: {new Date(mockShipmentData.createdAt).toLocaleString("es-AR")}</span>
                <span>Actualizado: {new Date(mockShipmentData.updatedAt).toLocaleString("es-AR")}</span>
              </div>
            </div>

            {/* Historial de Eventos */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Historial de eventos</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-500">ID</th>
                      <th className="px-4 py-3 font-semibold text-gray-500">Estado</th>
                      <th className="px-4 py-3 font-semibold text-gray-500">Ubicación</th>
                      <th className="px-4 py-3 font-semibold text-gray-500">Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {mockShipmentData.events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">{event.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{event.statusUpdate}</td>
                        <td className="px-4 py-3 text-gray-600">{event.location}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(event.timestamp).toLocaleString("es-AR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
