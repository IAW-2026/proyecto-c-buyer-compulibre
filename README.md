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

**Usuario Administrador (Admin)**

- **Email:** `administrador+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`
- **Codigo de confirmación:** 424242

Este usuario debe tener el rol `"admin"` configurado en su `publicMetadata` de Clerk:

```json
{
  "role": "admin"
}
```

- **[Instrucciones para utilizar o evaluar la aplicación](./docs/evaluacion-local.md)**

## Descripción del Proyecto

**Buyer App** es el portal de compras principal del marketplace de hardware **CompuLibre**. Su arquitectura orientada a eventos escucha activamente webhooks asíncronos para actualizar el estado de las órdenes en tiempo real, sin depender de recargas manuales.

## Documentación Adicional

- **[Notas o comentarios para la corrección](./docs/comentarios.md)**: Detalla decisiones de diseño y consideraciones técnicas tomadas durante el desarrollo.

