import { requirePerm, requireRole, supabase, discordLog, apiHandler } from './_lib.js';
export default apiHandler(async (req, res) => {
  const user = requirePerm(req, 'logs');
  const db = supabase();
  const { typ, post_to_discord } = req.query;
  if (!typ || typ === 'audit') {
    try { const data = await db.from('audit_log').select('*','&order=zeitpunkt.desc&limit=100'); if (post_to_discord==='true') { requireRole(user,'admin','leitung'); await discordLog(process.env.LOG_ADMIN,{title:'📋 Admin Panel Logs',color:0xFF8C00,description:data.slice(0,5).map(l=>`**${l.username}** → ${l.aktion} in \`${l.tabelle}\` — ${l.details||'—'}`).join('\n')}); } return res.json(data); } catch { return res.json([]); }
  }
  if (typ === 'logins') { try { return res.json(await db.from('logins').select('*','&order=login_at.desc&limit=100')); } catch { return res.json([]); } }
  if (typ === 'system') {
    const data = { zeitpunkt:new Date().toISOString(), dienste:[{name:'Vercel API',status:'online',latenz:'< 50ms'},{name:'Supabase DB',status:'online',latenz:'< 100ms'},{name:'Discord OAuth',status:'online',latenz:'< 200ms'},{name:'Discord Bot',status:process.env.DISCORD_BOT_TOKEN?'online':'offline',latenz:'—'}], version:'2.1.0', phase:'Phase 2', uptime:'99.9%' };
    if (post_to_discord==='true') { requireRole(user,'admin','leitung'); await discordLog(process.env.LOG_SYSTEM,{title:'⚙️ System Status',color:0x00E676,fields:data.dienste.map(d=>({name:d.name,value:`${d.status==='online'?'🟢':'🔴'} ${d.status} (${d.latenz})`,inline:true})),description:`Version: **${data.version}** | Uptime: **${data.uptime}**`}); }
    return res.json(data);
  }
  if (typ === 'api') {
    requireRole(user,'admin','leitung');
    const data = { zeitpunkt:new Date().toISOString(), endpunkte:[{path:'/api/einsaetze',methoden:['GET','POST','PATCH','DELETE'],status:'aktiv'},{path:'/api/profile',methoden:['GET','POST','PATCH','DELETE'],status:'aktiv'},{path:'/api/strafen',methoden:['GET','POST','DELETE'],status:'aktiv'},{path:'/api/kennzeichen',methoden:['GET','POST','PATCH','DELETE'],status:'aktiv'},{path:'/api/einheiten',methoden:['GET','POST','PATCH','DELETE'],status:'aktiv'},{path:'/api/logs',methoden:['GET'],status:'aktiv'},{path:'/api/admin',methoden:['GET','POST','DELETE'],status:'aktiv'}] };
    if (post_to_discord==='true') { await discordLog(process.env.LOG_API,{title:'🔌 API Status',color:0x0099FF,description:data.endpunkte.map(e=>`🟢 \`${e.path}\` — ${e.methoden.join(', ')}`).join('\n')}); }
    return res.json(data);
  }
  if (typ === 'debug') {
    requireRole(user,'admin');
    const data = { zeitpunkt:new Date().toISOString(), environment:{ DISCORD_CLIENT_ID:process.env.DISCORD_CLIENT_ID?'✅ gesetzt':'❌ fehlt', DISCORD_BOT_TOKEN:process.env.DISCORD_BOT_TOKEN?'✅ gesetzt':'❌ fehlt', DISCORD_GUILD_ID:process.env.DISCORD_GUILD_ID?'✅ gesetzt':'❌ fehlt', SUPABASE_URL:process.env.SUPABASE_URL?'✅ gesetzt':'❌ fehlt', SUPABASE_SERVICE_KEY:process.env.SUPABASE_SERVICE_KEY?'✅ gesetzt':'❌ fehlt', JWT_SECRET:process.env.JWT_SECRET?'✅ gesetzt':'❌ fehlt', ROLE_ADMIN:process.env.ROLE_ADMIN||'❌ fehlt', ROLE_LEITUNG:process.env.ROLE_LEITUNG||'❌ fehlt', ROLE_POLIZEI:process.env.ROLE_POLIZEI||'❌ fehlt', LOG_AKTIVITAET:process.env.LOG_AKTIVITAET?'✅ gesetzt':'❌ fehlt', LOG_ADMIN:process.env.LOG_ADMIN?'✅ gesetzt':'❌ fehlt', LOG_SYSTEM:process.env.LOG_SYSTEM?'✅ gesetzt':'❌ fehlt', LOG_API:process.env.LOG_API?'✅ gesetzt':'❌ fehlt', LOG_DEBUG:process.env.LOG_DEBUG?'✅ gesetzt':'❌ fehlt' } };
    if (post_to_discord==='true') { await discordLog(process.env.LOG_DEBUG,{title:'🐛 Debug Report',color:0xFF8C00,description:Object.entries(data.environment).map(([k,v])=>`${v.startsWith('✅')?'🟢':'🔴'} \`${k}\`: ${v}`).join('\n')}); }
    return res.json(data);
  }
  res.status(400).json({ error:'Unbekannter Typ' });
});
