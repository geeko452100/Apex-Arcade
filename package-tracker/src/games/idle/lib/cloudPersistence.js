import { supabase } from '@/games/card-battler/lib/supabaseClient';
import { getIdleLifetimeTotal } from '@/lib/leaderboard/cloudPersistence';
import { normalizeLoadedState } from '../gameLogic';

const GAME_TYPE = 'idle';

/**
 * Fetch the player's cloud save for Tycoon Terminal.
 */
export async function fetchCloudSave(userId) {
  const { data, error } = await supabase
    .from('idle_saves')
    .select('save_data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[idle] Cloud load failed:', error.message);
    return null;
  }

  if (!data?.save_data) return null;

  const normalized = normalizeLoadedState(data.save_data);
  if (!normalized) return null;

  return {
    ...normalized,
    lastSavedAt: normalized.lastSavedAt ?? new Date(data.updated_at).getTime(),
  };
}

/**
 * Upsert the player's cloud save.
 */
export async function upsertCloudSave(userId, state) {
  const payload = {
    ...state,
    lastSavedAt: Date.now(),
    gameType: GAME_TYPE,
  };

  const { error } = await supabase
    .from('idle_saves')
    .upsert(
      {
        user_id: userId,
        save_data: payload,
        lifetime_total: getIdleLifetimeTotal(payload),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.warn('[idle] Cloud save failed:', error.message);
    return false;
  }

  return true;
}

/**
 * Pick the newer of local and cloud saves.
 */
export function mergeSaves(localSave, cloudSave) {
  if (!localSave) return cloudSave;
  if (!cloudSave) return localSave;

  const localTime = localSave.lastSavedAt ?? 0;
  const cloudTime = cloudSave.lastSavedAt ?? 0;
  return cloudTime > localTime ? cloudSave : localSave;
}
