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
 * Writes game state with optimistic concurrency. On version conflict, returns
 * conflict: true so the caller can apply the authoritative server row.
 */
export async function updateGameStatus(gameId, nextState, expectedVersion) {
  const prevVersion = expectedVersion ?? Math.max(0, (nextState.stateVersion ?? 1) - 1);
  const payload = buildUpdatePayload(nextState);

  const versioned = await supabase
    .from('games')
    .update(payload)
    .eq('id', gameId)
    .eq('state_version', prevVersion)
    .select('status, state_version');

  if (!versioned.error && versioned.data?.length > 0) {
    return { ...versioned, conflict: false };
  }

  const fresh = await fetchGameRow(gameId);
  return {
    data: [],
    error: versioned.error ?? fresh.error ?? null,
    conflict: true,
    fresh: fresh.data ?? null,
  };
}
