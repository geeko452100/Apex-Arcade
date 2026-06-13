import { supabase } from '@/games/card-battler/lib/supabaseClient';
import { getTodayDate } from '@/games/puzzle/gameLogic';

/**
 * Idle leaderboard metric: lifetimeEarnings + totalEarned from save_data.
 * lifetimeEarnings accumulates across prestiges; totalEarned is the current run.
 * Together they represent total income ever generated — the fairest cross-player comparison.
 */
export function getIdleLifetimeTotal(saveData) {
  const lifetime = Number(saveData?.lifetimeEarnings) || 0;
  const currentRun = Number(saveData?.totalEarned) || 0;
  return lifetime + currentRun;
}

export async function fetchCardBattlerLeaderboard(limit = 100) {
  const { data, error } = await supabase
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
    console.warn('[leaderboard] Card battler fetch failed:', error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchCardBattlerUserRank(userId) {
  const { data: userStats, error: userError } = await supabase
    .from('card_battler_stats')
    .select('wins, losses')
    .eq('user_id', userId)
    .maybeSingle();

  if (userError || !userStats) return null;

  const { count, error: countError } = await supabase
    .from('card_battler_stats')
    .select('*', { count: 'exact', head: true })
    .or(
      `wins.gt.${userStats.wins},and(wins.eq.${userStats.wins},losses.lt.${userStats.losses})`,
    );

  if (countError) return null;

  return {
    rank: (count ?? 0) + 1,
    wins: userStats.wins,
    losses: userStats.losses,
  };
}

export async function fetchIdleLeaderboard(limit = 100) {
  const { data, error } = await supabase
    .from('idle_saves')
    .select(`
      user_id,
      save_data,
      lifetime_total,
      profiles ( screen_name )
    `)
    .gt('lifetime_total', 0)
    .order('lifetime_total', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[leaderboard] Idle fetch failed:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    lifetimeTotal: Number(row.lifetime_total) || getIdleLifetimeTotal(row.save_data),
  }));
}

export async function fetchIdleUserRank(userId) {
  const { data: userSave, error: userError } = await supabase
    .from('idle_saves')
    .select('user_id, save_data, lifetime_total')
    .eq('user_id', userId)
    .maybeSingle();

  if (userError || !userSave) return null;

  const userTotal =
    Number(userSave.lifetime_total) || getIdleLifetimeTotal(userSave.save_data);
  if (userTotal <= 0) return null;

  const { count, error: countError } = await supabase
    .from('idle_saves')
    .select('*', { count: 'exact', head: true })
    .gt('lifetime_total', userTotal);

  if (countError) return null;

  return { rank: (count ?? 0) + 1, lifetimeTotal: userTotal };
}

export {
  fetchTodayLeaderboard as fetchPuzzleLeaderboard,
  fetchUserRank as fetchPuzzleUserRank,
} from '@/games/puzzle/lib/cloudPersistence';

export function getTodayPuzzleDate() {
  return getTodayDate();
}