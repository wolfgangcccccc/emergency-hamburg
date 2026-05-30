import { requirePerm, requireRole, supabase, auditLog, discordLog, apiHandler } from './_lib.js';
const DEMO = [{ id:1, kennzeichen:'HH-PD 1234', besitzer:'Max Hansen', fahrzeug:'BMW 5er', farbe:'Schwarz', status:'unauffällig' },{ id:2, kennzeichen:'HH-XX 9999', besitzer:'Unbekannt', fahrzeug:'Audi A4', farbe:'Grau', status:'fahndung' }];
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'kennzeichen');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') {
    try { return res.json(await db.from('kennzeichen').select('*')); } catch { return res.json(DEMO); }
  }
  if (req.method === 'POST') {
    requireRole(user,'admin','leitung');
    const { kennzeichen, besitzer, fahrzeug, farbe, status } = req.body;
    if (!kennzeichen || !besitzer || !fahrzeug) return res.status(400).json({ error:'Kennzeichen, Besitzer und Fahrzeug erforderlich' });
    const neues = { kennzeichen:kennzeichen.toUpperCase(), besitzer, fahrzeug, farbe:farbe||'Unbekannt', status:status||'unauffällig', erstellt_am: new Date().toISOString() };
    try { await db.from('kennzeichen').insert(neues); } catch {}
    await auditLog(db, { user, aktion:'ERSTELLT', tabelle:'kennzeichen', datensatz_id:kennzeichen, details:`${besitzer} - ${fahrzeug}` });
    return res.status(201).json(neues);
  }
  if (req.method === 'PATCH') {
    requireRole(user,'admin','leitung');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('kennzeichen').update(req.body,`id=eq.${id}`); } catch {}
    if (req.body.status === 'fahndung') { await discordLog(process.env.DISCORD_LOG_CHANNEL_ID, { title:'🔴 FAHNDUNG', color:0xFF1A2E, fields:[{ name:'Kennzeichen', value:String(id) },{ name:'Gemeldet von', value:user.nickname||user.username }], footer:{ text:'🚔 Emergency Hamburg' }, timestamp: new Date().toISOString() }); }
    await auditLog(db, { user, aktion:'BEARBEITET', tabelle:'kennzeichen', datensatz_id:String(id), details:JSON.stringify(req.body) });
    return res.json({ success:true });
  }
  if (req.method === 'DELETE') {
    requireRole(user,'admin');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('kennzeichen').delete(`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'GELÖSCHT', tabelle:'kennzeichen', datensatz_id:String(id) });
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
