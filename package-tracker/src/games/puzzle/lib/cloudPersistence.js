import { supabase } from '@/games/card-battler/lib/supabaseClient';

/**
 * Upsert the player's result for a puzzle date.
 */
export async function submitPuzzleResult(userId, puzzleDate, guessesUsed) {
  const { error } = await supabase
    .from('puzzle_results')
    .upsert(
      {
        user_id: userId,
        puzzle_date: puzzleDate,
        guesses_used: guessesUsed,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,puzzle_date' },
    );

  if (error) {
    console.warn('[puzzle] Score submit failed:', error.message);
    return false;
  }

  return true;
}

/**
 * Fetch today's leaderboard entries with profile names.
 */
export async function fetchTodayLeaderboard(puzzleDate, limit = 100) {
  const { data, error } = await supabase
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
    console.warn('[puzzle] Leaderboard fetch failed:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch a single user's result for today (for rank calculation).
 */
export async function fetchUserResult(userId, puzzleDate) {
  const { data, error } = await supabase
    .from('puzzle_results')
    .select('user_id, guesses_used, completed_at')
    .eq('puzzle_date', puzzleDate)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[puzzle] User result fetch failed:', error.message);
    return null;
  }

  return data;
}

/**
 * Count how many players rank above the user for today's puzzle.
 */
export async function fetchUserRank(userId, puzzleDate) {
  const userResult = await fetchUserResult(userId, puzzleDate);
  if (!userResult) return null;

  const { count, error } = await supabase
    .from('puzzle_results')
    .select('*', { count: 'exact', head: true })
    .eq('puzzle_date', puzzleDate)
    .or(
      `guesses_used.lt.${userResult.guesses_used},and(guesses_used.eq.${userResult.guesses_used},completed_at.lt.${userResult.completed_at})`,
    );

  if (error) {
    console.warn('[puzzle] Rank fetch failed:', error.message);
    return null;
  }

  return {
    rank: (count ?? 0) + 1,
    guessesUsed: userResult.guesses_used,
    completedAt: userResult.completed_at,
  };
}
