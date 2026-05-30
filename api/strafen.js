import { requirePerm, requireRole, supabase, auditLog, discordLog, apiHandler } from './_lib.js';
const DEMO = [{ id:'S-001', name:'PlayerXYZ', vergehen:'Geschwindigkeitsüberschreitung', betrag:150, bearbeiter_dn:'10234', datum: new Date().toISOString() },{ id:'S-002', name:'User_Test', vergehen:'Fahren unter Einfluss', betrag:500, bearbeiter_dn:'10235', datum: new Date(Date.now()-86400000).toISOString() }];
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'strafen');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') {
    try { return res.json(await db.from('strafen').select('*')); } catch { return res.json(DEMO); }
  }
  if (req.method === 'POST') {
    requireRole(user,'admin','leitung','polizei');
    const { name, vergehen, betrag, bearbeiter_dn } = req.body;
    if (!name || !vergehen || !betrag) return res.status(400).json({ error:'Name, Vergehen und Betrag erforderlich' });
    const neues = { id:`S-${Date.now()}`, name, vergehen, betrag:parseInt(betrag), bearbeiter_dn: bearbeiter_dn||user.nickname, datum: new Date().toISOString() };
    try { await db.from('strafen').insert(neues); } catch {}
    await auditLog(db, { user, aktion:'ERSTELLT', tabelle:'strafen', datensatz_id:neues.id, details:`${name} - ${vergehen} - ${betrag}€` });
    await discordLog(process.env.DISCORD_LOG_CHANNEL_ID, { title:'📋 Neue Strafe', color:0xFF8C00, fields:[{ name:'Person', value:name, inline:true },{ name:'Vergehen', value:vergehen, inline:true },{ name:'Betrag', value:`${betrag}€`, inline:true },{ name:'Bearbeiter', value:user.nickname||user.username, inline:true }], footer:{ text:'🚔 Emergency Hamburg' }, timestamp: new Date().toISOString() });
    return res.status(201).json(neues);
  }
  if (req.method === 'DELETE') {
    requireRole(user,'admin');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('strafen').delete(`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'GELÖSCHT', tabelle:'strafen', datensatz_id:id });
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
