# CompuLibre - Buyer App

## Descripción
**Buyer App** es el portal principal de compras del marketplace de hardware **CompuLibre**. Esta aplicación permite a los usuarios buscar componentes, agregar productos a su carrito, procesar pagos de forma segura y realizar el seguimiento en tiempo real de sus envíos. Forma parte de un ecosistema de 4 aplicaciones interconectadas mediante APIs REST.

## 🚀 Enlace al Deploy
🔗 **[Agregar el link del deploy en Vercel / hosting aquí]**

## 🔐 Acceso al Sistema

La autenticación de todo el ecosistema CompuLibre está gestionada de forma centralizada a través de **Clerk**. 

### Usuario Final (Comprador)
Esta aplicación está diseñada exclusivamente para la experiencia de compra.
- **Cómo acceder:** Cualquier persona puede registrarse libremente utilizando una cuenta de Google, GitHub o correo electrónico desde la pantalla principal (`/sign-in`).
- **Configuración de rol:** Al iniciar sesión por primera vez, el sistema detectará tu cuenta de Clerk y generará automáticamente tu perfil de comprador (`BuyerProfile`) en la base de datos para que puedas empezar a operar de inmediato.

> **Nota sobre otros roles:** Como se estableció en la arquitectura del proyecto, la *Buyer App* no posee panel de administración ni de ventas. Para gestionar publicaciones debes ingresar a la **Seller App**, y para administración general al **Panel de control** o **Shipping App**.
