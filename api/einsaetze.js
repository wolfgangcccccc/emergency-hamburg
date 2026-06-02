import { requirePerm, requireRole, supabase, auditLog, discordLog, aktivitaetLog, apiHandler } from './_lib.js';
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'einsaetze');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') { try { return res.json(await db.from('einsaetze').select('*','&order=erstellt_am.desc')); } catch { return res.json([]); } }
  if (req.method === 'POST') {
    const { typ, adresse, prioritaet, einheiten } = req.body;
    if (!typ || !adresse) return res.status(400).json({ error: 'Typ und Adresse erforderlich' });
    const neuer = { id:`E-${Date.now()}`, typ, adresse, prioritaet:prioritaet||'mittel', status:'aktiv', einheiten:einheiten||[], erstellt_von:user.nickname||user.username, erstellt_von_id:user.id, erstellt_am:new Date().toISOString() };
    try { await db.from('einsaetze').insert(neuer); } catch {}
    await auditLog(db, { user, aktion:'ERSTELLT', tabelle:'einsaetze', datensatz_id:neuer.id, details:`${typ} - ${adresse}` });
    await aktivitaetLog(user, 'ERSTELLT', `🚨 Einsatz **${typ}** an **${adresse}** (Prio: ${prioritaet||'mittel'})`);
    await discordLog(process.env.DISCORD_LOG_CHANNEL_ID, { title:'🚨 Neuer Einsatz', color:0xFF1A2E, fields:[{name:'ID',value:neuer.id,inline:true},{name:'Typ',value:typ,inline:true},{name:'Adresse',value:adresse},{name:'Erstellt von',value:user.nickname||user.username,inline:true},{name:'Priorität',value:prioritaet||'mittel',inline:true}] });
    return res.status(201).json(neuer);
  }
  if (req.method === 'PATCH') {
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    if (user.role === 'polizei') { try { const e = await db.from('einsaetze').filter('id','eq',id); if (e[0]?.erstellt_von_id !== user.id) return res.status(403).json({ error:'Nur eigene Einsätze bearbeiten' }); } catch {} }
    try { await db.from('einsaetze').update(req.body,`id=eq.${id}`); } catch {}
    await aktivitaetLog(user, 'BEARBEITET', `🚨 Einsatz **${id}** → ${req.body.status||'geändert'}`);
    return res.json({ success:true });
  }
  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    if (user.role === 'polizei') { try { const e = await db.from('einsaetze').filter('id','eq',id); if (e[0]?.erstellt_von_id !== user.id) return res.status(403).json({ error:'Nur eigene Einsätze löschen' }); } catch {} } else { requireRole(user,'admin','leitung'); }
    try { await db.from('einsaetze').delete(`id=eq.${id}`); } catch {}
    await aktivitaetLog(user, 'GELÖSCHT', `🚨 Einsatz **${id}** gelöscht`);
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
