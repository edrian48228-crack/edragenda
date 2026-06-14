# Taller — PWA de reparaciones (v2)

Aplicación web instalable (PWA) para gestionar reparaciones electrónicas.
Solo HTML, CSS, JavaScript y JSON. Sin backend ni dependencias.

## Novedades v2
- **Sincronización GitHub vía API** (admin → token + usuario + repo + rama + ruta + auto-sync)
- **Varias fotos del equipo** + foto del cliente
- **Audio de aceptación** del cliente (grabar desde el navegador o subir archivo)
- **"Sin datos disponibles"** en cada campo opcional
- **Lista de equipos predefinida** y editable desde administración
- **Guardar JSON en una ubicación** del dispositivo (File System Access API; auto-guardado)
- **Migración automática y compatible** con datos creados en v1

## Instalación en GitHub Pages
1. Sube esta carpeta a un repositorio GitHub.
2. Settings → Pages → Branch: `main` → carpeta `/`.
3. Abre la URL desde Android Chrome → menú → "Instalar app".

## Sincronización con GitHub
1. Crea un Personal Access Token (Fine-grained) con permiso **Contents: read/write** sobre tu repo.
2. En la app: **Admin → Sincronización GitHub** → completa usuario, repo, rama, ruta del JSON y token.
3. Activa "Sincronización automática". Cada cambio se sube como commit.
4. En otro dispositivo: configura los mismos datos y pulsa **Bajar de GitHub**.

> El token solo se guarda en `localStorage` del dispositivo.

## Guardar JSON en una ubicación del dispositivo
**Admin → Guardar JSON en una ubicación → Elegir ubicación**. La app escribirá
automáticamente cada cambio en ese archivo (requiere Chrome/Edge en Android o escritorio).

## Compatibilidad
El sistema usa `schemaVersion` y una función de migración. Versiones futuras
seguirán abriendo los JSON antiguos sin perder datos.

Creado por **Edrian Cruz Down**.
