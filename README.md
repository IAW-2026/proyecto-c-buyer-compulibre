# CompuLibre - Buyer App

## Descripción

**Buyer App** es el portal principal de compras del marketplace de hardware **CompuLibre**. Esta aplicación permite a los usuarios buscar componentes, agregar productos a su carrito, procesar pagos de forma segura y realizar el seguimiento en tiempo real de sus envíos. Forma parte de un ecosistema de 4 aplicaciones interconectadas mediante APIs REST.

## Enlace al Deploy

🔗 **https://proyecto-c-buyer-compulibre.vercel.app/**

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

## Desarrollo Local e Instalación

Para ejecutar este proyecto localmente:

1. Clona el repositorio e ingresa al directorio.
2. ¡IMPORTANTE! Instala las dependencias utilizando pnpm:

   ```bash
   pnpm install
   ```

   > **Nota sobre pnpm:** Si al intentar instalar o iniciar el servidor te encuentras con el error `[ERR_PNPM_IGNORED_BUILDS]`, se debe a las políticas de seguridad de pnpm (v9+). Para solucionarlo, ejecuta el comando `pnpm approve-builds`, selecciona con la barra espaciadora los paquetes (como `esbuild` o `prisma`) y presiona Enter para aprobarlos.

3. Configura tus variables de entorno copiando el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
4. Sincroniza la base de datos de Prisma y genera el cliente:
   ```bash
   pnpm dlx prisma generate
   pnpm dlx prisma db push
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
