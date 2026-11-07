# 02 | Hero Cinematográfico Scrubbed (500vh con GSAP)

## 1. Concepto y Funcionamiento
El Hero no es un banner tradicional estático ni un video pesado; es una **secuencia interactiva de 500vh** controlada por el scroll del usuario mediante **GSAP ScrollTrigger**:

- **Contenedor**: `.hero-scroll-container` con altura fija de `500vh`.
- **Viewport Fijo**: `.hero-viewport` con posición `sticky; top: 0; height: 100vh; overflow: hidden;`.
- **Scrub**: `scrub: 0.8` (permite que la inercia del scroll arrastre suavemente las transformaciones 3D sin saltos).
- **No bloqueo**: No intercepta eventos de la rueda del mouse (*no scroll-hijacking*). Si el usuario se detiene, la escena se congela en ese fotograma exacto.

---

## 2. Fases Cronológicas del Scroll (Timeline Scrub)

| Rango de Progreso | Fase Narrativa | Elementos Visuales Activos |
| :--- | :--- | :--- |
| **0.00 - 0.22** | **Fase 1: Ignición del Arco** | Activación del canvas de chispas a máxima intensidad (`1.0`), resplandor volumétrico cyan/amarillo y silueta del soldador en taller. Título: *"EL PODER DE LA SOLDADURA PURA"*. |
| **0.22 - 0.50** | **Fase 2: Revelación de Máquina** | La soldadora inversora ESAB entra en perspectiva 3D (`scale: 1.0`, `rotationY: 0`, brillo aumentado). Las chispas bajan a nivel ambiental (`0.35`). Título: *"TECNOLOGÍA INVERTER ÉLITE"*. |
| **0.50 - 0.76** | **Fase 3: Zoom Técnico & HUD** | Zoom cinemático al interior del equipo (`scale: 1.35`, desplazamiento focal). Aparecen etiquetas HUD con pulsos luminosos (*PFC POWER FACTOR*, *sMIG*, *IP23S*). |
| **0.76 - 1.00** | **Fase 4: Autoridad MAQSYMA & Handoff** | Des-escalado suave, apagado de chispas y transición continua hacia la grilla de productos de la tienda sin desorientar al usuario. |

---

## 3. Motor Físico de Chispas (`sparksCanvas`)
Implementado en JavaScript puro en `main.js`:
- Clase `Spark`: Posición $(x, y)$, velocidad angular $(\cos \theta, \sin \theta)$, gravedad ($0.28$), fricción por arrastre de aire ($0.96$) y desvanecimiento de tamaño.
- Colores generados:
  - Blanco incandescente (`#FFFFFF` en el núcleo del arco).
  - Amarillo industrial ESAB (`#F5C400`).
  - Azul ionizado de argón/helio (`#70D6FF`).
- Limite dinámico: Máximo 220 partículas simultáneas para garantizar 60 FPS en procesadores móviles.

---

## 4. Soporte `prefers-reduced-motion: reduce`
Si el usuario tiene activada la preferencia de accesibilidad contra mareos por movimiento:
- El canvas de chispas se desconecta inmediatamente.
- La secuencia de 500vh se contrae a un viewport legible tradicional.
- Los textos y máquinas se muestran estáticos con opacidad plena.
