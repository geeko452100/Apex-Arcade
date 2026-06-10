import { api } from '@/lib/apiClient';

export const GAME_ROW_SELECT = 'status, player_1_id, player_2_id, state_version';

export function getRemoteVersion(row) {
  if (row?.state_version != null) return row.state_version;

  const status = row?.status;
  if (status && typeof status === 'object') {
    return status.stateVersion ?? 0;
  }
  return 0;
}

export async function fetchGameRow(gameId) {
  try {
    const { data } = await api.games.fetch(gameId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Writes game state. Tries a version-guarded update first; falls back to an
 * unguarded write when the column is out of sync so play isn't blocked.
 */
export async function updateGameStatus(gameId, nextState, expectedVersion) {
  try {
    const { data } = await api.games.update(gameId, nextState, expectedVersion);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
