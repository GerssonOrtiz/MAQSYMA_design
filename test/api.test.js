// test/api.test.js
// Pruebas automatizadas requeridas por mejoras.md:
// 1. Autorización de rutas admin (sin sesión debe rechazar con 401).
// 2. Validación en servidor de stock y precios.
// 3. Cálculo de totales del carrito en servidor.

const assert = require('assert');
const adminProductsHandler = require('../api/admin/products');
const cartCalculateHandler = require('../api/cart/calculate');

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    }
  };
  return res;
}

async function runTests() {
  console.log('--- Iniciando Suite de Pruebas MAQSYMA ---');

  // Test 1: Protección de ruta admin sin sesión (debe devolver 401)
  {
    const req = {
      method: 'PUT',
      headers: {},
      body: { id: 'rebel-215', stock: 5 }
    };
    const res = mockRes();
    await adminProductsHandler(req, res);
    assert.strictEqual(res.statusCode, 401, 'Debe devolver status 401 si no hay cookie de sesión');
    assert.ok(res.data.error.includes('No autorizado'), 'Debe retornar mensaje de no autorizado');
    console.log('[PASS] Test 1: Ruta admin protegida rechaza accesos sin sesión activa (401).');
  }

  // Test 2: Validación de stock negativo o inválido con token simulado
  {
    const { createSessionToken, buildSessionCookie } = require('../api/_auth');
    const token = createSessionToken({ id: 'test-admin', email: 'admin@maqsyma.com', full_name: 'Tester' });
    const cookieHeader = buildSessionCookie(token);

    const req = {
      method: 'PUT',
      headers: { cookie: cookieHeader },
      body: { id: 'rebel-215', stock: -10 }
    };
    const res = mockRes();
    await adminProductsHandler(req, res);
    assert.strictEqual(res.statusCode, 400, 'Debe rechazar stock negativo con status 400');
    console.log('[PASS] Test 2: Rechazo en servidor de stock negativo (-10).');
  }

  // Test 3: Validación de precios negativos o no numéricos
  {
    const { createSessionToken, buildSessionCookie } = require('../api/_auth');
    const token = createSessionToken({ id: 'test-admin', email: 'admin@maqsyma.com' });
    const cookieHeader = buildSessionCookie(token);

    const req = {
      method: 'PUT',
      headers: { cookie: cookieHeader },
      body: { id: 'rebel-215', priceUSD: -50 }
    };
    const res = mockRes();
    await adminProductsHandler(req, res);
    assert.strictEqual(res.statusCode, 400, 'Debe rechazar precio USD negativo con status 400');
    console.log('[PASS] Test 3: Rechazo en servidor de precio negativo.');
  }

  // Test 4: Cálculo matemático y validación de totales del carrito en servidor
  {
    const req = {
      method: 'POST',
      body: {
        currency: 'USD',
        items: [
          { id: 'rebel-emp-215ic', qty: 2 } // Rebel EMP 215ic cuesta $2,450 USD c/u
        ]
      }
    };
    const res = mockRes();
    await cartCalculateHandler(req, res);
    assert.strictEqual(res.statusCode, 200, 'Debe responder status 200');
    assert.strictEqual(res.data.items.length, 1, 'Debe haber 1 item verificado');
    assert.strictEqual(res.data.summary.subtotalUSD, 4900, 'Subtotal USD de 2x $2450 debe ser $4900');
    assert.strictEqual(res.data.summary.taxUSD, 784, 'IVA 16% de $4900 debe ser $784');
    assert.strictEqual(res.data.summary.totalUSD, 5684, 'Total con IVA debe ser $5684');
    console.log('[PASS] Test 4: Cálculo estricto de subtotales, IVA 16% y totales en servidor.');
  }

  console.log('--- Todas las pruebas pasaron satisfactoriamente (4/4) ---');
}

runTests().catch(err => {
  console.error('Fallo en suite de pruebas:', err);
  process.exit(1);
});
