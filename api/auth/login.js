// api/auth/login.js
const bcrypt = require('bcryptjs');
const { getSupabase } = require('../_supabase');
const { createSessionToken, buildSessionCookie } = require('../_auth');

// Rate limiting simple en memoria por IP para Vercel Serverless
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attemptInfo = loginAttempts.get(clientIp) || { count: 0, resetAt: now + LOCKOUT_TIME };

  if (now > attemptInfo.resetAt) {
    attemptInfo.count = 0;
    attemptInfo.resetAt = now + LOCKOUT_TIME;
  }

  if (attemptInfo.count >= MAX_ATTEMPTS) {
    const remainingMins = Math.ceil((attemptInfo.resetAt - now) / 60000);
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Intente nuevamente en ${remainingMins} minutos.`
    });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Credenciales incompletas' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(500).json({ error: 'Servicio de base de datos no configurado' });
  }

  try {
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, full_name')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !user) {
      attemptInfo.count++;
      loginAttempts.set(clientIp, attemptInfo);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      attemptInfo.count++;
      loginAttempts.set(clientIp, attemptInfo);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Éxito: limpiar intentos
    loginAttempts.delete(clientIp);

    // Actualizar last_login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const token = createSessionToken(user);
    res.setHeader('Set-Cookie', buildSessionCookie(token));

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno en autenticación' });
  }
};
