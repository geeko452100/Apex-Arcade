import { supabase } from './supabaseClient';

export const GAME_ROW_SELECT = 'status, player_1_id, player_2_id, state_version';

export function getRemoteVersion(row) {
  if (row?.state_version != null) return row.state_version;

  const status = row?.status;
  if (status && typeof status === 'object') {
    return status.stateVersion ?? 0;
  }
  return 0;
}

export function fetchGameRow(gameId) {
  return supabase
    .from('games')
    .select(GAME_ROW_SELECT)
    .eq('id', gameId)
    .single();
}

function buildUpdatePayload(nextState) {
  return {
    status:        nextState,
    state_version: nextState.stateVersion ?? 0,
    turn_owner:    nextState.turnOwner ?? null,
  };
}

/**
 * Writes game state. Tries a version-guarded update first; falls back to an
 * unguarded write when the column is out of sync so play isn't blocked.
 */
export async function updateGameStatus(gameId, nextState, expectedVersion) {
  const prevVersion = expectedVersion ?? Math.max(0, (nextState.stateVersion ?? 1) - 1);
  const payload = buildUpdatePayload(nextState);

  const versioned = await supabase
    .from('games')
    .update(payload)
    .eq('id', gameId)
    .eq('state_version', prevVersion)
    .select('status');

  if (!versioned.error && versioned.data?.length > 0) {
    return versioned;
  }

  return supabase
    .from('games')
    .update(payload)
    .eq('id', gameId)
    .select('status');
}
