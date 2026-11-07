# MAQSYMA - Inversoras de Soldadura ESAB

Experiencia web interactiva *Industrial Cinematic Premium* diseñada para MAQSYMA, distribuidor especializado de tecnología de soldadura ESAB en México y Perú.

---

## 1. Pila Tecnológica & Arquitectura
- **Frontend**: HTML5 Semántico, CSS3 nativo (`style.css`), Vanilla JS modular en [`main.js`](file:///C:/Users/gorti/Desktop/MAQSYMA_design/main.js), GSAP 3.12.5 + ScrollTrigger.
- **Backend Serverless**: Vercel Serverless Functions (`api/`) para autenticación, cálculo del carrito y administración de inventario.
- **Base de Datos**: **Supabase** (PostgreSQL con Row Level Security y auditoría).
- **Seguridad**: Autenticación con contraseña hasheada (bcrypt), sesiones seguras con cookies `HttpOnly`, `SameSite=Lax`, rate limiting en login y validación en servidor de stock y precios.

---

## 2. Variables de Entorno en Vercel
Copia las variables de [`.env.example`](file:///C:/Users/gorti/Desktop/MAQSYMA_design/.env.example) al panel de tu proyecto en Vercel (*Project Settings -> Environment Variables*):

| Variable | Descripción |
| :--- | :--- |
| `SUPABASE_URL` | URL de tu proyecto en Supabase (ej. `https://xyz.supabase.co`) |
| `SUPABASE_ANON_KEY` | Clave pública anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta Service Role (para operaciones protegidas del backend) |
| `JWT_SECRET` | Llave secreta aleatoria para la firma de cookies de sesión |
| `INITIAL_ADMIN_EMAIL` | Correo del administrador inicial |
| `INITIAL_ADMIN_PASSWORD` | Contraseña robusta para el administrador inicial |

---

## 3. Despliegue y Migración de Base de Datos

### Paso A: Crear las tablas en Supabase
1. Ingresa a tu panel de Supabase y abre el **SQL Editor**.
2. Copia y ejecuta el script contenido en [`supabase/schema.sql`](file:///C:/Users/gorti/Desktop/MAQSYMA_design/supabase/schema.sql). Creará las tablas `products`, `inventory_audit_log` y `admin_users` junto con sus políticas RLS.

### Paso B: Poblar Catálogo y Crear Primer Administrador (Seed)
En tu terminal local o entorno de CI con las variables configuradas en tu `.env`:
```bash
npm run seed
```
Este script:
1. Lee los 8 modelos de equipos de soldadura de [`data/products.json`](file:///C:/Users/gorti/Desktop/MAQSYMA_design/data/products.json) y los inserta en Supabase (`rebel-emp-215ic`, `rogue-em-210`, `warrior-500`, etc.).
2. Hashea la contraseña con `bcrypt` (factor 12) y crea el usuario inicial en `admin_users`.

---

## 4. Acceso Administrativo
- **Ruta de Login**: [`/admin-login.html`](file:///C:/Users/gorti/Desktop/MAQSYMA_design/admin-login.html).
- Los botones de acceso público al panel han sido removidos del header y sustituidos en el footer por un discreto enlace a *Acceso Colaboradores*.
- Si un usuario no autenticado intenta abrir el panel o llamar directamente a la API de administración (`/api/admin/products`), el servidor responde con **401 Unauthorized** y lo redirige a la pantalla de login.

---

## 5. Pruebas Automatizadas
Para verificar la protección de endpoints, validación de datos y cálculo de totales en servidor:
```bash
npm test
```
Ejecuta la suite en [`test/api.test.js`](file:///C:/Users/gorti/Desktop/MAQSYMA_design/test/api.test.js) que valida:
1. Bloqueo 401 en endpoints administrativos sin sesión.
2. Rechazo de stock negativo o inválido en servidor.
3. Rechazo de precios negativos en servidor.
4. Cálculo correcto de subtotales, IVA (16%) y totales en el servidor.
