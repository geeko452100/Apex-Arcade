import { Router } from 'express';
import { createUserSupabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/join', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);
  const gameType = req.body?.gameType ?? 'card-battler';

  const { data, error } = await supabase.rpc('find_or_create_match', {
    p_game_type: gameType,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const match = Array.isArray(data) ? data[0] : data;
  res.json({
    status: match?.status ?? 'queued',
    gameId: match?.game_id ?? null,
  });
});

router.delete('/cancel', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);

  const { error } = await supabase
    .from('matchmaking_queue')
    .delete()
    .eq('player_id', req.user.id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ ok: true });
});

/**
 * Poll for a match while queued. Optional `since` ISO timestamp limits to games
 * created after matchmaking started.
 */
router.get('/status', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);
  const userId = req.user.id;
  const since = req.query.since;

  let query = supabase
    .from('games')
    .select('id, created_at')
    .or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const game = data?.[0];
  if (game) {
    return res.json({ status: 'matched', gameId: game.id });
  }

  res.json({ status: 'waiting', gameId: null });
});

export default router;
