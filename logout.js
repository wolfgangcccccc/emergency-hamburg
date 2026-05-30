// /api/auth/logout.js — Löscht die Session
import { apiHandler } from '../_lib.js';

export default apiHandler(async (req, res) => {
  res.setHeader('Set-Cookie', 'eh_session=; Path=/; HttpOnly; Max-Age=0');
  res.json({ success: true });
});
