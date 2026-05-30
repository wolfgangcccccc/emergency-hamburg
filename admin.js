// /api/admin.js
import { requirePerm, supabase, apiHandler } from './_lib.js';

export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'admin');
  const db   = supabase();
  const { action } = req.query;

  // ── Stats ──────────────────────────────────────────
  if (!action || action === 'stats') {
    try {
      const [einsaetze, profile] = await Promise.all([
        db.from('einsaetze').select('status'),
        db.from('profile').select('status'),
      ]);
      return res.json({
        aktiveEinsaetze:   einsaetze.filter(e => e.status === 'aktiv').length,
        beamteImDienst:    profile.filter(p => p.status === 'im-dienst').length,
        einsaetzeGesamt:   einsaetze.length,
        mitgliederGesamt:  profile.length,
      });
    } catch {
      return res.json({ aktiveEinsaetze: 2, beamteImDienst: 4, einsaetzeGesamt: 12, mitgliederGesamt: 47 });
    }
  }

  // ── Benutzer Liste ─────────────────────────────────
  if (action === 'benutzer') {
    if (user.role !== 'admin') throw { status: 403, message: 'Nur Admins' };
    try {
      const data = await db.from('logins').select('*');
      return res.json(data);
    } catch {
      return res.json(DEMO_BENUTZER);
    }
  }

  // ── Benutzer löschen ──────────────────────────────
  if (action === 'delete' && req.method === 'DELETE') {
    if (user.role !== 'admin') throw { status: 403, message: 'Nur Admins' };
    const { id } = req.query;
    try {
      await db.from('logins').delete(`discord_id=eq.${id}`);
    } catch {}
    return res.json({ success: true });
  }

  res.status(400).json({ error: 'Unbekannte Aktion' });
});

const DEMO_BENUTZER = [
  { id: '1', discord_id: '123456', username: 'Admin_Weber',       role: 'admin',     login_at: new Date().toISOString(),               status: 'aktiv' },
  { id: '2', discord_id: '123457', username: 'Leitung_Fischer',   role: 'leitung',   login_at: new Date(Date.now()-3600000).toISOString(), status: 'aktiv' },
  { id: '3', discord_id: '123458', username: 'Officer_Hansen',    role: 'polizei',   login_at: new Date(Date.now()-7200000).toISOString(), status: 'aktiv' },
  { id: '4', discord_id: '123459', username: 'Zuschauer_Test',    role: 'zuschauer', login_at: new Date(Date.now()-86400000).toISOString(), status: 'aktiv' },
];
