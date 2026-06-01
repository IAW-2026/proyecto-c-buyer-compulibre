# CompuLibre - Buyer App

## Descripción

**Buyer App** es el portal principal de compras del marketplace de hardware **CompuLibre**. Esta aplicación permite a los usuarios buscar componentes, agregar productos a su carrito, procesar pagos de forma segura y realizar el seguimiento en tiempo real de sus envíos. Forma parte de un ecosistema de 4 aplicaciones interconectadas mediante APIs REST.

## Enlace al Deploy

🔗 **[Agregar el link del deploy en Vercel / hosting aquí]**

## Acceso al Sistema

La autenticación de todo el ecosistema CompuLibre está gestionada de forma centralizada a través de **Clerk**.

### Usuario Final (Comprador)

- **Acceso:** Cualquier persona puede registrarse libremente utilizando una cuenta de Google, o correo electrónico desde (`/sign-in`).
- **Funcionalidades:** Generación automática de perfil, uso de carritos mono-vendedor, flujo de pago (mock) y seguimiento visual del estado del envío.

### Usuario Administrador (Evaluación)

Para evaluar el panel de control, por favor utiliza las siguientes credenciales de prueba:

- **Email:** `test_buyer+clerk_test@example.com`
- **Contraseña:** `admintest2026!`
- **Funcionalidades:** Al iniciar sesión con este rol, aparecerá un botón "Admin" en el Navbar. La ruta `/admin` permite ver el panel de métricas, gráficos de estado, historial de transacciones global y permite la suspensión de cuentas de compradores.
