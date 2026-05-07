# CompuLibre — Buyer App: Contexto para desarrollo (Etapa 2)

## Contexto del proyecto
Soy un estudiante de Ingeniería desarrollando la **Buyer App** de
CompuLibre, un marketplace de hardware. Mi app es una de cuatro
webapps independientes. En esta Etapa 2, debo desarrollarla de forma
**completamente aislada**, mockeando (simulando) cualquier llamada a
APIs externas.

---

## Stack tecnológico estricto
- **Framework:** Next.js con App Router
- **Base de datos:** PostgreSQL propia (solo para esta app)
- **ORM:** Prisma
- **Autenticación:** Clerk
- **Estilos:** Tailwind CSS
- **Lenguaje:** TypeScript estricto (sin `any`)

---

## Reglas de arquitectura y código
- **Estructura:** Componentes UI en `/components`, lógica/utils en
  `/lib`, configuración de Prisma en `/lib/db`.
- **Validaciones:** Toda validación fuerte va del lado del servidor
  (Server Actions o API Routes).
- **Tipado:** No usar `any`. Definir interfaces estrictas para la BD
  y para los mocks.
- **Búsqueda:** Utilizar parámetros en la URL para búsquedas y
  paginación (`?search=rtx&page=2`).

---

## Reglas de negocio y roles

- **Usuarios y PK:** El sistema usa Clerk. Un usuario puede ser
  Comprador y Vendedor a la vez. La Primary Key del `BuyerProfile`
  es directamente el `clerkUserId`. Los roles se leen del JWT de Clerk
  (`publicMetadata.roles`) y **no se persisten en la base de datos**.
- **Restricción de checkout:** Un carrito solo puede procesar el
  checkout si todos sus productos pertenecen al **mismo vendedor**
  (`sellerId`). Si hay productos de distintos vendedores, mostrar un
  aviso y pedirle al usuario que compre por separado.
- **Autenticación inter-servicios:** Los webhooks que recibimos (pagos,
  envíos) deben validarse exigiendo el header
  `x-service-token: <SERVICE_TOKEN>`. Este header es distinto al JWT
  de Clerk que usan los usuarios finales.

---

## Modelo de datos (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model BuyerProfile {
  id                     String       @id
  // Este campo ES el clerkUserId. No hay id separado.
  // Los roles NO se persisten aquí, se leen del JWT de Clerk.
  fullName               String
  defaultShippingAddress String?
  createdAt              DateTime     @default(now())
  carts                  Cart[]
  orders                 BuyerOrder[]
}

model Cart {
  id        String       @id @default(cuid())
  buyerId   String
  buyer     BuyerProfile @relation(fields: [buyerId], references: [id])
  status    CartStatus   @default(ACTIVE)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  items     CartItem[]
}

enum CartStatus {
  ACTIVE
  ABANDONED
  CONVERTED
}

model CartItem {
  id                String  @id @default(cuid())
  cartId            String
  cart              Cart    @relation(fields: [cartId], references: [id])
  externalProductId String  // ID del producto en Seller App
  productName       String  // Snapshot capturado al agregar al carrito
  quantity          Int
  cachedPrice       Decimal // Snapshot capturado al agregar al carrito
  sellerId          String  // Necesario para validar checkout mono-vendedor
}

model BuyerOrder {
  id                    String           @id @default(cuid())
  buyerId               String
  buyer                 BuyerProfile     @relation(fields: [buyerId], references: [id])
  sellerId              String           // Necesario para enviar a Payments App en el checkout
  totalAmount           Decimal
  status                BuyerOrderStatus @default(PENDING_PAYMENT)
  externalTransactionId String?          // ID de Payments App, null hasta que se inicia el pago
  trackingId            String?          // UUID de Shipping App, null hasta que el vendedor despacha
  courier               String?          // Snapshot logístico recibido por webhook
  shipmentStatus        String?          // Último estado de envío recibido por webhook
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  items                 BuyerOrderItem[]
}

enum BuyerOrderStatus {
  PENDING_PAYMENT
  PAID
  SHIPPED
  DELIVERED
  PAYMENT_FAILED
  CANCELLED
}

