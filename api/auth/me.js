// /api/auth/me.js — Gibt den eingeloggten Nutzer zurück
import { getSessionFromRequest, apiHandler } from '../_lib.js';

export default apiHandler(async (req, res) => {
  const user = getSessionFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.json(user);
});
