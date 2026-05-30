// /api/profile.js
import { requirePerm, supabase, apiHandler } from './_lib.js';

export default apiHandler(async (req, res) => {
  requirePerm(req, 'profile');
  const db = supabase();

  if (req.method === 'GET') {
    try {
      const data = await db.from('profile').select('*');
      return res.json(data);
    } catch {
      return res.json(DEMO_PROFILE);
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    try {
      const result = await db.from('profile').insert({ ...body, erstellt_am: new Date().toISOString() });
      return res.status(201).json(result[0]);
    } catch {
      return res.status(201).json({ id: Date.now(), ...body });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
});

const DEMO_PROFILE = [
  { id: 1, dienstnummer: '10234', name: 'Max Hansen',    rang: 'Polizeihauptmeister', status: 'im-dienst',    einsaetze: 127, beitrittsdatum: '2024-01-15' },
  { id: 2, dienstnummer: '10235', name: 'Jana Müller',   rang: 'Polizeimeisterin',    status: 'im-dienst',    einsaetze: 89,  beitrittsdatum: '2024-03-20' },
  { id: 3, dienstnummer: '10240', name: 'Tom Schmidt',   rang: 'Polizeikommissar',    status: 'außer-dienst', einsaetze: 234, beitrittsdatum: '2023-11-05' },
  { id: 4, dienstnummer: '10200', name: 'Klaus Weber',   rang: 'Kriminalober­kommissar', status: 'im-dienst', einsaetze: 401, beitrittsdatum: '2023-06-01' },
  { id: 5, dienstnummer: '10250', name: 'Lisa Braun',    rang: 'Polizeimeisterin',    status: 'außer-dienst', einsaetze: 45,  beitrittsdatum: '2024-08-10' },
];
