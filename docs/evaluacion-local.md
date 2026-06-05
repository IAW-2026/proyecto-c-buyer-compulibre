# Instrucciones de Evaluación

## Flujo en la Interfaz Web:

**Webhook de pagos (Payment App):**

1. Inicia sesión con el usuario **Buyer**.
2. Agrega productos al carrito, completa tus datos de envío y confirma el pedido.
3. El sistema te redirigirá a un **Simulador de Pagos** interno (mock). Aprueba o rechaza la transacción para disparar los webhooks y ver cómo se actualiza el estado de la orden en tiempo real.

**Webhook de pagos (Shipping App):**

1. Inicia sesión con el usuario **Admin**
2. Agrega productos al carrito, completa tus datos de envío y confirma el pedido y confirme la compra en el mock de Payments.
   (Este paso lo puede hacer con un usuario **Buyer** tambien)
3. Con el usuario **Admin** dirijase a `/admin` y luego clicke en `Logística Operativa`
4. Busque entre todas las órdenes una que coincida con el número de orden que se le brindó (ej: #ABCD1234), debe tener la etiqueta `PAID`.
5. Clicke `Simular Despacho` para crear la etiqueta.
6. Clicke `Simular en tránsito` para actualizar el estado a en tránsito.
7. Clicke `Simular Entrega` para actualizar el estado a entregado.


## Instrucciones de Evaluación Local y Testing de APIs

Para evaluarlo localmente probando la comunicación inter-servicios (webhooks) de forma manual utilizando herramientas como Thunder Client o Postman, debe tener en cuenta lo siguiente:

1. Este proyecto utiliza **pnpm** como gestor de paquetes principal, por lo tanto se debe utilizar:

   ```bash
   pnpm install
   ```

2. Configura tus variables de entorno copiando el archivo de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

   _Asegúrate de definir un valor cualquiera para la variable `SERVICE_TOKEN`._

3. Sincroniza la base de datos de Prisma:

   ```bash
   pnpm dlx prisma db push
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```

> **Nota sobre seguridad de pnpm (v9+):** Si te aparece el error `[ERR_PNPM_IGNORED_BUILDS]`, ejecuta el comando `pnpm approve-builds`.

## 2. Pruebas Manuales de APIs (Thunder Client / Postman)

La Buyer App expone dos webhooks diseñados para reaccionar a eventos provenientes de las otras aplicaciones del ecosistema (Payments y Shipping).

### Webhook de pagos (Payment App)

Notifica a la Buyer App el resultado de un intento de pago.
Para probar este webhook primero debes hacer una compra y en la pantalla de payments app en vez de tocar los botones del mock, guardas los valores de `transactionId` y `order_id`.

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/orders/{TU_ORDER_ID}/payment-webhook`
- **HTTP Header requeridos:**
  - `x-service-token`: (El valor que hayas definido en la variable de entorno)
  - `Content-Type`: `application/json`
- **Body (JSON):**
  ```json
  {
    "transactionId": "(TU_TRANSACTION_ID_GENERADA)",
    "status": "APPROVED",
    "paymentMethod": "credit_card"
  }
  ```
  _Consideraciones:_ Los estados válidos de status son: `APPROVED`, `REJECTED`, o `CANCELLED`. Por seguridad, el `transactionId` que envíes debe coincidir exactamente con el ID de transacción que el sistema generó para esa orden; de lo contrario, la petición será rechazada con un error `409 Conflict`.

---

### Webhook de envíos (Shipping App)

Simula las actualizaciones logísticas del paquete. (La orden a actualizar debe estar previamente en estado pagado).
Para probar este webhook primero debes realizar una compra y obten el `order_id`:

**1° Crear etiqueta (marcar como despachado):**

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/orders/{TU_ORDER_ID}/shipping-webhook`
- **HTTP Header requeridos:**
  - `x-service-token`: (El valor que hayas definido en la variable de entorno)
  - `Content-Type`: `application/json`
- **Body (JSON):**
  ```json
  {
    "trackingId": "TRK-987654321", //cualquiera sirve
    "courier": "Andreani", //cualquiera sirve
    "status": "LABEL_CREATED"
  }
  ```

**2° Actualizar a en tránsito:**

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/orders/{TU_ORDER_ID}/shipping-webhook`
- **HTTP Header requeridos:**
  - `x-service-token`: (El valor que hayas definido en la variable de entorno)
  - `Content-Type`: `application/json`
- **Body (JSON):**
  ```json
  {
    "courier": "Andreani",
    "status": "IN_TRANSIT"
  }
  ```

**3° Actualizar a entregado:**

- **Método:** `POST`
- **URL:** `http://localhost:3000/api/orders/{TU_ORDER_ID}/shipping-webhook`
- **HTTP Header requeridos:**
  - `x-service-token`: (El valor que hayas definido en la variable de entorno)
  - `Content-Type`: `application/json`
- **Body (JSON):**
  ```json
  {
    "courier": "Andreani",
    "status": "DELIVERED"
  }
  ```
  _Consideraciones:_ Los estados válidos de status son: `LABEL_CREATED`, `IN_TRANSIT`, o `DELIVERED`. Cuando el estado es `LABEL_CREATED`, el campo `trackingId` es obligatorio. Para actualizaciones posteriores, basta con enviar el nuevo `status`, luego courier en 2° y 3° , aunque no sea obligatorio ponerlo, lo incluimos por seguridad.
