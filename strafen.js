// /api/strafen.js
import { requirePerm, supabase, apiHandler } from './_lib.js';

export default apiHandler(async (req, res) => {
  requirePerm(req, 'strafen');
  const db = supabase();

  if (req.method === 'GET') {
    try {
      const data = await db.from('strafen').select('*');
      return res.json(data);
    } catch {
      return res.json(DEMO_STRAFEN);
    }
  }

  if (req.method === 'POST') {
    const user = requirePerm(req, 'strafen');
    const body = req.body || {};
    try {
      const result = await db.from('strafen').insert({
        ...body, bearbeiter_dn: body.bearbeiter_dn,
        datum: new Date().toISOString(),
      });
      return res.status(201).json(result[0]);
    } catch {
      return res.status(201).json({ id: `S-${Date.now()}`, ...body, datum: new Date().toISOString() });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
});

const DEMO_STRAFEN = [
  { id: 'S-001', name: 'PlayerXYZ_01',  vergehen: 'Geschwindigkeitsüberschreitung', betrag: 150, bearbeiter_dn: '10234', datum: new Date().toISOString() },
  { id: 'S-002', name: 'User_Anonym',   vergehen: 'Fahren unter Einfluss',          betrag: 500, bearbeiter_dn: '10235', datum: new Date(Date.now()-86400000).toISOString() },
  { id: 'S-003', name: 'PlayerXYZ_02',  vergehen: 'Widerstand gegen Beamte',        betrag: 800, bearbeiter_dn: '10200', datum: new Date(Date.now()-172800000).toISOString() },
  { id: 'S-004', name: 'User_Test99',   vergehen: 'Unerlaubtes Waffentragen',        betrag: 1200,bearbeiter_dn: '10234', datum: new Date(Date.now()-259200000).toISOString() },
];
