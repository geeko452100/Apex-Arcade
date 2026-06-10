import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { api } from '@/lib/apiClient';

const POLL_INTERVAL_MS = 1500;

/**
 * Lobby UI that handles matchmaking queue, countdown, and game launch.
 *
 * @param {{ userId: string|number, onGameStart: (gameId: string) => void }} props
 */
export default function MatchmakingHub({ onGameStart }) {
  const [queueStatus, setQueueStatus]     = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Ready to find a match');
  const [countdown, setCountdown]         = useState(null);

  const timerRef      = useRef(null);
  const pollRef       = useRef(null);
  const isLaunching   = useRef(false);
  const searchSinceRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  const initiateGameLaunch = useCallback((gameId) => {
    if (isLaunching.current) return;
    isLaunching.current = true;

    clearInterval(pollRef.current);
    pollRef.current = null;

    setQueueStatus('countdown');
    setStatusMessage('Match Found! Starting in...');

    let seconds = 3;
    setCountdown(seconds);

    timerRef.current = setInterval(() => {
      seconds -= 1;

      if (seconds > 0) {
        setCountdown(seconds);
      } else {
        setCountdown(0);
        clearInterval(timerRef.current);
        setQueueStatus('matched');
        onGameStart(gameId);
      }
    }, 1000);
  }, [onGameStart]);

  const startPolling = useCallback(() => {
    clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const { status, gameId } = await api.matchmaking.status(searchSinceRef.current);
        if (status === 'matched' && gameId) {
          initiateGameLaunch(gameId);
        }
      } catch (err) {
        console.error('Matchmaking poll error:', err);
      }
    }, POLL_INTERVAL_MS);
  }, [initiateGameLaunch]);

  const startMatchmaking = async () => {
    setQueueStatus('searching');
    setStatusMessage('Searching for an opponent...');
    setCountdown(null);
    isLaunching.current = false;
    searchSinceRef.current = new Date().toISOString();

    try {
      startPolling();

      const { status, gameId } = await api.matchmaking.join('card-battler');

      if (status === 'matched' && gameId) {
        initiateGameLaunch(gameId);
        return;
      }

      setStatusMessage('Waiting for an opponent...');
    } catch (err) {
      console.error('Matchmaking error:', err);

      clearInterval(pollRef.current);
      pollRef.current = null;

      setQueueStatus('idle');
      setStatusMessage(`Connection failed: ${err.message ?? 'Check connection settings'}`);
    }
  };

  const cancelMatchmaking = async () => {
    clearInterval(pollRef.current);
    pollRef.current = null;

    setQueueStatus('idle');
    setStatusMessage('Cancelled search.');

    try {
      await api.matchmaking.cancel();
    } catch (err) {
      console.error('Cancel matchmaking error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-md mx-auto">
      <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2 tracking-wide uppercase">
        Card Battler Arena
      </h2>
      <p className="text-slate-400 text-sm mb-8 text-center px-4">
        Deploy your units, stage your combinations, and challenge opponents in live PvP card combat.
      </p>

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
