import { useEffect, useRef } from 'react';
import { fetchGameRow, getRemoteVersion } from '@/games/card-battler/lib/gamePersistence';
import { normalizeGameState, isGameInitialized } from '@/games/card-battler/gameRules';

const POLL_INTERVAL_MS = 1000;

/**
 * Polls the API for game state updates and dispatches SYNC_FROM_SERVER when a
 * newer authoritative snapshot arrives.
 *
 * @param {string|number|null} gameId
 * @param {Function} localDispatch
 * @param {React.MutableRefObject<number>} versionRef - tracks latest applied state version
 * @param {(initialized: boolean) => void} [onRemoteUpdate] - optional side-effect when state arrives
 */
export function useGameSync(gameId, localDispatch, versionRef, onRemoteUpdate) {
  const dispatchRef = useRef(localDispatch);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);

  useEffect(() => { dispatchRef.current = localDispatch; }, [localDispatch]);
  useEffect(() => { onRemoteUpdateRef.current = onRemoteUpdate; }, [onRemoteUpdate]);

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;

    const poll = async () => {
      const { data, error } = await fetchGameRow(gameId);
      if (cancelled || error || !data) return;

      const incoming = normalizeGameState(data.status);
      if (!incoming || typeof incoming !== 'object') return;

      const incomingVersion = incoming.stateVersion ?? getRemoteVersion(data);

      if (incomingVersion <= (versionRef.current ?? 0)) return;

      versionRef.current = incomingVersion;
      dispatchRef.current({ type: 'SYNC_FROM_SERVER', payload: incoming });
      onRemoteUpdateRef.current?.(isGameInitialized(incoming));
    };

    poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [gameId, versionRef]);
}
