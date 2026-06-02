import { requirePerm, requireRole, supabase, auditLog, aktivitaetLog, apiHandler } from './_lib.js';
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'funk');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') { try { return res.json(await db.from('einheiten').select('*')); } catch { return res.json([]); } }
  if (req.method === 'POST') {
    requireRole(user,'admin','leitung');
    const { funkrufname, dienstnummer, spieler, fahrzeug } = req.body;
    if (!funkrufname || !dienstnummer || !spieler) return res.status(400).json({ error:'Pflichtfelder fehlen' });
    const neues = { funkrufname, dienstnummer, spieler, fahrzeug:fahrzeug||'Streifendienst', status:'außer-dienst', discord_id:null };
    try { await db.from('einheiten').insert(neues); } catch {}
    await aktivitaetLog(user, 'ERSTELLT', `📡 Einheit **${funkrufname}** für ${spieler} erstellt`);
    return res.status(201).json(neues);
  }
  if (req.method === 'PATCH') {
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    if (user.role === 'polizei') { try { const e = await db.from('einheiten').filter('id','eq',id); if (e[0]?.discord_id && e[0].discord_id !== user.id) return res.status(403).json({ error:'Nur eigene Einheit ändern' }); if (!e[0]?.discord_id) req.body.discord_id = user.id; } catch {} }
    try { await db.from('einheiten').update(req.body,`id=eq.${id}`); } catch {}
    await aktivitaetLog(user, 'BEARBEITET', `📡 Einheit **${id}** → ${req.body.status||req.body.fahrzeug||'geändert'}`);
    return res.json({ success:true });
  }
  if (req.method === 'DELETE') {
    requireRole(user,'admin');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('einheiten').delete(`id=eq.${id}`); } catch {}
    await aktivitaetLog(user, 'GELÖSCHT', `📡 Einheit **${id}** gelöscht`);
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
