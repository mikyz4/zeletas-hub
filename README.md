# ZELETAS HUB

Sitio estático de ZELETAS conectado a Supabase.

## Arquitectura
- Frontend: HTML/CSS/JavaScript estático.
- Auth: Supabase Auth (Google + SMS/Twilio Verify).
- Datos: Supabase PostgreSQL con RLS.
- Funciones sensibles: Supabase Edge Functions.
- Deploy: Netlify.

## Backend versionado
Las migraciones de supabase/migrations/ son la fuente versionada del esquema. Las funciones de supabase/functions/ contienen el código desplegado para acciones que requieren privilegios de servidor.

## Seguridad
La clave publishable de Supabase se usa en el navegador por diseño. Nunca deben añadirse al repositorio claves service_role, tokens privados de Twilio u otros secretos.

## Flujo recomendado
1. Cambiar el esquema mediante una migración.
2. Aplicar la migración en Supabase.
3. Actualizar el frontend.
4. Ejecutar las comprobaciones de GitHub Actions.
5. Probar Auth, Marketplace, contacto y mensajería antes de producción.

## Estado
Auth y el primer núcleo de Marketplace/contacto/mensajería están conectados. Pagos, multi-tienda real y los gestores avanzados de vehículos/inmuebles/servicios todavía requieren implementación de negocio adicional.