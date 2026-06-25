# CompuLibre - Buyer App

Aplicación **Buyer** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `CompuLibre`.

Esta app corresponde al rol del comprador en el proyecto de tipo **C (Marketplace)**.

---

## Descripción del Proyecto

Módulo central de experiencia del cliente y adquisición de hardware para el ecosistema del marketplace CompuLibre. Esta aplicación consume el catálogo maestro en tiempo real, gestiona carritos de compra y procesa transacciones mono-vendedor (restringidas a un único vendedor por orden) mediante la integración con la pasarela de pagos externa. Provee a los clientes un sistema de notificaciones y seguimiento logístico de sus paquetes con actualizaciones en tiempo real vía webhooks asíncronos. Los administradores pueden monitorear métricas de rendimiento financiero y logística operativa, además de auditar transacciones e intervenir en el estado de usuarios y carritos a través del Control Plane de la plataforma.

---


## Deploy

🔗 **https://proyecto-c-buyer-compulibre.vercel.app/**

## Usuarios de Prueba:

**Usuario Comprador (Buyer)**

- **Email:** `buyer+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`
- **Codigo de confirmación:** 424242

**Usuario Administrador (Admin)**

- **Email:** `administrador+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`
- **Codigo de confirmación:** 424242

Este usuario tiene el rol `"admin"` configurado en su `publicMetadata` de Clerk:

```json
{
  "role": "admin"
}
```

##

---
## Flujo de usuario (Buyer)

1. El usuario se registra o inicia sesión el usuario **Buyer**.
2. Explora el catálogo, agrega ítems al carrito y confirma el pedido. (solo se puede comprar a un único vendedor por orden).
3. Luego si no lo hizo, completa su perfil con nombre completo, dirección y código postal (paso obligatorio para poder realizar la compra).
4. Es redirigido a la **Payments App** para completar el pago.
5. Una vez aprobado el pago, la orden se actualiza automáticamente (vía webhook).
6. El usuario puede ver y hacer seguimiento del estado de sus órdenes desde la sección **Mis Compras**, incluyendo el estado logístico del envío.
7. El sistema luego notifica al usuario cuando el paquete cambia a los estados **"en tránsito"** y **"entregado"**.

## Flujo de administrador (Admin)

1. El administrador inicia sesión con una cuenta de tipo **Admin**.
2. Accede al panel de administración en `/admin`.
3. Desde la pestaña **Rendimiento Operativo**, ve información relevante de los ingresos (ganancia, retenido, monto promedio y en fuga), y el listado de todas las ultimas transacciones.
4. Desde la pestaña **Análisis de Carritos**, ve información relevante en base a los estados posibles del carrito (activos, convertidos, cancelados y rechazados).
5. Desde la pestaña **Logística Operativa**, ve las compras no despachadas y paquetes que se encuentran en tránsito.
6. Desde la pestaña **Compradores**, ve el listado de todos los compradores, los cuales puede suspender o reactivar cuentas, realizar el borrado del formulario, el borrado de las ordenes realizadas y un botón de borrado que unifica estos ultimos dos.

---

### **[Notas, instrucciones o comentarios para la corrección](./docs/evaluacion-local.md)**

