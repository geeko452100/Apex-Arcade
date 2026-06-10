import { api } from '@/lib/apiClient';
import { normalizeLoadedState } from '../gameLogic';

const GAME_TYPE = 'idle';

/**
 * Fetch the player's cloud save for Tycoon Terminal.
 */
export async function fetchCloudSave() {
  try {
    const { data } = await api.idle.fetchSave();

    if (!data?.saveData) return null;

    const normalized = normalizeLoadedState(data.saveData);
    if (!normalized) return null;

    return {
      ...normalized,
      lastSavedAt: normalized.lastSavedAt ?? new Date(data.updatedAt).getTime(),
    };
  } catch (error) {
    console.warn('[idle] Cloud load failed:', error.message);
    return null;
  }
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

  try {
    await api.idle.upsertSave(payload);
    return true;
  } catch (error) {
    console.warn('[idle] Cloud save failed:', error.message);
    return false;
  }
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
