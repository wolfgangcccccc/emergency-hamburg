import { requirePerm, requireRole, supabase, auditLog, discordLog, apiHandler } from './_lib.js';
const DEMO = [{ id:'E-001', typ:'10-23', adresse:'Reeperbahn 1', status:'aktiv', prioritaet:'hoch', einheiten:['PHW-1'], erstellt_von:'System', erstellt_am: new Date().toISOString() }, { id:'E-002', typ:'10-11', adresse:'Hafencity', status:'wartend', prioritaet:'mittel', einheiten:['PHW-2'], erstellt_von:'System', erstellt_am: new Date(Date.now()-600000).toISOString() }];
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'einsaetze');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') {
    try { const data = id ? await db.from('einsaetze').filter('id','eq',id) : await db.from('einsaetze').select('*','&order=erstellt_am.desc'); return res.json(id ? data[0] : data); }
    catch { return res.json(id ? DEMO.find(e=>e.id===id) : DEMO); }
  }
  if (req.method === 'POST') {
    requireRole(user,'admin','leitung','polizei');
    const { typ, adresse, prioritaet, einheiten } = req.body;
    if (!typ || !adresse) return res.status(400).json({ error:'Typ und Adresse erforderlich' });
    const neuer = { id:`E-${Date.now()}`, typ, adresse, prioritaet: prioritaet||'mittel', status:'aktiv', einheiten: einheiten||[], erstellt_von: user.nickname||user.username, erstellt_am: new Date().toISOString() };
    try { await db.from('einsaetze').insert(neuer); } catch {}
    await auditLog(db, { user, aktion:'ERSTELLT', tabelle:'einsaetze', datensatz_id: neuer.id, details:`${typ} - ${adresse}` });
    await discordLog(process.env.DISCORD_LOG_CHANNEL_ID, { title:'🚨 Neuer Einsatz', color:0xFF1A2E, fields:[{ name:'ID', value:neuer.id, inline:true },{ name:'Typ', value:typ, inline:true },{ name:'Adresse', value:adresse },{ name:'Erstellt von', value:user.nickname||user.username, inline:true },{ name:'Priorität', value:prioritaet||'mittel', inline:true }], footer:{ text:'🚔 Emergency Hamburg' }, timestamp: new Date().toISOString() });
    return res.status(201).json(neuer);
  }
  if (req.method === 'PATCH') {
    requireRole(user,'admin','leitung','polizei');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('einsaetze').update(req.body,`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'BEARBEITET', tabelle:'einsaetze', datensatz_id:id, details:JSON.stringify(req.body) });
    return res.json({ success:true });
  }
  if (req.method === 'DELETE') {
    requireRole(user,'admin');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('einsaetze').delete(`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'GELÖSCHT', tabelle:'einsaetze', datensatz_id:id });
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
