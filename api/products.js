// api/products.js
// Devuelve el catálogo público de productos con s-maxage para alto rendimiento en Vercel Edge CDN.
// Si Supabase aún no está configurado en las variables de entorno, sirve con gracia el catálogo local.
const fs = require('fs');
const path = require('path');
const { getSupabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Cache CDN 60s, stale-while-revalidate 120s
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        // Mapear campos DB a modelo frontend
        const products = data.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          categoryLabel: p.category_label || p.category,
          subtitle: p.subtitle,
          image: p.image,
          priceUSD: parseFloat(p.price_usd),
          pricePEN: parseFloat(p.price_pen),
          stock: parseInt(p.stock, 10),
          specs: p.specs || {},
          features: p.features || []
        }));
        return res.status(200).json(products);
      }
    } catch (err) {
      console.warn('Error leyendo de Supabase, recurriendo a archivo local:', err.message);
    }
  }

  // Respaldo de contingencia desde archivo local
  try {
    const localFile = path.join(process.cwd(), 'data', 'products.json');
    if (fs.existsSync(localFile)) {
      const raw = fs.readFileSync(localFile, 'utf8');
      return res.status(200).json(JSON.parse(raw));
    }
  } catch (readErr) {
    console.error('Error leyendo data/products.json:', readErr);
  }

  return res.status(500).json({ error: 'No se pudo cargar el inventario' });
};
