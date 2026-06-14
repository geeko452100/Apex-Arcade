import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function GameOverModel({ gameOver, currentUserId, onReset }) {
  if (!gameOver) return null;

  const isVictory = String(gameOver.winnerId) === String(currentUserId);

  const title = isVictory ? 'Victory' : 'Defeat';
  const titleClass = isVictory ? 'text-emerald-300' : 'text-rose-500';

  const message = isVictory
    ? 'You defeated the enemy and won the duel.'
    : 'Your core was destroyed. Reset and try again.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <h2 className={`text-3xl font-black mb-3 ${titleClass}`}>
          {title}
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          {message}
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
        >
          Restart Duel
        </button>
        <Link
          to="/leaderboard?game=cards"
          className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
