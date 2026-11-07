// api/admin/products.js
const { verifyAdminSession } = require('../_auth');
const { getSupabase } = require('../_supabase');

module.exports = async function handler(req, res) {
  // 1. Verificación obligatoria de sesión en servidor
  const admin = verifyAdminSession(req);
  if (!admin) {
    return res.status(401).json({ error: 'No autorizado. Se requiere sesión activa de administrador.' });
  }

  const { method, body } = req;

  // 2. Validaciones de payload antes de llamadas externas
  if (method === 'PUT') {
    const { id, stock, priceUSD, pricePEN } = body || {};

    if (!id) {
      return res.status(400).json({ error: 'ID de producto requerido' });
    }

    if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ error: 'El stock debe ser un número entero no negativo' });
    }
    if (priceUSD !== undefined && (isNaN(Number(priceUSD)) || Number(priceUSD) < 0)) {
      return res.status(400).json({ error: 'El precio USD debe ser un número mayor o igual a 0' });
    }
    if (pricePEN !== undefined && (isNaN(Number(pricePEN)) || Number(pricePEN) < 0)) {
      return res.status(400).json({ error: 'El precio PEN debe ser un número mayor o igual a 0' });
    }
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ error: 'Base de datos Supabase no configurada' });
  }

  try {
    // Modificar producto existente (Stock, Precios, etc.)
    if (method === 'PUT') {
      const { id, stock, priceUSD, pricePEN } = body || {};

      // Obtener valores anteriores para auditoría
      const { data: currentProd } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!currentProd) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const updates = { updated_at: new Date().toISOString() };
      if (stock !== undefined) updates.stock = parseInt(stock, 10);
      if (priceUSD !== undefined) updates.price_usd = parseFloat(Number(priceUSD).toFixed(2));
      if (pricePEN !== undefined) updates.price_pen = parseFloat(Number(pricePEN).toFixed(2));

      const { data: updatedProd, error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Registrar en log de auditoría
      await supabase.from('inventory_audit_log').insert({
        product_id: id,
        action: 'UPDATE_INVENTORY',
        changed_by: admin.email,
        old_values: {
          stock: currentProd.stock,
          price_usd: currentProd.price_usd,
          price_pen: currentProd.price_pen
        },
        new_values: updates
      });

      return res.status(200).json({
        success: true,
        product: {
          id: updatedProd.id,
          name: updatedProd.name,
          category: updatedProd.category,
          categoryLabel: updatedProd.category_label,
          subtitle: updatedProd.subtitle,
          image: updatedProd.image,
          priceUSD: parseFloat(updatedProd.price_usd),
          pricePEN: parseFloat(updatedProd.price_pen),
          stock: parseInt(updatedProd.stock, 10)
        }
      });
    }

    // 3. Crear nuevo producto
    if (method === 'POST') {
      const { name, category, categoryLabel, subtitle, image, priceUSD, pricePEN, stock, specs, features } = body || {};

      if (!name || !category) {
        return res.status(400).json({ error: 'Nombre y categoría son campos obligatorios' });
      }

      const validStock = parseInt(stock, 10);
      const validUSD = parseFloat(priceUSD);
      const validPEN = parseFloat(pricePEN);

      if (isNaN(validStock) || validStock < 0) {
        return res.status(400).json({ error: 'Stock inválido' });
      }
      if (isNaN(validUSD) || validUSD < 0 || isNaN(validPEN) || validPEN < 0) {
        return res.status(400).json({ error: 'Precios numéricos inválidos' });
      }

      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const newProductPayload = {
        id,
        name,
        category,
        category_label: categoryLabel || category.toUpperCase(),
        subtitle: subtitle || 'Equipo Inversor Profesional ESAB',
        image: image || 'assets/products/esab_hero_clean.png',
        price_usd: parseFloat(validUSD.toFixed(2)),
        price_pen: parseFloat(validPEN.toFixed(2)),
        stock: validStock,
        specs: specs || {
          amperaje: '200 A',
          ciclo: '200 A @ 30%',
          voltaje: '220V 1ph / 3ph',
          peso: '12 kg'
        },
        features: features || [
          'Tecnología de arco inverso de alta eficiencia',
          'Garantía directa de 3 años MAQSYMA + ESAB',
          'Componentes industriales de protección térmica'
        ],
        updated_at: new Date().toISOString()
      };

      const { data: created, error: createError } = await supabase
        .from('products')
        .insert(newProductPayload)
        .select()
        .single();

      if (createError) throw createError;

      // Auditoría
      await supabase.from('inventory_audit_log').insert({
        product_id: id,
        action: 'CREATE_PRODUCT',
        changed_by: admin.email,
        new_values: newProductPayload
      });

      return res.status(201).json({
        success: true,
        product: {
          id: created.id,
          name: created.name,
          category: created.category,
          categoryLabel: created.category_label,
          subtitle: created.subtitle,
          image: created.image,
          priceUSD: parseFloat(created.price_usd),
          pricePEN: parseFloat(created.price_pen),
          stock: parseInt(created.stock, 10)
        }
      });
    }

    // 4. Eliminar producto
    if (method === 'DELETE') {
      const { id } = body || req.query || {};

      if (!id) {
        return res.status(400).json({ error: 'ID de producto requerido' });
      }

      const { data: existing } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const { error: delError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (delError) throw delError;

      await supabase.from('inventory_audit_log').insert({
        product_id: id,
        action: 'DELETE_PRODUCT',
        changed_by: admin.email,
        old_values: existing
      });

      return res.status(200).json({ success: true, message: `Producto ${id} eliminado` });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Error en api/admin/products:', err);
    return res.status(500).json({ error: 'Error procesando solicitud de inventario: ' + err.message });
  }
};
