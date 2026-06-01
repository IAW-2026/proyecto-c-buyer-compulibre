# CompuLibre - Buyer App

Aplicación **Buyer** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `CompuLibre`.

Esta app corresponde al rol del comprador en el proyecto de tipo **C (Marketplace)**.

---

## Deploy

🔗 **(https://proyecto-c-buyer-compulibre.vercel.app/)**

## Usuarios de Prueba:

**Usuario Comprador (Buyer)**

- **Email:** `buyer+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`
- **Codigo de confirmación:** 424242
- **Descripción:** Permite realizar el flujo completo de compras de forma segura. Puede explorar el catálogo, agregar componentes al carrito (con la regla de pedir a un solo vendedor a la vez), definir datos de envío, procesar pagos y consultar tanto sus órdenes realizadas como notificaciones.

**Usuario Administrador (Admin)**

- **Email:** `administrador+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`
- **Codigo de confirmación:** 424242
- **Descripción:** Además de poseer todas las capacidades del usuario regular, accede a la ruta `/admin` para gestionar la plataforma. Desde allí puede visualizar métricas financieras y el historial global de transacciones, actualizar los estados de envío (despacho, en tránsito, entregado) y restablecer los datos de los usuarios a su estado inicial.

Este usuario debe tener el rol `"admin"` configurado en su `publicMetadata` de Clerk:

```json
{
  "role": "admin"
}
```

## Instrucciones para utilizar o evaluar la aplicación

### Flujo en la Interfaz Web:

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

- **[Guía de Evaluación Local y Testing de APIs](./docs/evaluacion-local.md)**

## Descripción del Proyecto

**Buyer App** es el portal de compras principal del marketplace de hardware **CompuLibre**. Su arquitectura orientada a eventos escucha activamente webhooks asíncronos para actualizar el estado de las órdenes en tiempo real, sin depender de recargas manuales.

## Documentación Adicional

Para no sobrecargar este archivo principal, la información técnica extendida se encuentra separada:

- **[Notas o comentarios para la corrección](./docs/comentarios.md)**: Detalla decisiones de diseño y consideraciones técnicas tomadas durante el desarrollo.

- **[Guía de Evaluación Local y Testing de APIs](./docs/evaluacion-local.md)**: Detalla cómo instalar el proyecto localmente usando pnpm, y proporciona la estructura JSON exacta y los headers necesarios para probar los endpoints de webhooks con herramientas como Thunder Client.
