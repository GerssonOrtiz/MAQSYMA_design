// api/cart/calculate.js
// Calcula el total del carrito exclusivamente en el servidor con los precios y stock vigentes en base de datos.
const fs = require('fs');
const path = require('path');
const { getSupabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { items, currency = 'USD' } = req.body || {};

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Lista de items inválida' });
  }

  // Obtener precios canónicos de Supabase o fallback local
  let catalogMap = new Map();
  const supabase = getSupabase();

  if (supabase) {
    const { data: dbProducts } = await supabase.from('products').select('id, name, price_usd, price_pen, stock');
    if (dbProducts) {
      dbProducts.forEach(p => {
        catalogMap.set(p.id, {
          id: p.id,
          name: p.name,
          priceUSD: parseFloat(p.price_usd),
          pricePEN: parseFloat(p.price_pen),
          stock: parseInt(p.stock, 10)
        });
      });
    }
  }

  if (catalogMap.size === 0) {
    try {
      const localFile = path.join(process.cwd(), 'data', 'products.json');
      const raw = fs.readFileSync(localFile, 'utf8');
      const prods = JSON.parse(raw);
      prods.forEach(p => {
        catalogMap.set(p.id, {
          id: p.id,
          name: p.name,
          priceUSD: p.priceUSD,
          pricePEN: p.pricePEN,
          stock: p.stock
        });
      });
    } catch (e) {}
  }

  let subtotalUSD = 0;
  let subtotalPEN = 0;
  const verifiedItems = [];

  for (const item of items) {
    const catalogItem = catalogMap.get(item.id);
    if (!catalogItem) continue;

    const requestedQty = Math.max(1, parseInt(item.qty, 10) || 1);
    const availableQty = Math.min(requestedQty, catalogItem.stock);

    const itemTotalUSD = catalogItem.priceUSD * availableQty;
    const itemTotalPEN = catalogItem.pricePEN * availableQty;

    subtotalUSD += itemTotalUSD;
    subtotalPEN += itemTotalPEN;

    verifiedItems.push({
      id: catalogItem.id,
      name: catalogItem.name,
      qty: availableQty,
      originalRequestedQty: requestedQty,
      priceUSD: catalogItem.priceUSD,
      pricePEN: catalogItem.pricePEN,
      totalUSD: itemTotalUSD,
      totalPEN: itemTotalPEN,
      inStock: catalogItem.stock > 0
    });
  }

  const taxUSD = subtotalUSD * 0.16; // 16% IVA
  const totalUSD = subtotalUSD + taxUSD;

  const taxPEN = subtotalPEN * 0.16;
  const totalPEN = subtotalPEN + taxPEN;

  return res.status(200).json({
    currency,
    items: verifiedItems,
    summary: {
      subtotalUSD: parseFloat(subtotalUSD.toFixed(2)),
      taxUSD: parseFloat(taxUSD.toFixed(2)),
      totalUSD: parseFloat(totalUSD.toFixed(2)),
      subtotalPEN: parseFloat(subtotalPEN.toFixed(2)),
      taxPEN: parseFloat(taxPEN.toFixed(2)),
      totalPEN: parseFloat(totalPEN.toFixed(2))
    }
  });
};
