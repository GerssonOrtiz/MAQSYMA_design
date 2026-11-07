# 04 | Gestión de Inventario, Precios y Stock (Panel Admin)

## 1. Filosofía de Diseño
Para facilitar la operación al dueño de la empresa sin requerir servidores de base de datos pesados ni sistemas de autenticación lentos, el inventario se gestiona con una **arquitectura híbrida**:
1. **Semilla Base**: [`data/products.json`](file:///C:/Users/gorti/Desktop/MAQSYMA_design/data/products.json).
2. **Capa Reactiva en Vivo**: Guardada en `localStorage` bajo la clave `maqsyma_inventory_v1`.

---

## 2. Cómo Abrir el Panel de Administración
- Clic en el botón **`[ 🛠 Inventario ]`** en el Header superior.
- O mediante el enlace en el footer: *"Administrar Inventario"*.
- O desde la consola del navegador ejecutando:
  ```javascript
  window.MAQSYMA.openAdminModal();
  ```

---

## 3. Capacidades del Administrador en Pantalla

### A. Edición Inmediata de Stock
- En la tabla de equipos, cada fila tiene un input numérico para el **Stock (uds)**.
- Al cambiar el valor:
  - Si es `0`: la tarjeta en la tienda cambia a etiqueta roja **"Agotado / Bajo Pedido"** y el botón "Añadir al Carrito" se bloquea con texto *"Sin Stock"*.
  - Si es mayor a `0`: la tarjeta muestra **"En Stock (X)"** y permite añadir hasta esa cantidad exacta.

### B. Edición de Precios
- Cada fila tiene inputs independientes para **Precio USD ($)** y **Precio PEN (S/.)**.
- Al cambiar cualquier número, el cambio se aplica de inmediato en el catálogo y en el carrito.

### C. Añadir Nuevos Equipos al Catálogo
El formulario inferior *"Agregar Nuevo Equipo al Catálogo"* solicita:
- Nombre del equipo (ej. *ESAB Renegade VOLT ES 200i*).
- Categoría (*multiproceso*, *electrodo*, *industrial*).
- Etiqueta de proceso (ej. *TIG AC/DC PULSADO*).
- Subtítulo / Aplicación.
- Ruta de foto (ej. `assets/products/rebel-215.png`).
- Stock inicial.
- Precio USD y PEN.
- Amperaje y ciclo de trabajo.

Al hacer clic en **"Guardar y Publicar en Tienda"**, el nuevo producto se inserta inmediatamente en la grilla y queda disponible para cotizar por WhatsApp.

### D. Eliminación de Equipos
- Botón rojo **"Eliminar"** que remueve el producto del catálogo tras una confirmación.

### E. Restaurar Catálogo de Fábrica
- Botón **"Restablecer Catálogo de Fábrica"** que limpia el `localStorage` y recarga la lista original desde `data/products.json`.
