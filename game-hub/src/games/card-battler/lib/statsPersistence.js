import { api } from '@/lib/apiClient';

/**
 * Record a win or loss for the authenticated user after a PvP match ends.
 */
export async function recordCardBattlerResult(didWin) {
  try {
    await api.stats.recordCardBattlerResult(didWin);
    return true;
  } catch (error) {
    console.warn('[card-battler] Stats update failed:', error.message);
    return false;
  }
}
