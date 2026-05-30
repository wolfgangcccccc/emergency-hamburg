import { requirePerm, requireRole, supabase, auditLog, apiHandler } from './_lib.js';
const DEMO = [{ id:1, funkrufname:'PHW-1', status:'verfügbar', dienstnummer:'10234', spieler:'Officer_Hansen', fahrzeug:'FuStW' },{ id:2, funkrufname:'PHW-2', status:'im-einsatz', dienstnummer:'10235', spieler:'Officer_Müller', fahrzeug:'FuStW' },{ id:3, funkrufname:'PHW-K1', status:'bereit', dienstnummer:'10200', spieler:'KOK_Weber', fahrzeug:'FuKw' }];
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'funk');
  const db = supabase();
  const { id } = req.query;
  if (req.method === 'GET') {
    try { return res.json(await db.from('einheiten').select('*')); } catch { return res.json(DEMO); }
  }
  if (req.method === 'POST') {
    requireRole(user,'admin','leitung');
    const { funkrufname, dienstnummer, spieler, fahrzeug } = req.body;
    if (!funkrufname || !dienstnummer || !spieler) return res.status(400).json({ error:'Funkrufname, DN und Spieler erforderlich' });
    const neues = { funkrufname, dienstnummer, spieler, fahrzeug:fahrzeug||'FuStW', status:'außer-dienst' };
    try { await db.from('einheiten').insert(neues); } catch {}
    await auditLog(db, { user, aktion:'ERSTELLT', tabelle:'einheiten', datensatz_id:funkrufname, details:`${spieler} - ${fahrzeug}` });
    return res.status(201).json(neues);
  }
  if (req.method === 'PATCH') {
    requireRole(user,'admin','leitung','polizei');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('einheiten').update(req.body,`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'BEARBEITET', tabelle:'einheiten', datensatz_id:String(id), details:JSON.stringify(req.body) });
    return res.json({ success:true });
  }
  if (req.method === 'DELETE') {
    requireRole(user,'admin');
    if (!id) return res.status(400).json({ error:'ID erforderlich' });
    try { await db.from('einheiten').delete(`id=eq.${id}`); } catch {}
    await auditLog(db, { user, aktion:'GELÖSCHT', tabelle:'einheiten', datensatz_id:String(id) });
    return res.json({ success:true });
  }
  res.status(405).json({ error:'Method not allowed' });
});
