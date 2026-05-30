// /api/einsaetze.js
import { requirePerm, supabase, apiHandler } from './_lib.js';

export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'einsaetze');
  const db   = supabase();

  if (req.method === 'GET') {
    try {
      const data = await db.from('einsaetze').select('*');
      return res.json(data);
    } catch {
      // Fallback Demo-Daten wenn DB noch nicht eingerichtet
      return res.json(DEMO_EINSAETZE);
    }
  }

  if (req.method === 'POST') {
    if (!['admin','leitung','polizei'].includes(user.role))
      throw { status: 403, message: 'Keine Schreibrechte' };
    const body = req.body || {};
    try {
      const result = await db.from('einsaetze').insert({
        typ: body.typ, adresse: body.adresse,
        prioritaet: body.prioritaet, status: 'aktiv',
        einheiten: [], erstellt_von: user.id,
        erstellt_am: new Date().toISOString(),
      });
      return res.status(201).json(result[0]);
    } catch {
      return res.status(201).json({ id: `E-${Date.now()}`, ...body, status: 'aktiv' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
});

const DEMO_EINSAETZE = [
  { id: 'E-001', typ: '10-23', adresse: 'Reeperbahn 1, Hamburg', status: 'aktiv',        prioritaet: 'hoch',   einheiten: ['PHW-1','PHW-3'], erstellt_am: new Date().toISOString() },
  { id: 'E-002', typ: '10-11', adresse: 'Hafencity, Überseeallee 5', status: 'wartend',   prioritaet: 'mittel', einheiten: ['PHW-2'],         erstellt_am: new Date(Date.now()-600000).toISOString() },
  { id: 'E-003', typ: '10-51', adresse: 'Altona Bahnhof',            status: 'abgeschlossen', prioritaet: 'niedrig', einheiten: ['PHW-5'],    erstellt_am: new Date(Date.now()-3600000).toISOString() },
  { id: 'E-004', typ: '10-34', adresse: 'Mönckebergstraße 12',       status: 'aktiv',     prioritaet: 'hoch',   einheiten: ['PHW-K1'],        erstellt_am: new Date(Date.now()-120000).toISOString() },
];
