# 01 | Arquitectura Técnica y Despliegue en Producción

## 1. Pila Tecnológica (Tech Stack)

El proyecto prioriza el máximo rendimiento, cero dependencias pesadas innecesarias y compatibilidad instantánea con CDNs perimetrales:

- **Estructura**: HTML5 Semántico con soporte completo de accesibilidad (`aria-label`, `skip-to-content`, roles modales).
- **Estilos**: CSS3 Puro moderno con variables nativas (`:root`), flexbox y css-grid con soporte responsivo total.
- **Cinemática**:
  - `GSAP 3.12.5` + `ScrollTrigger` servidos vía CDN de Cloudflare con fallback local en `vendor/`.
  - Motor de física de partículas de chispas en `<canvas id="sparksCanvas">` en tiempo real (60 FPS sin pérdida de frames).
- **E-Commerce & Estado**: Vanilla JavaScript modular (IIFE) encapsulado bajo `window.MAQSYMA`.
- **Despliegue y Hosting**: **Vercel** en Edge Network.
- **Repositorio**: GitHub (`GerssonOrtiz/MAQSYMA_design` en rama `main`).

---

## 2. Estructura de Directorios

```text
MAQSYMA_design/
├── index.html               # Página principal completa, modales y layouts
├── style.css                # Sistema de diseño, tokens, layouts y componentes
├── main.js                  # Motor de partículas, GSAP ScrollTrigger, tienda y admin
├── vercel.json              # Configuración estática pura para Vercel
├── package.json             # (Opcional/Desactivado de build para evitar romper assets)
├── data/
│   └── products.json        # Base de datos inicial de productos y especificaciones
├── assets/
│   ├── branding/
│   │   └── maqsyma-logo.png # Logotipo oficial en PNG transparente
│   ├── cinematic/
│   │   ├── welder-cinematic.png    # Fondo cinematográfico del soldador
│   │   └── industrial_backdrop.jpg # Gradiente de carbón con micrograno
│   ├── products/            # Fotos de equipos en PNG con fondo transparente
│   │   ├── rebel-215.png
│   │   ├── rogue-EM-210.png
│   │   ├── rogue-ET-201iP_PRO.png
│   │   ├── rogue-ES-245i.png
│   │   ├── rogue-ES-305i.png
│   │   ├── rustler-215.png
│   │   ├── rustler-300.png
│   │   └── warrior-500.png
│   └── references/          # Imágenes fuente originales y posters
├── vendor/
│   ├── gsap.min.js          # Respaldo local de GSAP
│   └── ScrollTrigger.min.js # Respaldo local de ScrollTrigger
└── vault/                   # Cerebro de documentación del agente
```

---

## 3. Configuración Crítica de Despliegue en Vercel (`vercel.json`)

Para que Vercel sirva el sitio estático nativamente **sin** intentar compilar con bundlers que rompan las rutas de los archivos:

```json
{
  "buildCommand": null,
  "outputDirectory": null,
  "framework": null
}
```

> [!IMPORTANT]
> **NO** añadir scripts `"build": "vite build"` en `package.json` a menos que se configure Vite de extremo a extremo, ya que de lo contrario Vercel asumirá que es un proyecto Vite y fallará al resolver los scripts y fotos estáticas.
