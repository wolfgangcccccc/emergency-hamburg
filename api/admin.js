import { requirePerm, requireRole, supabase, auditLog, adminLog, discordLog, apiHandler } from './_lib.js';
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'admin');
  const db = supabase();
  const { action, id } = req.query;
  if (!action || action === 'stats') {
    try {
      const [e,p,s,k] = await Promise.allSettled([db.from('einsaetze').select('status'),db.from('profile').select('status'),db.from('strafen').select('id'),db.from('kennzeichen').select('status')]);
      return res.json({ aktiveEinsaetze:(e.value||[]).filter(x=>x.status==='aktiv').length, beamteImDienst:(p.value||[]).filter(x=>x.status==='im-dienst').length, einsaetzeGesamt:(e.value||[]).length, mitgliederGesamt:(p.value||[]).length, strafenGesamt:(s.value||[]).length, fahndungen:(k.value||[]).filter(x=>x.status==='fahndung').length });
    } catch { return res.json({ aktiveEinsaetze:0, beamteImDienst:0, einsaetzeGesamt:0, mitgliederGesamt:0, strafenGesamt:0, fahndungen:0 }); }
  }
  if (action === 'benutzer') { requireRole(user,'admin'); try { return res.json(await db.from('logins').select('*','&order=login_at.desc')); } catch { return res.json([]); } }
  if (action === 'delete' && req.method === 'DELETE') { requireRole(user,'admin'); try { await db.from('logins').delete(`discord_id=eq.${id}`); } catch {} await adminLog(user,'BENUTZER ENTFERNT',`Discord ID: ${id}`); return res.json({ success:true }); }
  if (action === 'closeAll' && req.method === 'POST') {
    requireRole(user,'admin','leitung');
    try { await db.from('einsaetze').update({ status:'abgeschlossen' },'status=eq.aktiv'); } catch {}
    await adminLog(user,'ALLE EINSÄTZE ABGESCHLOSSEN','Alle aktiven Einsätze wurden beendet');
    return res.json({ success:true });
  }
  if (action === 'postStatus' && req.method === 'POST') {
    requireRole(user,'admin','leitung');
    await discordLog(process.env.LOG_SYSTEM,{title:'⚙️ System Status',color:0x00E676,fields:[{name:'Dashboard',value:'🟢 Online',inline:true},{name:'Datenbank',value:'🟢 Online',inline:true},{name:'Discord Bot',value:'🟢 Online',inline:true}],description:`Gepostet von **${user.nickname||user.username}**`});
    await adminLog(user,'STATUS GEPOSTET','System Status auf Discord gepostet');
    return res.json({ success:true });
  }
  if (action === 'clearStrafen' && req.method === 'DELETE') { requireRole(user,'admin'); try { await db.from('strafen').delete('id=neq.null'); } catch {} await adminLog(user,'STRAFEN GELEERT','Alle Strafen gelöscht'); return res.json({ success:true }); }
  if (action === 'clearAudit' && req.method === 'DELETE') { requireRole(user,'admin'); try { await db.from('audit_log').delete('id=neq.null'); } catch {} await adminLog(user,'AUDIT LOG GELEERT','Audit Log geleert'); return res.json({ success:true }); }
  res.status(400).json({ error:'Unbekannte Aktion' });
});
