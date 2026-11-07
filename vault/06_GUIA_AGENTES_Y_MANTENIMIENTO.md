# 06 | Guía para Futuros Agentes de IA y Mantenimiento

> [!IMPORTANT]
> **REGLAS DE ORO PARA CUALQUIER AGENTE DE IA QUE TRABAJE EN ESTE REPOSITORIO**

---

### Regla 1: No reintroducir `vite build` en `package.json` sin configuración completa
- En este proyecto, Vercel detecta la presencia de `package.json`. Si encuentra `"scripts": { "build": "vite build" }`, intentará ejecutar un build de Vite en la nube.
- Si Vite no está configurado para empaquetar todas las rutas relativas de `assets/`, los scripts y fotos devolverán **404 NOT FOUND** y el scroll GSAP se congelará.
- **Mantener `vercel.json` con `"buildCommand": null`** o asegurar que el build copie explícitamente todos los archivos estáticos.

---

### Regla 2: El Hero requiere que GSAP ScrollTrigger esté siempre disponible
- El scroll de 500vh depende de:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  ```
- Si falla la carga de CDN o la red está sin conexión, existe un fallback en `vendor/gsap.min.js` y `vendor/ScrollTrigger.min.js`.
- Nunca remover el registro `gsap.registerPlugin(ScrollTrigger);` al inicio de `main.js`.

---

### Regla 3: Cómo agregar nuevas fotos de equipos
1. Colocar el archivo en: `assets/products/<nombre-del-equipo>.png`.
2. Asegurarse de que sea **PNG con fondo transparente** para que el gradiente de carbón e iluminación rasante del diseño no se arruine con cuadrados blancos.
3. Registrar el producto en `data/products.json` para que esté disponible como semilla predeterminada para cualquier nuevo usuario.

---

### Regla 4: Número de WhatsApp Oficial
- El número configurado para todas las órdenes de cotización y soporte es:
  ```javascript
  const CONFIG = {
    whatsappNumber: '51957082739' // +51 957 082 739 (Perú)
  };
  ```
- Si el cliente solicita cambiar el número, actualizarlo en `main.js` dentro del objeto `CONFIG` y en los textos de `index.html`.

---

### Regla 5: Despliegue en Producción
Para desplegar inmediatamente cambios en Vercel desde la CLI:
```powershell
npx vercel deploy --prod --yes
```
Y sincronizar el repositorio en GitHub:
```powershell
git add .
git commit -m "tu mensaje descriptivo"
git push origin main
```
Esto garantiza que la versión en `https://maqsyma-design.vercel.app` se mantenga idéntica al código local.
