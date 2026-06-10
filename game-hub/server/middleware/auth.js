import { anonSupabase } from '../lib/supabase.js';

/**
 * Verifies the Bearer JWT and attaches req.user + req.accessToken.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const accessToken = header.slice(7);
  const { data, error } = await anonSupabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return res.status(401).json({ error: error?.message ?? 'Invalid session' });
  }

  req.user = data.user;
  req.accessToken = accessToken;
  next();
}
