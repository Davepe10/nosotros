# Juntos 🤍 — versión producción

Aplicación privada para dos personas con Next.js + Supabase: reflexiones privadas/compartidas, planes, acuerdos y recuerdos.

## Despliegue

### 1. Supabase
1. Crea/abre el proyecto.
2. SQL Editor → New query → pega **todo** `supabase/schema.sql` → Run.
3. En **Connect / API** copia la Project URL y la **Publishable key**.
4. Authentication → URL Configuration:
   - Site URL: tu URL final HTTPS (por ejemplo `https://tu-app.vercel.app`).
   - Redirect URLs: agrega `https://tu-app.vercel.app/auth/callback`.
   - Para local agrega `http://localhost:3000/auth/callback`.
5. Mantén activada la confirmación por correo para producción.

### 2. Vercel
1. Importa el repositorio de GitHub.
2. Añade estas variables en Production (y Preview si lo usarás):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Deploy.
4. Vuelve a Supabase y confirma que Site URL / Redirect URL usan el dominio final.

No uses `service_role` ni una secret key en variables `NEXT_PUBLIC_*`.

## Flujo de usuarios
1. Persona A crea cuenta y confirma su correo.
2. En onboarding pulsa **Crear espacio** y recibe un código.
3. Persona B crea su propia cuenta, confirma correo y usa **Unirme con código**.
4. La base limita el espacio a dos integrantes.

No hay que copiar UUIDs ni insertar memberships a mano.

## Seguridad aplicada
- Cookie-based auth con `@supabase/ssr`.
- Proxy de Next.js para refrescar sesión.
- `/app` y `/onboarding` verifican identidad en servidor con `getClaims()`.
- RLS en todas las tablas.
- Reflexiones privadas solo son visibles para su autor; las compartidas, para la pareja.
- `couples` y `memberships` no aceptan altas directas desde el cliente; usan RPC autenticadas.
- La RPC de unión bloquea la fila y evita más de dos integrantes, incluso con solicitudes simultáneas.
- Sin `service_role` en frontend.
- Headers de endurecimiento y `noindex` para la aplicación privada.

## Desarrollo local
```bash
cp .env.example .env.local
# rellena las dos variables
npm install
npm run typecheck
npm run dev
```

Antes de publicar:
```bash
npm run typecheck
npm run build
```
