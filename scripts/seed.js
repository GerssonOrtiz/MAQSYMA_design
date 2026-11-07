// scripts/seed.js
// Migra data/products.json a Supabase y crea el primer usuario administrador desde variables de entorno.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Faltan variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('--- Iniciando Seed en Supabase ---');

  // 1. Cargar productos desde data/products.json
  const productsFilePath = path.join(__dirname, '..', 'data', 'products.json');
  const productsRaw = fs.readFileSync(productsFilePath, 'utf8');
  const localProducts = JSON.parse(productsRaw);

  console.log(`Leídos ${localProducts.length} productos desde data/products.json.`);

  for (const prod of localProducts) {
    const payload = {
      id: prod.id,
      name: prod.name,
      category: prod.category,
      category_label: prod.categoryLabel || prod.category,
      subtitle: prod.subtitle || '',
      image: prod.image,
      price_usd: prod.priceUSD,
      price_pen: prod.pricePEN,
      stock: prod.stock,
      specs: prod.specs || {},
      features: prod.features || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error(`Error al insertar ${prod.id}:`, error.message);
    } else {
      console.log(`[OK] Producto migrado: ${prod.name} (${prod.id})`);
    }
  }

  // 2. Crear administrador inicial si se define en variables de entorno
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log(`Verificando/creando usuario administrador inicial: ${adminEmail}...`);
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      console.log('El usuario administrador ya existe. Actualizando contraseña...');
      await supabase
        .from('admin_users')
        .update({ password_hash: passwordHash })
        .eq('email', adminEmail);
    } else {
      const { error: userError } = await supabase
        .from('admin_users')
        .insert({
          email: adminEmail,
          password_hash: passwordHash,
          full_name: 'Administrador MAQSYMA'
        });

      if (userError) {
        console.error('Error al crear admin:', userError.message);
      } else {
        console.log(`[OK] Administrador creado exitosamente para: ${adminEmail}`);
      }
    }
  } else {
    console.warn('AVISO: No se definieron INITIAL_ADMIN_EMAIL o INITIAL_ADMIN_PASSWORD en el entorno.');
  }

  console.log('--- Seed completado con éxito ---');
}

seed().catch(err => {
  console.error('Error fatal en seed:', err);
  process.exit(1);
});
