// api/_auth.js
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_maqsyma_replace_in_prod';
const COOKIE_NAME = 'maqsyma_admin_token';

function verifyAdminSession(req) {
  try {
    const rawCookies = req.headers.cookie || '';
    const parsed = cookie.parse(rawCookies);
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
  return cookie.serialize(COOKIE_NAME, isLogout ? '' : token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: isLogout ? 0 : 8 * 60 * 60 // 8 horas
  });
}

module.exports = {
  verifyAdminSession,
  createSessionToken,
  buildSessionCookie,
  COOKIE_NAME
};
