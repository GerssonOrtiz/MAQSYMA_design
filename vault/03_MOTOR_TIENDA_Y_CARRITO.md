# 03 | Motor de Tienda, Carrito y WhatsApp Dispatch

## 1. Flujo de Compra y Cotización
La web funciona como una tienda online moderna con cotización directa y cierre comercial asistido por WhatsApp.

### Ciclo de vida del pedido:
1. El usuario visualiza los productos en **USD** o **PEN**.
2. Puede inspeccionar las especificaciones técnicas pulsando el botón de **Ficha Técnica** (`📄`).
3. Hace clic en **"Añadir al Carrito"**:
   - Valida el stock del producto (`p.stock`). Si es 0, no permite añadirlo.
   - Si ya existe en la cesta, incrementa la cantidad hasta el límite del stock.
   - Muestra una notificación emergente (*Toast Notification*) de confirmación.
   - Abre automáticamente el cajón lateral (`Cart Drawer`).
4. En el cajón lateral puede modificar cantidades (`+` / `-`) o retirar productos.
5. Pulsa **"Tramitar Pedido por WhatsApp"**:
   - Compila la lista de productos, cantidades, precios unitarios y total estimado.
   - Codifica el mensaje URI y abre la API oficial de WhatsApp: `https://wa.me/51957082739?text=...`.

---

## 2. Sistema Multimoneda Dinámico (USD / PEN)

- **Almacenamiento**: `localStorage.getItem('maqsyma_currency_v1')`.
- **Valores soportados**:
  - `USD`: Precios mostrados como `$ X,XXX.XX USD (+ IVA)`.
  - `PEN`: Precios mostrados como `S/. X,XXX.XX (IGV Inc.)`.
- Cada producto en la base de datos almacena independientemente su valor en ambas monedas (`priceUSD` y `pricePEN`), evitando desfases de tipo de cambio volátiles.
- El cambio de moneda actualiza de inmediato todas las tarjetas del catálogo, los modales y el desglose del carrito en pantalla.

---

## 3. Plantilla del Mensaje de WhatsApp Generado

```text
⚡ *ORDEN DE PEDIDO / COTIZACIÓN MAQSYMA*
-----------------------------------------
¡Hola MAQSYMA! Deseo solicitar la compra/cotización formal de los siguientes equipos ESAB:

• *ESAB Rebel EMP 215ic* x2 → S/. 18,360.00
• *ESAB Rogue ET 201iP PRO* x1 → S/. 4,800.00

*TOTAL ESTIMADO:* S/. 23,160.00 PEN
*Moneda:* PEN
-----------------------------------------
Por favor indíquenme disponibilidad para despacho inmediato, facturación y opciones de envío.
```
