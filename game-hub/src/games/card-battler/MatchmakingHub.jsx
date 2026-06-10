import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';

/**
 * Lobby UI that handles matchmaking queue, countdown, and game launch.
 *
 * @param {{ userId: string|number, onGameStart: (gameId: string) => void }} props
 */
export default function MatchmakingHub({ userId, onGameStart }) {
  const [queueStatus, setQueueStatus]     = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Ready to find a match');
  const [countdown, setCountdown]         = useState(null);

  const channelRef    = useRef(null);
  const timerRef      = useRef(null);
  const isLaunching   = useRef(false);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // Keep queue entry alive while searching (server prunes stale last_ping rows)
  useEffect(() => {
    if (queueStatus !== 'searching') return undefined;

    const pingQueue = () => {
      supabase
        .from('matchmaking_queue')
        .update({ last_ping: new Date().toISOString() })
        .eq('player_id', userId)
        .then(({ error }) => {
          if (error) console.warn('Queue heartbeat failed:', error.message);
        });
    };

    pingQueue();
    const heartbeat = setInterval(pingQueue, 10_000);
    return () => clearInterval(heartbeat);
  }, [queueStatus, userId]);

  // ── Game launch sequence ──────────────────────────────────────────────────
  const initiateGameLaunch = useCallback((gameId) => {
    if (isLaunching.current) return;
    isLaunching.current = true;

    // Drop the subscription immediately so duplicate INSERT events are ignored.
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setQueueStatus('countdown');
    setStatusMessage('Match Found! Starting in...');

    let seconds = 3;
    setCountdown(seconds);

    timerRef.current = setInterval(() => {
      seconds -= 1;

      if (seconds > 0) {
        setCountdown(seconds);
      } else {
        // BUG FIX: Show 0 briefly before clearing so the counter doesn't jump
        // from 1 to blank. The original skipped the 0 frame entirely.
        setCountdown(0);
        clearInterval(timerRef.current);
        setQueueStatus('matched');
        onGameStart(gameId);
      }
    }, 1000);
  }, [onGameStart]);

  // ── Realtime subscription ─────────────────────────────────────────────────
  const handleMatchInsert = useCallback((payload) => {
    const game = payload.new;
    if (
      String(game.player_1_id) === String(userId) ||
      String(game.player_2_id) === String(userId)
    ) {
      initiateGameLaunch(game.id);
    }
  }, [userId, initiateGameLaunch]);

  const setupMatchSubscription = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase
      .channel(`match-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'games', filter: `player_1_id=eq.${userId}` },
        handleMatchInsert
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'games', filter: `player_2_id=eq.${userId}` },
        handleMatchInsert
      )
      .subscribe();
  }, [userId, handleMatchInsert]);

  // ── Start matchmaking ─────────────────────────────────────────────────────
  const startMatchmaking = async () => {
    setQueueStatus('searching');
    setStatusMessage('Searching for an opponent...');
    setCountdown(null);
    isLaunching.current = false;

    try {
      // Subscribe before the RPC call so we don't miss an INSERT that fires
      // during or immediately after the RPC response.
      setupMatchSubscription();

      const { data, error } = await supabase.rpc('find_or_create_match', {
        p_game_type: 'card-battler',
      });

      if (error) throw error;

      const match = Array.isArray(data) ? data[0] : data;

      if (match?.status === 'matched' && match.game_id) {
        initiateGameLaunch(match.game_id);
        return;
      }

      setStatusMessage('Waiting for an opponent...');
    } catch (err) {
      console.error('Matchmaking error:', err);

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setQueueStatus('idle');
      setStatusMessage(`Connection failed: ${err.message ?? 'Check connection settings'}`);
    }
  };

  // ── Cancel matchmaking ────────────────────────────────────────────────────
  const cancelMatchmaking = async () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setQueueStatus('idle');
    setStatusMessage('Cancelled search.');

    await supabase
      .from('matchmaking_queue')
      .delete()
      .eq('player_id', userId);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-md mx-auto">
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2 tracking-wide uppercase">
        Card Battler Arena
      </h2>
      <p className="text-slate-400 text-sm mb-8 text-center px-4">
        Deploy your units, stage your combinations, and challenge opponents in live PvP card combat.
      </p>

      {/* Status panel */}
      <div className="w-full bg-slate-950 p-6 rounded-lg border border-slate-800 text-center mb-6 min-h-[140px] flex flex-col justify-center items-center">
        {queueStatus === 'searching' && (
          <div className="flex space-x-2 mb-3">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" />
          </div>
        )}

        <span
          className={`font-semibold tracking-wide text-base ${
            queueStatus === 'searching'
              ? 'text-amber-400'
              : queueStatus === 'countdown'
              ? 'text-orange-400 font-bold'
              : 'text-slate-200'
          }`}
        >
          {statusMessage}
        </span>

        {queueStatus === 'countdown' && countdown !== null && (
          <div className="text-5xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-500 animate-ping [animation-duration:1s]">
            {countdown}
          </div>
        )}
      </div>

      {/* Action button */}
      {queueStatus === 'idle' ? (
        <button
          onClick={startMatchmaking}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-lg rounded-lg active:scale-[0.98] transition-all uppercase tracking-wider shadow-lg shadow-orange-950/40"
        >
          Find PvP Match
        </button>
      ) : (
        <button
          onClick={cancelMatchmaking}
          disabled={queueStatus === 'matched' || queueStatus === 'countdown'}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 font-bold rounded-lg border border-slate-700 disabled:opacity-50 transition-colors uppercase tracking-wider text-sm"
        >
          {queueStatus === 'countdown' ? 'Locking In...' : 'Cancel Search'}
        </button>
      )}

      <Link
        to="/leaderboard?game=cards"
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <Trophy className="w-4 h-4" />
        View Leaderboard
      </Link>
    </div>
  );
}
