import { Router } from 'express';
import { anonSupabase, createUserSupabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function getIdleLifetimeTotal(saveData) {
  const lifetime = Number(saveData?.lifetimeEarnings) || 0;
  const currentRun = Number(saveData?.totalEarned) || 0;
  return lifetime + currentRun;
}

router.get('/card-battler', async (req, res) => {
  const limit = Number(req.query.limit) || 100;

  const { data, error } = await anonSupabase
    .from('card_battler_stats')
    .select(`
      user_id,
      wins,
      losses,
      profiles ( screen_name )
    `)
    .order('wins', { ascending: false })
    .order('losses', { ascending: true })
    .limit(limit);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ data: data ?? [] });
});

router.get('/card-battler/rank', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);

  const { data: userStats, error: userError } = await supabase
    .from('card_battler_stats')
    .select('wins, losses')
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (userError || !userStats) {
    return res.json({ data: null });
  }

  const { count, error: countError } = await supabase
    .from('card_battler_stats')
    .select('*', { count: 'exact', head: true })
    .or(
      `wins.gt.${userStats.wins},and(wins.eq.${userStats.wins},losses.lt.${userStats.losses})`,
    );

  if (countError) {
    return res.status(400).json({ error: countError.message });
  }

  res.json({
    data: {
      rank: (count ?? 0) + 1,
      wins: userStats.wins,
      losses: userStats.losses,
    },
  });
});

router.get('/idle', async (req, res) => {
  const limit = Number(req.query.limit) || 100;

  const { data, error } = await anonSupabase
    .from('idle_saves')
    .select(`
      user_id,
      save_data,
      profiles ( screen_name )
    `);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const ranked = (data ?? [])
    .map((row) => ({
      ...row,
      lifetimeTotal: getIdleLifetimeTotal(row.save_data),
    }))
    .filter((row) => row.lifetimeTotal > 0)
    .sort((a, b) => b.lifetimeTotal - a.lifetimeTotal)
    .slice(0, limit);

  res.json({ data: ranked });
});

router.get('/idle/rank', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);

  const { data: allSaves, error } = await supabase
    .from('idle_saves')
    .select('user_id, save_data');

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const userSave = (allSaves ?? []).find((row) => row.user_id === req.user.id);
  if (!userSave) {
    return res.json({ data: null });
  }

  const userTotal = getIdleLifetimeTotal(userSave.save_data);
  if (userTotal <= 0) {
    return res.json({ data: null });
  }

  const rank =
    (allSaves ?? []).filter((row) => getIdleLifetimeTotal(row.save_data) > userTotal).length + 1;

  res.json({ data: { rank, lifetimeTotal: userTotal } });
});

export default router;
