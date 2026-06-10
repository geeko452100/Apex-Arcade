import { Router } from 'express';
import { createUserSupabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const GAME_ROW_SELECT = 'status, player_1_id, player_2_id, state_version';

function buildUpdatePayload(nextState) {
  return {
    status: nextState,
    state_version: nextState.stateVersion ?? 0,
    turn_owner: nextState.turnOwner ?? null,
  };
}

router.get('/:gameId', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);
  const { data, error } = await supabase
    .from('games')
    .select(GAME_ROW_SELECT)
    .eq('id', req.params.gameId)
    .single();

  if (error) {
    return res.status(error.code === 'PGRST116' ? 404 : 400).json({ error: error.message });
  }

  res.json({ data });
});

router.put('/:gameId', requireAuth, async (req, res) => {
  const { nextState, expectedVersion } = req.body ?? {};

  if (!nextState || typeof nextState !== 'object') {
    return res.status(400).json({ error: 'nextState is required' });
  }

  const supabase = createUserSupabase(req.accessToken);
  const gameId = req.params.gameId;
  const prevVersion = expectedVersion ?? Math.max(0, (nextState.stateVersion ?? 1) - 1);
  const payload = buildUpdatePayload(nextState);

  const versioned = await supabase
    .from('games')
    .update(payload)
    .eq('id', gameId)
    .eq('state_version', prevVersion)
    .select('status');

  if (!versioned.error && versioned.data?.length > 0) {
    return res.json({ data: versioned.data });
  }

  const fallback = await supabase
    .from('games')
    .update(payload)
    .eq('id', gameId)
    .select('status');

  if (fallback.error) {
    return res.status(400).json({ error: fallback.error.message });
  }

  res.json({ data: fallback.data });
});

export default router;
