import { api } from '@/lib/apiClient';
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
  try {
    const { data } = await api.leaderboard.cardBattler(limit);
    return data ?? [];
  } catch (error) {
    console.warn('[leaderboard] Card battler fetch failed:', error.message);
    return [];
  }
}

export async function fetchCardBattlerUserRank() {
  try {
    const { data } = await api.leaderboard.cardBattlerRank();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function fetchIdleLeaderboard(limit = 100) {
  try {
    const { data } = await api.leaderboard.idle(limit);
    return data ?? [];
  } catch (error) {
    console.warn('[leaderboard] Idle fetch failed:', error.message);
    return [];
  }
}

export async function fetchIdleUserRank() {
  try {
    const { data } = await api.leaderboard.idleRank();
    return data ?? null;
  } catch {
    return null;
  }
}

export {
  fetchTodayLeaderboard as fetchPuzzleLeaderboard,
  fetchUserRank as fetchPuzzleUserRank,
} from '@/games/puzzle/lib/cloudPersistence';

export function getTodayPuzzleDate() {
  return getTodayDate();
}