model BuyerOrderItem {
  id                String     @id @default(cuid())
  buyerOrderId      String
  order             BuyerOrder @relation(fields: [buyerOrderId], references: [id])
  externalProductId String     // ID del producto en Seller App
  productName       String     // Snapshot del nombre al momento de la compra
  quantity          Int
  unitPrice         Decimal    // Snapshot del precio al momento de la compra
}
```

---

## Flujo de checkout (Etapa 2 con mocks)

1. **Validación:** El usuario confirma el carrito en `/checkout`. La
   Server Action verifica que todos los `CartItem` tengan el mismo
   `sellerId`. Si no, mostrar error y no continuar.
2. **Persistencia:** Crear `BuyerOrder` en estado `PENDING_PAYMENT` y
   copiar cada `CartItem` a `BuyerOrderItem` con snapshot de nombre
   y precio.
3. **Stock:** Llamar a `mockLockStock()` por cada ítem. Si alguno falla
   por sin stock, mostrar error, no continuar y no crear la orden.
4. **Pago:** Llamar a `mockInitiateCheckout()`, que retorna un
   `transactionId` falso y una `checkoutUrl` falsa. Guardar el
   `transactionId` en la orden.
5. **Simulación de éxito:** La ruta `/checkout/mock-success?order_id=xxx`
   dispara internamente la lógica del webhook de pago aprobado,
   pasando la orden a `PAID`. **Esta ruta existe solo en Etapa 2 y
   se elimina en Etapa 3.**
6. **Simulación de fallo:** La ruta `/checkout/mock-failure?order_id=xxx`
   dispara internamente la lógica del webhook de pago rechazado,
   pasando la orden a `PAYMENT_FAILED` y llamando a `mockUnlockStock()`
   para liberar el stock. **También se elimina en Etapa 3.**

---

## Endpoints que expone la Buyer App (webhooks)

Ambos endpoints deben:
- Validar el header `x-service-token` antes de procesar.
- Ser **idempotentes:** verificar si la orden ya tiene el estado
  correspondiente antes de ejecutar lógica. Si ya está en el estado
  correcto, responder `200 OK` sin realizar acciones adicionales.

### `POST /api/orders/[order_id]/payment-webhook`
Llamado por Payments App cuando Mercado Pago responde.

- Si `status === 'APPROVED'`: actualizar orden a `PAID`.
- Si `status === 'REJECTED'`: actualizar orden a `PAYMENT_FAILED`
  y llamar a `mockUnlockStock()` por cada ítem.

### `POST /api/orders/[order_id]/shipping-webhook`
Llamado por Shipping App cuando hay cambios en el envío.

- Guardar o actualizar `trackingId`, `courier` y `shipmentStatus`
  en la orden.
- Si `status === 'DELIVERED'`: actualizar orden a `DELIVERED`.

---

## Rutas requeridas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Catálogo (mockeado desde Seller App) | Público |
| `/products/[id]` | Detalle del producto | Público |
| `/cart` | Carrito de compras | Protegido (Clerk) |
| `/checkout` | Proceso de checkout | Protegido (Clerk) |
| `/checkout/mock-success` | Simula pago aprobado (solo Etapa 2) | Interno |
| `/checkout/mock-failure` | Simula pago rechazado (solo Etapa 2) | Interno |
| `/orders` | Historial del comprador | Protegido (Clerk) |
| `/orders/[id]` | Detalle de una orden | Protegido (Clerk) |
| `/admin/buyers` | Gestión de compradores | Solo rol `admin` |
| `/admin/orders` | Gestión de órdenes | Solo rol `admin` |

Las rutas `/admin/*` verifican que el JWT de Clerk contenga el rol
`admin` en `publicMetadata.roles`. Si no, redirigir a `/`.

---

## Variables de entorno (`.env.local`)

```bash
# Base de datos
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Autenticación inter-servicios
SERVICE_TOKEN=
```

---

## Script de seed (datos precargados)

Crear `/prisma/seed.ts` que genere:
- Perfiles de prueba con distintos `clerkUserId`.
- Carritos activos con ítems del mismo vendedor.
- Órdenes en todos los estados posibles: `PENDING_PAYMENT`, `PAID`,
  `SHIPPED`, `DELIVERED`, `PAYMENT_FAILED`.
- Usar UUIDs realistas para los `trackingId` (no secuencias predecibles
  como `TRK-0001`).