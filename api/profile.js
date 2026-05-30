import { requirePerm, requireRole, supabase, auditLog, apiHandler } from './_lib.js';
const DEMO = [{ id:1, dienstnummer:'10234', name:'Max Hansen', rang:'Polizeihauptmeister', status:'im-dienst', einsaetze:127, beitrittsdatum:'2024-01-15' },{ id:2, dienstnummer:'10235', name:'Jana Müller', rang:'Polizeimeisterin', status:'im-dienst', einsaetze:89, beitrittsdatum:'2024-03-20' }];
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'profile');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') {
    try { return res.json(await db.from('profile').select('*')); } catch { return res.json(DEMO); }
  }
  if (req.method === 'POST') {
    requireRole(user,'admin','leitung');
    const { dienstnummer, name, rang, beitrittsdatum } = req.body;
    if (!dienstnummer || !name || !rang) return res.status(400).json({ error:'DN, Name und Rang erforderlich' });
    const neues = { dienstnummer, name, rang, status:'außer-dienst', einsaetze:0, beitrittsdatum: beitrittsdatum||new Date().toISOString().split('T')[0] };
    try { await db.from('profile').insert(neues); } catch {}
    await auditLog(db, { user, aktion:'ERSTELLT', tabelle:'profile', datensatz_id:dienstnummer, details:`${name} (${rang})` });
    return res.status(201).json(neues);
  }
  if (req.method === 'PATCH') {
    requireRole(user,'admin','leitung');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('profile').update(req.body,`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'BEARBEITET', tabelle:'profile', datensatz_id:id, details:JSON.stringify(req.body) });
    return res.json({ success:true });
  }
  if (req.method === 'DELETE') {
    requireRole(user,'admin');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('profile').delete(`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'GELÖSCHT', tabelle:'profile', datensatz_id:id });
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
