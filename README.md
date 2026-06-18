# UnlockBox PWA

Sitio web profesional para alquiler de cajas de desbloqueo (unlock boxes) y descodificadores.
Construido con HTML + CSS + JavaScript puro, listo para alojar en GitHub Pages.

## ✨ Características

- 🎨 Diseño moderno, oscuro (negro + rojo/marrón)
- 📱 100% responsive (móvil, tablet, escritorio)
- ⚡ PWA instalable (funciona offline)
- 🔐 Panel de administrador (contraseña por defecto: `admin123`)
- 📦 Gestión de cajas: añadir, editar, eliminar
- 👥 Sistema de registro/solicitudes de clientes
- 💬 Iconos directos a WhatsApp, Telegram, Facebook, Teléfono
- ⬇️ Enlaces de descarga por caja
- ℹ️ Modal de más información por caja
- 💾 Backup: exportar / importar JSON
- 🔍 Buscador de cajas

## 🚀 Subir a GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta.
3. Ve a **Settings → Pages → Source → main branch / root**.
4. Tu sitio estará en `https://TU_USUARIO.github.io/TU_REPO/`.

## 🔑 Cambiar la contraseña de administrador

Edita `js/app.js`, línea ~7:

```js
const ADMIN_PASSWORD = 'tu_nueva_contraseña';
```

## 📊 Datos

Los datos (cajas y clientes) se guardan en `localStorage` del navegador. Para llevar los datos a otro dispositivo usa **Exportar / Importar JSON** dentro del panel de administrador.

> ⚠️ Para una base de datos compartida entre múltiples usuarios necesitarías un backend (Firebase, Supabase, etc.). Esta versión es client-only para GitHub Pages.

## 📂 Estructura

```
unlock-pwa/
├── index.html
├── manifest.json
├── sw.js              ← Service Worker (PWA)
├── css/styles.css
├── js/app.js
├── icons/             ← Íconos de la PWA
└── images/            ← Imágenes (hero + cajas)
```

## 🧭 Uso

- **Inicio:** Acceso directo al menú principal y al catálogo.
- **Cajas:** Lista de todas las cajas con buscador.
- **Registro:** Formulario para que clientes soliciten alquiler.
- **Admin:** Botón superior derecho. Tras iniciar sesión podrás:
  - Crear/editar/eliminar cajas
  - Ver todas las solicitudes de clientes
  - Hacer backup de tus datos

¡Listo! 🎉
