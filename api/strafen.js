import { requirePerm, requireRole, supabase, auditLog, aktivitaetLog, discordLog, apiHandler } from './_lib.js';
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'strafen');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') { try { return res.json(await db.from('strafen').select('*','&order=datum.desc')); } catch { return res.json([]); } }
  if (req.method === 'POST') {
    const { name, vergehen, betrag, bearbeiter_dn } = req.body;
    if (!name || !vergehen || !betrag) return res.status(400).json({ error:'Pflichtfelder fehlen' });
    const neues = { id:`S-${Date.now()}`, name, vergehen, betrag:parseInt(betrag), bearbeiter_dn:bearbeiter_dn||user.nickname, erstellt_von_id:user.id, datum:new Date().toISOString() };
    try { await db.from('strafen').insert(neues); } catch {}
    await auditLog(db, { user, aktion:'ERSTELLT', tabelle:'strafen', datensatz_id:neues.id, details:`${name} - ${vergehen} - ${betrag}€` });
    await aktivitaetLog(user, 'ERSTELLT', `📋 Strafe für **${name}**: ${vergehen} — ${betrag}€`);
    await discordLog(process.env.DISCORD_LOG_CHANNEL_ID, { title:'📋 Neue Strafe', color:0xFF8C00, fields:[{name:'Person',value:name,inline:true},{name:'Vergehen',value:vergehen,inline:true},{name:'Betrag',value:`${betrag}€`,inline:true},{name:'Bearbeiter',value:user.nickname||user.username,inline:true}] });
    return res.status(201).json(neues);
  }
  if (req.method === 'DELETE') {
    requireRole(user,'admin','leitung');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('strafen').delete(`id=eq.${id}`); } catch {}
    await aktivitaetLog(user, 'GELÖSCHT', `📋 Strafe **${id}** gelöscht`);
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
