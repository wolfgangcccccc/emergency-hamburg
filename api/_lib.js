// ═══════════════════════════════════════════════
// Emergency Hamburg — Shared Serverless Utilities
// ═══════════════════════════════════════════════

// ── Supabase lightweight client ──────────────────
export function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  const query = async (path, options = {}) => {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'return=representation',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase error: ${err}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  };

  return {
    from: (table) => ({
      select: (cols = '*') => query(`${table}?select=${cols}`),
      insert: (data) => query(table, { method: 'POST', body: JSON.stringify(data) }),
      update: (data, match) => query(`${table}?${match}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (match) => query(`${table}?${match}`, { method: 'DELETE' }),
      filter: (col, op, val) => query(`${table}?${col}=${op}.${val}`),
    }),
    rpc: (fn, params) => query(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(params) })
  };
}

// ── JWT session (stateless, no server needed) ──
import { createHmac } from 'crypto';

const SECRET = process.env.JWT_SECRET || 'eh-fallback-secret';

export function signSession(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = btoa(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 }));
  const sig    = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifySession(token) {
  if (!token) return null;
  try {
    const [header, body, sig] = token.split('.');
    const expected = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(atob(body));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req) {
  const cookie = req.headers.cookie || '';
  const match  = cookie.match(/eh_session=([^;]+)/);
  if (!match) return null;
  return verifySession(decodeURIComponent(match[1]));
}

// ── RBAC ─────────────────────────────────────────
const PERMISSIONS = {
  admin:     ['einsaetze', 'profile', 'strafen', 'kennzeichen', 'admin', 'benutzer', 'funk'],
  leitung:   ['einsaetze', 'profile', 'strafen', 'kennzeichen', 'admin', 'funk'],
  polizei:   ['einsaetze', 'profile', 'strafen', 'kennzeichen', 'funk'],
  zuschauer: ['einsaetze_read', 'profile_read', 'kennzeichen_read', 'funk_read'],
};

export function hasPermission(user, perm) {
  if (!user) return false;
  const perms = PERMISSIONS[user.role] || [];
  return perms.includes(perm) || perms.includes(perm.replace('_read', ''));
}

export function requireAuth(req) {
  const user = getSessionFromRequest(req);
  if (!user) throw { status: 401, message: 'Nicht authentifiziert' };
  return user;
}

export function requirePerm(req, perm) {
  const user = requireAuth(req);
  if (!hasPermission(user, perm)) throw { status: 403, message: 'Zugriff verweigert' };
  return user;
}

// ── Discord role resolver ─────────────────────────
const ROLE_PRIORITY = ['admin', 'leitung', 'polizei', 'zuschauer'];

export function resolveRole(memberRoles) {
  for (const name of ROLE_PRIORITY) {
    const id = process.env[`ROLE_${name.toUpperCase()}`];
    if (id && memberRoles.includes(id)) return name;
  }
  return null;
}

// ── CORS helper ───────────────────────────────────
export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Standard API handler wrapper ──────────────────
export function apiHandler(fn) {
  return async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    try {
      await fn(req, res);
    } catch (err) {
      const status  = err.status || 500;
      const message = err.message || 'Serverfehler';
      res.status(status).json({ error: message });
    }
  };
}
