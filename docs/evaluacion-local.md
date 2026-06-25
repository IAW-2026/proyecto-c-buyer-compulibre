# Instrucciones de Evaluación

## Para el .env

- Clerk URLs (Rutas de tu aplicación)
   -   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   -   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   -   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/products
   -   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/products

- KEYS del proyecto:
  -  SELLER_API_KEY=4ch79bsgnp9xj6dpu1f3wt16rnprhrxd
  -  SHIPPING_API_KEY=296l1gzir92d2un7du8erbksou9f5xpf
  -  PAYMENTS_API_KEY=0srf8e6kogjdla9fn04be73n9v13lg07
  -  BUYER_API_KEY=3gd8fbza7huokb0pp4wb3hb369w6qxjf

- Control Plane (superadmin) y Analytics Dashboard
  -  ANALYTICS_API_KEY=1g7q3j6k8l9m0n2o3p4q5r6s7t8u9v0w
  -  SUPERADMIN_API_KEY=5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m
 
- URL de Deploys
  -  SELLER_APP_API_URL=https://proyecto-c-seller-compulibre.vercel.app/
  -  PAYMENTS_APP_API_URL=https://proyecto-c-payments-compulibre.vercel.app/
  -  SHIPPING_APP_API_URL=https://proyecto-c-shipping-compulibre.vercel.app/
  -  NEXT_PUBLIC_SHIPPING_APP_URL=https://proyecto-c-shipping-compulibre.vercel.app/

---

## Seguridad — Autenticación M2M

Todos los endpoints que reciben eventos externos están protegidos con autenticación M2M mediante el header `x-api-key`:

| Endpoint | Header requerido | Keys aceptadas |
|----------|-----------------|----------------|
| `/api/orders/{id}/payment-webhook` | `x-api-key` | `BUYER_API_KEY`, `PAYMENTS_API_KEY` o `SHIPPING_API_KEY` |
| `/api/orders/{id}/shipping-webhook` | `x-api-key` | `BUYER_API_KEY`, `PAYMENTS_API_KEY` o `SHIPPING_API_KEY` |
| `/api/system/buyers/*` (Control Plane) | `x-api-key` | `SUPERADMIN_API_KEY` |
| `/api/system/orders/*` (Control Plane) | `x-api-key` | `SUPERADMIN_API_KEY` |
| `/api/system/metrics` (Analytics) | `x-api-key` | `ANALYTICS_API_KEY` |

---

## Cómo Testear el Flujo de Pago (Mercado Pago Sandbox)

1. Inicia sesión con el usuario **Buyer**.
2. Agrega productos al carrito, completa tus datos de envío y confirma el pedido.
3. El sistema te redirigirá a  **Payments App**, la cual usa el sandbox de Mercado Pago.
4. Siga las intrucciones de la `Guia de uso` de **Payments app** para el pago.
5. Cuando se Aprueba o rechaza la transacción, se vera cómo se actualiza el estado de la orden en tiempo real.
6. **OPCIONAL** si hace click en volver a la tienda en el sandbox de Mercado Pago, en Mis Compras saldra un botón para continuar con el pago ó cancelarlo en el detalle de la compra.


## Cómo Simular las Notificaciones de Envío (Shipping Webhooks)

1. Inicia sesión con el usuario **Buyer** y realice una compra con exito
2. Con la **Shipping App** cree un tiquet y cambie el estado del envio a `IN_TRANSIT` / En Camino.
3. Se podra ver que al usuario **Buyer** le llegara una notificación de que el envio se encuentra en transito.
4. Luego denuevo con la **Shipping App** cambie el estado del envio a `DELIVERED` / Entregado.
5. Se podra ver que al usuario **Buyer** le llegara una notificación de que le llego el paquete.
En cualquier momento luego de que **Shipping App** cambie de estado, se puede ir al detalle de la compra y clickear en **Seguir envio en (courier)**, que redirigira a la página de **Shipping app** para ver el detalle del envio 


### Alternativamente puede usar los comandos en la terminal, de la ejecución en local 

- API KEY: SHIPPING_API_KEY=296l1gzir92d2un7du8erbksou9f5xpf
- Reemplaze Order ID con el valor de la orden detallada en el URL del detalle de la compra realizada:
   - *proyecto-c-buyer-compulibre.vercel.app/orders/{ORDER_ID}*
- trackingId = "TRK-COMPU-TEST-01" ó si ya genero una etiqueta en Shipping app, use ese tracking id

### Paso 1 — Simular "En tránsito"

```powershell
$body = @{
    trackingId = "TRK-COMPU-TEST-01"
    courier    = "Andreani"
    status     = "IN_TRANSIT"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://proyecto-c-buyer-compulibre.vercel.app/api/orders/{ORDER_ID}/shipping-webhook" `
    -Method Post `
    -Headers @{ "x-api-key" = "296l1gzir92d2un7du8erbksou9f5xpf"; "Content-Type" = "application/json" } `
    -Body $body
```

### Paso 2 — Simular "Entregado"

```powershell
$body = @{
    trackingId = "TRK-COMPU-TEST-01"
    courier    = "Andreani"
    status     = "DELIVERED"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://proyecto-c-buyer-compulibre.vercel.app/api/orders/{ORDER_ID}/shipping-webhook" `
    -Method Post `
    -Headers @{ "x-api-key" = "296l1gzir92d2un7du8erbksou9f5xpf"; "Content-Type" = "application/json" } `
    -Body $body
```


## Comentarios de Evaluación Local

Este proyecto utiliza **pnpm** como gestor de paquetes principal, por lo tanto se debe utilizar:

   ```bash
   pnpm install
   ```

---

## Limitaciones Conocidas

| Limitación | Detalle |
|-----------|---------|
| **Se elimino la notificación de LABEL_CREATED de Shipping app** |  Por decisión del equipo de Shipping App, el estado `LABEL_CREATED` no dispara notificación al comprador ni actualiza el timeline. Solo `IN_TRANSIT` y `DELIVERED` tienen efecto visible. |
| **Stock no se descuenta** | La Buyer App consulta el stock a la Seller App para mostrarlo, pero no hace bloqueo. La reserva firme ocurre en el circuito de pago. Decisión arquitectónica acordada con el equipo. |
| **Un solo vendedor por orden** | El carrito solo acepta productos de un mismo vendedor por orden. Intentar agregar productos de otro vendedor reemplaza el contenido del carrito. |
| **Dirección inmutable post-perfil** | Una vez que el usuario guardó su dirección de envío por primera vez, no puede modificarla desde la UI (el campo queda bloqueado). Esto garantiza consistencia con las órdenes ya creadas. |
| **Órdenes no eliminables por el usuario** | El historial de órdenes en `/orders` es de solo lectura para el comprador. Las órdenes solo pueden eliminarse desde el panel de Admin (`/api/system/buyers/{id}/reset-orders`). |
| **Limpieza de notificaciones automática** | Se tomo la decision que el usuario mantenga notificaciones (con un limite de 15) pero que cada 30 dias se borren solas. |
| **Multiples Keys Aceptadas para los webhooks** | Se tomo la decision de que se acepten cualquiera de las Keys definidas en el proyecto para asegurarse que en el testeo no ocurran errores, aunque deberia usarse solamente la key que corresponde. |
