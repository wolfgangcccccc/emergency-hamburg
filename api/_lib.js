import { createHmac } from 'crypto';
export function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const query = async (path, options = {}) => {
    const res = await fetch(`${url}/rest/v1/${path}`, { ...options, headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': options.prefer || 'return=representation', ...(options.headers || {}) } });
    if (!res.ok) { const err = await res.text(); throw new Error(err); }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  };
  return { from: (table) => ({ select: (cols='*') => query(`${table}?select=${cols}`), insert: (data) => query(table, { method: 'POST', body: JSON.stringify(data) }), delete: (match) => query(`${table}?${match}`, { method: 'DELETE' }), filter: (col, op, val) => query(`${table}?${col}=${op}.${val}`) }) };
}
const SECRET = process.env.JWT_SECRET || 'fallback';
export function signSession(payload) {
  const data = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 })).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}
export function verifySession(token) {
  if (!token) return null;
  try {
    const [data, sig] = token.split('.');
    if (createHmac('sha256', SECRET).update(data).digest('base64url') !== sig) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}
export function getSessionFromRequest(req) {
  const match = (req.headers.cookie || '').match(/eh_session=([^;]+)/);
  return match ? verifySession(decodeURIComponent(match[1])) : null;
}
const PERMISSIONS = { admin: ['einsaetze','profile','strafen','kennzeichen','admin','benutzer','funk'], leitung: ['einsaetze','profile','strafen','kennzeichen','admin','funk'], polizei: ['einsaetze','profile','strafen','kennzeichen','funk'], zuschauer: ['einsaetze_read','profile_read','kennzeichen_read','funk_read'] };
export function hasPermission(user, perm) { if (!user) return false; const perms = PERMISSIONS[user.role] || []; return perms.includes(perm) || perms.includes(perm.replace('_read','')); }
export function requireAuth(req) { const user = getSessionFromRequest(req); if (!user) throw { status: 401, message: 'Nicht authentifiziert' }; return user; }
export function requirePerm(req, perm) { const user = requireAuth(req); if (!hasPermission(user, perm)) throw { status: 403, message: 'Zugriff verweigert' }; return user; }
export function resolveRole(memberRoles) { for (const name of ['admin','leitung','polizei','zuschauer']) { const id = process.env[`ROLE_${name.toUpperCase()}`]; if (id && memberRoles.includes(id)) return name; } return null; }
export function cors(res) { res.setHeader('Access-Control-Allow-Origin','*'); res.setHeader('Access-Control-Allow-Credentials','true'); res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS'); res.setHeader('Access-Control-Allow-Headers','Content-Type'); }
export function apiHandler(fn) { return async (req, res) => { cors(res); if (req.method==='OPTIONS') return res.status(200).end(); try { await fn(req, res); } catch(err) { res.status(err.status||500).json({ error: err.message||'Serverfehler' }); } }; }
