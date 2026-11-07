// api/auth/logout.js
const { buildSessionCookie } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  res.setHeader('Set-Cookie', buildSessionCookie(null, true));
  return res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' });
};
