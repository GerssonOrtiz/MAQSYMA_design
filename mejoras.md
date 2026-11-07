Eres un ingeniero senior full-stack. Trabaja sobre el repositorio https://github.com/GerssonOrtiz/MAQSYMA_design.git (proyecto desplegado en Vercel, sitio de MAQSYMA, distribuidor de soldadoras inversoras ESAB).

## Contexto
- La web usa una identidad visual "Industrial Cinematic Premium". Debe conservarse: no cambies paleta, tipografía, jerarquía ni el estilo de las secciones salvo lo que se pida explícitamente.
- No inventes información comercial ni técnica (precios, especificaciones, garantías, stock, certificaciones). Si necesitas un dato, déjalo como placeholder claramente marcado (ej. `TODO_DATO_ESAB`) y repórtalo.
- El contenido usa animaciones GSAP / ScrollTrigger y partículas. En celulares las animaciones y partículas van lentas.
- Hoy no está claro cómo se guardan los cambios de inventario y precios. Debes averiguarlo antes de implementar nada.

## Fase 1: Diagnóstico (entrega antes de codificar)
1. Identifica el stack, el framework, el bundler y la configuración de despliegue (vercel.json, package.json, estructura de carpetas).
2. Determina cómo persisten hoy los cambios de stock y precios: localStorage, sessionStorage, un archivo JSON, un backend, un servicio externo, u otro. Cita archivo y línea.
3. Localiza el panel "Admin MAQSYMA" y dónde está su lógica. Indica si se muestra a cualquier visitante.
4. Localiza todas las animaciones GSAP, ScrollTrigger y el código de partículas. Indica cuáles se ejecutan en móvil, cuántas partículas se crean, si usan canvas o DOM, si usan requestAnimationFrame propio o el ticker de GSAP, y si se pausan fuera de pantalla.
5. Revisa si existe soporte para `prefers-reduced-motion`.
6. Lista las imágenes y videos pesados y cómo se cargan.
Entrega este diagnóstico como un documento corto con hallazgos, archivos afectados y una propuesta de arquitectura. Espera mi confirmación antes de la Fase 2 si hay una decisión de arquitectura (ver Fase 2, punto 1).

## Fase 2: Login de administrador e inventario editable

1. Propón dos opciones de persistencia y recomienda una, justificando la elección para Vercel:
   - Opción A: Vercel Functions (API routes) + base de datos gestionada (Vercel Postgres/Neon, Supabase, Upstash/KV u otra).
   - Opción B: servicio BaaS con autenticación integrada (ej. Supabase Auth).
   Indica costos aproximados y límites del plan gratuito solo si puedes verificarlos; si no, dilo.
2. Implementa autenticación real:
   - La verificación de credenciales ocurre siempre en el servidor. Nunca en el cliente.
   - Contraseñas con hash robusto (bcrypt o argon2). Nunca en texto plano ni en el código.
   - Sesión con cookies `httpOnly`, `Secure`, `SameSite=Strict` o Lax, con expiración.
   - Rate limiting y bloqueo temporal en el endpoint de login.
   - Protección CSRF en las operaciones de escritura.
   - Rutas admin protegidas en servidor (middleware), no solo ocultas en la interfaz.
   - Las variables sensibles van en variables de entorno de Vercel. Añade `.env.example` sin valores reales.
3. Crea un usuario administrador inicial mediante un script de seed que lea credenciales de variables de entorno. No dejes credenciales por defecto en el código.
4. Mueve el panel admin a una ruta protegida (ej. `/admin`) con:
   - Formulario de login con etiquetas accesibles y mensajes de error genéricos.
   - Vista de inventario con stock y precios en USD y PEN, editables.
   - Validación en servidor: stock entero no negativo, precios numéricos con límite de decimales, moneda válida.
   - Registro de auditoría mínimo (quién cambió qué y cuándo).
   - Botón "Cerrar sesión".
   - Eliminar la opción "Restablecer Catálogo de Fábrica" del acceso público; si se conserva, solo para admin y con confirmación doble.
5. La tienda pública lee el inventario desde el servidor (SSR, ISR o fetch con caché corta) para que los cambios se reflejen, en lugar de depender de datos fijos en el código.
6. El carrito y los totales se calculan con los precios que devuelve el servidor, no con los del navegador.
7. Migra los productos actuales del código o localStorage a la base de datos mediante un script de seed. Confirma que el número de productos y sus datos coinciden antes y después.

## Fase 3: Rendimiento en móvil (animaciones y partículas)

1. Detecta dispositivos de gama baja y móvil y reduce la carga:
   - Menos partículas en móvil (o desactivarlas si el dispositivo es de baja potencia).
   - Limita `devicePixelRatio` en canvas (máximo 1.5 o 2 en móvil).
   - Usa solo propiedades `transform` y `opacity` en animaciones; evita animar `top`, `left`, `width`, `box-shadow` ni `filter` cuando sea costoso.
   - Pausa el canvas y las animaciones cuando la sección no está visible (IntersectionObserver) o la pestaña está oculta (visibilitychange).
   - Usa un único loop (ticker de GSAP o un solo rAF) en lugar de varios.
   - Destruye los ScrollTrigger y timelines al desmontar o recalcular (`ScrollTrigger.kill`, `gsap.context().revert()`).
   - Recalcula con `ScrollTrigger.refresh` solo cuando cambie el tamaño significativamente.
2. Respeta `prefers-reduced-motion`: sin partículas ni animaciones de desplazamiento; contenido visible sin animación.
3. Imágenes: convierte a WebP o AVIF cuando sea posible, usa `srcset`, `sizes`, `loading="lazy"` para lo que está bajo el pliegue y precarga solo el hero. Define dimensiones explícitas para evitar CLS.
4. Carga GSAP y plugins solo donde se usan. Evita importar la librería completa si el bundle lo permite con tree shaking.
5. Mide antes y después:
   - Lighthouse móvil (Performance, LCP, INP, CLS, TBT) en la URL de producción o preview.
   - FPS aproximado durante el scroll en móvil (Chrome DevTools con throttling de CPU 4x).
   Entrega una tabla con valores antes y después. No inventes métricas: si no puedes ejecutar la medición, indícalo.

## Restricciones generales
- Haz cambios pequeños y revisables, en commits separados por fase: `feat(admin)`, `feat(auth)`, `perf(motion)`, `fix(security)`, etc.
- No cambies la identidad visual ni el copy comercial sin que lo pida.
- No agregues dependencias pesadas sin justificarlas.
- Mantén accesibilidad: foco visible, roles ARIA correctos en modales y formularios, contraste suficiente.
- Documenta en el README cómo configurar variables de entorno, crear el admin y ejecutar migraciones.
- Escribe pruebas para: validación de precios y stock, autorización de rutas admin (sin sesión debe devolver 401/redirección) y cálculo de totales del carrito.

## Entregables finales
1. Resumen de la arquitectura de persistencia elegida y por qué.
2. Lista de archivos creados, modificados y eliminados.
3. Variables de entorno necesarias.
4. Pasos para desplegar y crear el primer admin.
5. Tabla de métricas de rendimiento antes y después.
6. Lista de riesgos pendientes y datos que requieren confirmación humana (`TODO_DATO_ESAB`, etc.).

Si una decisión es ambigua o afecta costos, pregunta antes de implementarla.