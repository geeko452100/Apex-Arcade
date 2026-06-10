import { api } from '@/lib/apiClient';

/**
 * Upsert the player's result for a puzzle date.
 */
export async function submitPuzzleResult(userId, puzzleDate, guessesUsed) {
  try {
    await api.puzzle.submitResult(puzzleDate, guessesUsed);
    return true;
  } catch (error) {
    console.warn('[puzzle] Score submit failed:', error.message);
    return false;
  }
}

/**
 * Fetch today's leaderboard entries with profile names.
 */
export async function fetchTodayLeaderboard(puzzleDate, limit = 100) {
  try {
    const { data } = await api.puzzle.fetchLeaderboard(puzzleDate, limit);
    return data ?? [];
  } catch (error) {
    console.warn('[puzzle] Leaderboard fetch failed:', error.message);
    return [];
  }
}

/**
 * Fetch a single user's result for today (for rank calculation).
 */
export async function fetchUserResult(userId, puzzleDate) {
  try {
    const { data } = await api.puzzle.fetchUserResult(puzzleDate);
    return data ?? null;
  } catch (error) {
    console.warn('[puzzle] User result fetch failed:', error.message);
    return null;
  }
}

/**
 * Count how many players rank above the user for today's puzzle.
 */
export async function fetchUserRank(userId, puzzleDate) {
  try {
    const { data } = await api.puzzle.fetchUserRank(puzzleDate);
    return data ?? null;
  } catch (error) {
    console.warn('[puzzle] Rank fetch failed:', error.message);
    return null;
  }
}
