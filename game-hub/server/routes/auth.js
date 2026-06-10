import { Router } from 'express';
import { anonSupabase, createUserSupabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password, screenName } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await anonSupabase.auth.signUp({
    email,
    password,
    options: screenName ? { data: { screen_name: screenName } } : undefined,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    user: data.user,
    session: data.session,
    accessToken: data.session?.access_token ?? null,
  });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await anonSupabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({
    user: data.user,
    session: data.session,
    accessToken: data.session?.access_token ?? null,
  });
});

router.post('/signout', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ ok: true });
});

router.get('/session', requireAuth, (req, res) => {
  res.json({
    user: req.user,
    accessToken: req.accessToken,
  });
});

export default router;
