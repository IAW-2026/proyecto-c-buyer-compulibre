## Notas para la Corrección

- **Aislamiento de mocks:** Para cumplir con la restricción de la Etapa 2, los productos y los eventos de envíos provienen del directorio `/lib/mocks`. La aplicación cuenta con información precargada y suficiente data en Prisma para que la navegación no esté vacía.

- **Simplificaciones arquitectónicas (acordadas):**
  - Se simplifico el conteo del stock, debido a esto al realizar una compra en la buyer app no se resta el stock de los productos, luego en un futuro si se quisiera implementar un stock dinamico , la buyer app delegaria el bloqueo del stock a la seller app, para no hacer un polling constante.
  - Se limito la compra a un solo vendedor para reducir la complejidad en el flujo de pago, debido a esto no se puede comprar a varios vendedores en una misma orden.
  - La dirección de envío no se podria modificar si el usuario proceso el pago, porque ahorra tener que coordinar con ordenes previas, reduce la complejidad en la base de datos

- **Estados del carrito:** Para añadir datos significativos en el dashboard, se decidio que los carritos tengan 4 estados: active (carrito activo), luego una vez que ocurre el checkout puede pasar a los siguientes estados: converted (carrito pagado correctamente), rejected (se rechazo el pago del carrito), cancelled (el cliente cancelo la compra del carrito).

- **Prevención de órdenes duplicadas:** Se solucionó el problema de carritos duplicados. Si un usuario interrumpe el pago, la orden queda en estado PENDING (guardando la checkoutUrl). Al reintentar, se reutiliza esta orden evitando clonaciones en la base de datos. Se incluyó un botón de "Retomar Pago" en el historial de "Mis ordenes".

- **Seguridad en Webhooks (`x-service-token`):** Todos los endpoints tipo webhook expuestos (pagos, envíos) exigen el header `x-service-token`. En esta etapa, el valor puede ser cualquiera mientras esté configurado en las variables de entorno, pero su presencia es mandatoria para evidenciar el control de acceso.

- **Manejo de errores y calidad:** La aplicación implementa validación del lado del servidor mediante Server Actions. Las APIs devuelven un formato de respuesta estándar (`{ "success": false, "error": "CODIGO" }`) con el status HTTP correspondiente, logrando mayor predictibilidad.

- **Inmutabilidad histórica (Snapshots):** Los ítems de las órdenes (`BuyerOrderItem`) guardan una copia estática del precio (`unitPrice`) y nombre del producto al momento de la compra. Esto garantiza que futuros cambios en el catálogo de los vendedores no alteren el registro financiero de compras pasadas.

- **Idempotencia en webhooks:** Los endpoints que reciben eventos externos verifican el estado actual de la orden en la base de datos antes de procesar la solicitud. Si un sistema externo reintenta enviar el mismo evento (ej. `LABEL_CREATED`), el servidor responde con éxito sin duplicar operaciones lógicas.

- **Precisión de métricas simuladas (seed):** Para poblar las métricas del dashboard de administrador se utiliza el script de generación de datos (`prisma/seed.ts`). Crea cada orden de compra vinculada directamente a su carrito original, igualando exactamente los montos y derivando los estados correspondientes.

- **Resolución dinámica de URLs para webhooks internos en vercel:** Para simular las llamadas webhook en Vercel, se implementó la extracción dinámica mediante request.nextUrl.origin. Esto garantiza que las peticiones entre rutas (Server-to-Server) nunca fallen por inconsistencias de dominio (ej. Custom Domains vs Preview URLs).

- **Evasión de la vercel authentication protection en webhooks simulados:** Durante las pruebas en Vercel, la plataforma bloquea peticiones anónimas. Para resolver que los mocks internos (mock-success, mock-failure) pudieran llamar al webhook de la API sin ser bloqueados por el firewall de Vercel, se implementó el reenvío dinámico de la cabecera Cookie del cliente hacia la petición fetch interna.
