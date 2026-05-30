// /api/einheiten.js
import { requirePerm, supabase, apiHandler } from './_lib.js';

export default apiHandler(async (req, res) => {
  requirePerm(req, 'funk');
  const db = supabase();

  if (req.method === 'GET') {
    try {
      const data = await db.from('einheiten').select('*');
      return res.json(data);
    } catch {
      return res.json(DEMO_EINHEITEN);
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    try {
      const result = await db.from('einheiten').insert(body);
      return res.status(201).json(result[0]);
    } catch {
      return res.status(201).json({ id: Date.now(), ...body });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
});

const DEMO_EINHEITEN = [
  { id: 1, funkrufname: 'PHW-1',  status: 'verfügbar',   dienstnummer: '10234', spieler: 'Officer_Hansen',  fahrzeug: 'FuStW' },
  { id: 2, funkrufname: 'PHW-2',  status: 'im-einsatz',  dienstnummer: '10235', spieler: 'Officer_Müller',  fahrzeug: 'FuStW' },
  { id: 3, funkrufname: 'PHW-3',  status: 'verfügbar',   dienstnummer: '10240', spieler: 'Officer_Schmidt', fahrzeug: 'FuStW' },
  { id: 4, funkrufname: 'PHW-K1', status: 'bereit',      dienstnummer: '10200', spieler: 'KOK_Weber',       fahrzeug: 'FuKw'  },
  { id: 5, funkrufname: 'PHW-5',  status: 'außer-dienst',dienstnummer: '10250', spieler: 'Officer_Braun',   fahrzeug: 'FuStW' },
];
