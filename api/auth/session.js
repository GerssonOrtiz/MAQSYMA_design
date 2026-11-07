// api/auth/session.js
const { verifyAdminSession } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const session = verifyAdminSession(req);

  if (!session) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      id: session.id,
      email: session.email,
      name: session.name
    }
  });
};
