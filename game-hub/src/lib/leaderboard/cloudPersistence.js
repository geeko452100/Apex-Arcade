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
      profiles ( screen_name )
    `);

  if (error) {
    console.warn('[leaderboard] Idle fetch failed:', error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => ({
      ...row,
      lifetimeTotal: getIdleLifetimeTotal(row.save_data),
    }))
    .filter((row) => row.lifetimeTotal > 0)
    .sort((a, b) => b.lifetimeTotal - a.lifetimeTotal)
    .slice(0, limit);
}

export async function fetchIdleUserRank(userId) {
  const { data: allSaves, error } = await supabase
    .from('idle_saves')
    .select('user_id, save_data');

  if (error) return null;

  const userSave = (allSaves ?? []).find((row) => row.user_id === userId);
  if (!userSave) return null;

  const userTotal = getIdleLifetimeTotal(userSave.save_data);
  if (userTotal <= 0) return null;

  const rank =
    (allSaves ?? []).filter((row) => getIdleLifetimeTotal(row.save_data) > userTotal).length + 1;

  return { rank, lifetimeTotal: userTotal };
}

export {
  fetchTodayLeaderboard as fetchPuzzleLeaderboard,
  fetchUserRank as fetchPuzzleUserRank,
} from '@/games/puzzle/lib/cloudPersistence';

export function getTodayPuzzleDate() {
  return getTodayDate();
}