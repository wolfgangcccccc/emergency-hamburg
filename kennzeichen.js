// /api/kennzeichen.js
import { requirePerm, supabase, apiHandler } from './_lib.js';

export default apiHandler(async (req, res) => {
  requirePerm(req, 'kennzeichen');
  const db = supabase();

  if (req.method === 'GET') {
    try {
      const data = await db.from('kennzeichen').select('*');
      return res.json(data);
    } catch {
      return res.json(DEMO_KENNZEICHEN);
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    try {
      const result = await db.from('kennzeichen').insert({ ...body, erstellt_am: new Date().toISOString() });
      return res.status(201).json(result[0]);
    } catch {
      return res.status(201).json({ id: Date.now(), ...body });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
});

const DEMO_KENNZEICHEN = [
  { id: 1, kennzeichen: 'HH-PD 1234', besitzer: 'Max Hansen',  fahrzeug: 'BMW 5er',    farbe: 'Schwarz', status: 'unauffällig' },
  { id: 2, kennzeichen: 'HH-XX 9999', besitzer: 'Unbekannt',   fahrzeug: 'Audi A4',    farbe: 'Grau',    status: 'fahndung'    },
  { id: 3, kennzeichen: 'HH-AB 5678', besitzer: 'Jana Müller', fahrzeug: 'VW Passat',  farbe: 'Weiß',    status: 'unauffällig' },
  { id: 4, kennzeichen: 'HH-GS 0001', besitzer: 'K. Weber',    fahrzeug: 'Mercedes E', farbe: 'Silber',  status: 'unauffällig' },
];
