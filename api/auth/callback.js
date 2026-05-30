// /api/auth/callback.js — Discord OAuth Callback
import { signSession, resolveRole, apiHandler } from '../_lib.js';

const DISCORD = 'https://discord.com/api/v10';
const FRONT   = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.FRONTEND_URL || 'http://localhost:5173');

export default apiHandler(async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`${FRONT}/?error=access_denied`);
  }

  // 1. Code gegen Token tauschen
  const tokenRes = await fetch(`${DISCORD}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  process.env.DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    return res.redirect(`${FRONT}/?error=token_failed`);
  }

  const { access_token } = await tokenRes.json();

  // 2. Nutzerprofil holen
  const userRes = await fetch(`${DISCORD}/users/@me`, {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const user = await userRes.json();

  // 3. Guild Member holen (für Rollen) via Bot Token
  const memberRes = await fetch(
    `${DISCORD}/guilds/${process.env.DISCORD_GUILD_ID}/members/${user.id}`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
  );

  if (!memberRes.ok) {
    return res.redirect(`${FRONT}/?error=not_in_guild`);
  }

  const member = await memberRes.json();
  const role   = resolveRole(member.roles);

  if (!role) {
    return res.redirect(`${FRONT}/?error=no_permission`);
  }

  // 4. Login in Discord loggen
  sendLoginLog({ user, member, role }).catch(() => {});

  // 5. JWT Session Cookie setzen
  const sessionData = {
    id:         user.id,
    username:   user.username,
    globalName: user.global_name || user.username,
    nickname:   member.nick || user.global_name || user.username,
    avatar:     user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${(parseInt(user.id) % 5)}.png`,
    role,
    loginAt: new Date().toISOString(),
  };

  const token = signSession(sessionData);

  res.setHeader('Set-Cookie',
    `eh_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=86400`
  );

  return res.redirect(`${FRONT}/dashboard?login=success`);
});

// ── Discord Login-Log ──────────────────────────────
async function sendLoginLog({ user, member, role }) {
  const channelId = process.env.DISCORD_LOG_CHANNEL_ID;
  const botToken  = process.env.DISCORD_BOT_TOKEN;
  if (!channelId || !botToken) return;

  const colors = { admin: 16711680, leitung: 16744448, polizei: 39423, zuschauer: 8947848 };
  const icons  = { admin: '👑', leitung: '🎖️', polizei: '🚔', zuschauer: '👁️' };

  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '🔐 Dashboard Login',
        color: colors[role],
        thumbnail: { url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` },
        fields: [
          { name: 'Nutzer', value: `**${member.nick || user.global_name || user.username}** (${user.username})`, inline: true },
          { name: 'Rolle', value: `${icons[role]} ${role.toUpperCase()}`, inline: true },
          { name: 'Zeit', value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
        ],
        footer: { text: '🚔 Emergency Hamburg Dashboard' },
      }]
    })
  });
}
