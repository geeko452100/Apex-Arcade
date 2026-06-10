import { Router } from 'express';
import { createUserSupabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/card-battler/result', requireAuth, async (req, res) => {
  const { didWin } = req.body ?? {};

  if (typeof didWin !== 'boolean') {
    return res.status(400).json({ error: 'didWin (boolean) is required' });
  }

  const supabase = createUserSupabase(req.accessToken);
  const { error } = await supabase.rpc('record_card_battler_result', {
    p_won: didWin,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ ok: true });
});

export default router;
