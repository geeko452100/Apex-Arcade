import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';

const OPPONENT_DISCONNECT_GRACE_MS = 8_000;
export const LOBBY_RETURN_COUNTDOWN_SEC = 10;

function isOpponentPresent(presenceState, opponentId) {
  if (!opponentId) return false;

  return Object.values(presenceState).some((presences) =>
    presences.some((p) => String(p.user_id) === String(opponentId))
  );
}

/**
 * Tracks opponent presence on a game channel and surfaces a lobby-return countdown
 * when they disconnect mid-match.
 */
export function useOpponentPresence({
  gameId,
  currentUserId,
  opponentId,
  gameActive,
  gameOver,
  onReturnToLobby,
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(null);

  const opponentSeenRef = useRef(false);
  const countdownActiveRef = useRef(false);
  const graceTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const channelRef = useRef(null);
  const gameStartRef = useRef(Date.now());

  const gameActiveRef = useRef(gameActive);
  const gameOverRef = useRef(gameOver);
  const opponentIdRef = useRef(opponentId);
  const onReturnRef = useRef(onReturnToLobby);

  useEffect(() => { gameActiveRef.current = gameActive; }, [gameActive]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { opponentIdRef.current = opponentId; }, [opponentId]);
  useEffect(() => { onReturnRef.current = onReturnToLobby; }, [onReturnToLobby]);

  const clearCountdownTimer = useCallback(() => {
    clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = null;
    countdownActiveRef.current = false;
  }, []);

  const clearGraceTimer = useCallback(() => {
    clearTimeout(graceTimerRef.current);
    graceTimerRef.current = null;
  }, []);

  const cancelDisconnect = useCallback(() => {
    clearCountdownTimer();
    setSecondsRemaining(null);
  }, [clearCountdownTimer]);

  const beginLobbyReturn = useCallback(() => {
    if (countdownActiveRef.current || gameOverRef.current) return;

    countdownActiveRef.current = true;
    let seconds = LOBBY_RETURN_COUNTDOWN_SEC;
    setSecondsRemaining(seconds);

    countdownTimerRef.current = setInterval(() => {
      seconds -= 1;

      if (seconds <= 0) {
        setSecondsRemaining(0);
        clearCountdownTimer();
        onReturnRef.current?.();
        return;
      }

      setSecondsRemaining(seconds);
    }, 1000);
  }, [clearCountdownTimer]);

  const evaluatePresence = useCallback((presenceState) => {
    if (!gameActiveRef.current || gameOverRef.current || !opponentIdRef.current) return;

    const present = isOpponentPresent(presenceState, opponentIdRef.current);

    if (present) {
      opponentSeenRef.current = true;
      clearGraceTimer();
      cancelDisconnect();
      return;
    }

    if (opponentSeenRef.current) {
      beginLobbyReturn();
      return;
    }

    if (!graceTimerRef.current) {
      const elapsed = Date.now() - gameStartRef.current;
      const delay = Math.max(0, OPPONENT_DISCONNECT_GRACE_MS - elapsed);

      graceTimerRef.current = setTimeout(() => {
        graceTimerRef.current = null;
        if (!opponentSeenRef.current && gameActiveRef.current && !gameOverRef.current) {
          beginLobbyReturn();
        }
      }, delay);
    }
  }, [beginLobbyReturn, cancelDisconnect, clearGraceTimer]);

  useEffect(() => {
    if (!gameId || !currentUserId || !gameActive || gameOver) return;

    gameStartRef.current = Date.now();
    opponentSeenRef.current = false;
    cancelDisconnect();
    clearGraceTimer();

    const channel = supabase.channel(`presence:game:${gameId}`, {
      config: { presence: { key: String(currentUserId) } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        evaluatePresence(channel.presenceState());
      })
      .on('presence', { event: 'join' }, () => {
        evaluatePresence(channel.presenceState());
      })
      .on('presence', { event: 'leave' }, () => {
        evaluatePresence(channel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
          evaluatePresence(channel.presenceState());
        }
      });

    channelRef.current = channel;

    return () => {
      clearGraceTimer();
      clearCountdownTimer();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    gameId,
    currentUserId,
    gameActive,
    gameOver,
    evaluatePresence,
    cancelDisconnect,
    clearGraceTimer,
    clearCountdownTimer,
  ]);

  useEffect(() => {
    if (gameOver) {
      clearGraceTimer();
      cancelDisconnect();
    }
  }, [gameOver, clearGraceTimer, cancelDisconnect]);

  return { secondsRemaining, isOpponentDisconnecting: secondsRemaining !== null };
}
