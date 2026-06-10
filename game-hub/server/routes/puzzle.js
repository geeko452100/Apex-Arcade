import { Router } from 'express';
import { anonSupabase, createUserSupabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/result', requireAuth, async (req, res) => {
  const { puzzleDate, guessesUsed } = req.body ?? {};

  if (!puzzleDate || guessesUsed == null) {
    return res.status(400).json({ error: 'puzzleDate and guessesUsed are required' });
  }

  const supabase = createUserSupabase(req.accessToken);
  const { error } = await supabase
    .from('puzzle_results')
    .upsert(
      {
        user_id: req.user.id,
        puzzle_date: puzzleDate,
        guesses_used: guessesUsed,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,puzzle_date' },
    );

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ ok: true });
});

router.get('/leaderboard/:puzzleDate', async (req, res) => {
  const { puzzleDate } = req.params;
  const limit = Number(req.query.limit) || 100;

  const { data, error } = await anonSupabase
    .from('puzzle_results')
    .select(`
      user_id,
      guesses_used,
      completed_at,
      profiles ( screen_name )
    `)
    .eq('puzzle_date', puzzleDate)
    .order('guesses_used', { ascending: true })
    .order('completed_at', { ascending: true })
    .limit(limit);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data: data ?? [] });
});

router.get('/result/:puzzleDate', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);

  const { data, error } = await supabase
    .from('puzzle_results')
    .select('user_id, guesses_used, completed_at')
    .eq('puzzle_date', req.params.puzzleDate)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data: data ?? null });
});

router.get('/rank/:puzzleDate', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);
  const puzzleDate = req.params.puzzleDate;

  const { data: userResult, error: userError } = await supabase
    .from('puzzle_results')
    .select('user_id, guesses_used, completed_at')
    .eq('puzzle_date', puzzleDate)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (userError) {
    return res.status(400).json({ error: userError.message });
  }

  if (!userResult) {
    return res.json({ data: null });
  }

  const { count, error: countError } = await supabase
    .from('puzzle_results')
    .select('*', { count: 'exact', head: true })
    .eq('puzzle_date', puzzleDate)
    .or(
      `guesses_used.lt.${userResult.guesses_used},and(guesses_used.eq.${userResult.guesses_used},completed_at.lt.${userResult.completed_at})`,
    );

  if (countError) {
    return res.status(400).json({ error: countError.message });
  }

  res.json({
    data: {
      rank: (count ?? 0) + 1,
      guessesUsed: userResult.guesses_used,
      completedAt: userResult.completed_at,
    },
  });
});

export default router;
