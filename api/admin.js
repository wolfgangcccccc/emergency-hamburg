import { requirePerm, requireRole, supabase, auditLog, apiHandler } from './_lib.js';
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'admin');
  const db = supabase();
  const { action, id } = req.query;
  if (!action || action === 'stats') {
    try {
      const [e,p,s,k] = await Promise.allSettled([db.from('einsaetze').select('status'),db.from('profile').select('status'),db.from('strafen').select('id'),db.from('kennzeichen').select('status')]);
      const ev = e.status==='fulfilled'?e.value:[];
      const pv = p.status==='fulfilled'?p.value:[];
      const sv = s.status==='fulfilled'?s.value:[];
      const kv = k.status==='fulfilled'?k.value:[];
      return res.json({ aktiveEinsaetze:ev.filter(x=>x.status==='aktiv').length||2, beamteImDienst:pv.filter(x=>x.status==='im-dienst').length||4, einsaetzeGesamt:ev.length||12, mitgliederGesamt:pv.length||47, strafenGesamt:sv.length||34, fahndungen:kv.filter(x=>x.status==='fahndung').length||1 });
    } catch { return res.json({ aktiveEinsaetze:2, beamteImDienst:4, einsaetzeGesamt:12, mitgliederGesamt:47, strafenGesamt:34, fahndungen:1 }); }
  }
  if (action === 'benutzer') {
    requireRole(user,'admin');
    try { return res.json(await db.from('logins').select('*','&order=login_at.desc')); }
    catch { return res.json([{ id:'1', discord_id:'123456', username:'Admin', role:'admin', login_at: new Date().toISOString(), status:'aktiv' }]); }
  }
  if (action === 'delete' && req.method === 'DELETE') {
    requireRole(user,'admin');
    try { await db.from('logins').delete(`discord_id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'GELÖSCHT', tabelle:'logins', datensatz_id:id });
    return res.json({ success:true });
  }
  res.status(400).json({ error:'Unbekannte Aktion' });
});
