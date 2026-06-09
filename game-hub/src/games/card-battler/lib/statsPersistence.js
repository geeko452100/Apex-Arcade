import { supabase } from './supabaseClient';

/**
 * Record a win or loss for the authenticated user after a PvP match ends.
 */
export async function recordCardBattlerResult(didWin) {
  const { error } = await supabase.rpc('record_card_battler_result', {
    p_won: didWin,
  });

  if (error) {
    console.warn('[card-battler] Stats update failed:', error.message);
    return false;
  }

  return true;
}
