// api/_auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_maqsyma_replace_in_prod';
const COOKIE_NAME = 'maqsyma_admin_token';

function parseCookies(cookieHeader = '') {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function verifyAdminSession(req) {
  try {
    const rawCookies = req.headers?.cookie || '';
    const parsed = parseCookies(rawCookies);
    const token = parsed[COOKIE_NAME];

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

function createSessionToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.full_name || 'Admin'
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function buildSessionCookie(token, isLogout = false) {
  const maxAge = isLogout ? 0 : 8 * 60 * 60; // 8 horas
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const val = isLogout ? '' : (token || '');
  return `${COOKIE_NAME}=${encodeURIComponent(val)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

module.exports = {
  verifyAdminSession,
  createSessionToken,
  buildSessionCookie,
  parseCookies,
  COOKIE_NAME
};
