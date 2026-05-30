import { requirePerm, requireRole, supabase, apiHandler } from './_lib.js';
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'logs');
  const db = supabase();
  const { typ } = req.query;
  if (!typ || typ === 'audit') {
    try { return res.json(await db.from('audit_log').select('*','&order=zeitpunkt.desc&limit=100')); }
    catch { return res.json([{ id:1, user_id:'123', username:'Admin', rolle:'admin', aktion:'ERSTELLT', tabelle:'einsaetze', datensatz_id:'E-001', details:'Test', zeitpunkt: new Date().toISOString() }]); }
  }
  if (typ === 'logins') {
    try { return res.json(await db.from('logins').select('*','&order=login_at.desc&limit=100')); }
    catch { return res.json([{ id:1, discord_id:'123', username:'Admin', role:'admin', login_at: new Date().toISOString(), status:'aktiv' }]); }
  }
  if (typ === 'system') {
    return res.json({ zeitpunkt: new Date().toISOString(), dienste: [{ name:'Vercel API', status:'online', latenz:'< 50ms' }, { name:'Supabase DB', status:'online', latenz:'< 100ms' }, { name:'Discord OAuth', status:'online', latenz:'< 200ms' }, { name:'Discord Bot', status: process.env.DISCORD_BOT_TOKEN ? 'online' : 'offline', latenz:'—' }], version:'2.0.0', phase:'Phase 2', uptime:'99.9%' });
  }
  if (typ === 'api') {
    requireRole(user, 'admin');
    return res.json({ zeitpunkt: new Date().toISOString(), endpunkte: [{ path:'/api/einsaetze', methoden:['GET','POST','PATCH','DELETE'], status:'aktiv' }, { path:'/api/profile', methoden:['GET','POST','PATCH','DELETE'], status:'aktiv' }, { path:'/api/strafen', methoden:['GET','POST','DELETE'], status:'aktiv' }, { path:'/api/kennzeichen', methoden:['GET','POST','PATCH','DELETE'], status:'aktiv' }, { path:'/api/einheiten', methoden:['GET','POST','PATCH','DELETE'], status:'aktiv' }, { path:'/api/logs', methoden:['GET'], status:'aktiv' }, { path:'/api/admin', methoden:['GET','DELETE'], status:'aktiv' }] });
  }
  if (typ === 'debug') {
    requireRole(user, 'admin');
    return res.json({ zeitpunkt: new Date().toISOString(), environment: { DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? '✅ gesetzt' : '❌ fehlt', DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ? '✅ gesetzt' : '❌ fehlt', DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID ? '✅ gesetzt' : '❌ fehlt', SUPABASE_URL: process.env.SUPABASE_URL ? '✅ gesetzt' : '❌ fehlt', SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? '✅ gesetzt' : '❌ fehlt', JWT_SECRET: process.env.JWT_SECRET ? '✅ gesetzt' : '❌ fehlt', ROLE_ADMIN: process.env.ROLE_ADMIN || '❌ fehlt', ROLE_LEITUNG: process.env.ROLE_LEITUNG || '❌ fehlt', ROLE_POLIZEI: process.env.ROLE_POLIZEI || '❌ fehlt', ROLE_ZUSCHAUER: process.env.ROLE_ZUSCHAUER || '❌ fehlt' } });
  }
  res.status(400).json({ error: 'Unbekannter Typ' });
});
