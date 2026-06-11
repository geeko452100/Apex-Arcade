import { supabase } from './client';

export async function fetchDailyPuzzleWord(puzzleDate) {
  const { data, error } = await supabase.rpc('get_daily_puzzle_word', {
    p_puzzle_date: puzzleDate,
  });

  if (error) {
    console.warn('[puzzle] daily word fetch failed:', error.message);
    return null;
  }

  return typeof data === 'string' ? data.toUpperCase() : null;
}
