import { MAX_GUESSES } from '../initialState';

export default function PuzzleStats({ state, scoreStatus }) {
  const { stats, gameStatus, guesses, puzzleDate } = state;
  const guessesUsed = guesses.length;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-cyan-400 font-mono mb-1">
          Daily Stats
        </p>
        <p className="text-sm text-slate-400">{puzzleDate}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <p className="text-2xl font-black text-white">{stats.gamesPlayed}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Played</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <p className="text-2xl font-black text-white">{stats.currentStreak}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Streak</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <p className="text-2xl font-black text-white">{stats.maxStreak}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Max Streak</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <p className="text-2xl font-black text-white">
            {stats.gamesPlayed > 0
              ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
              : 0}
            %
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Win Rate</p>
        </div>
      </div>

      {gameStatus === 'won' && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-center">
          <p className="text-emerald-400 font-bold">You solved it in {guessesUsed} guesses!</p>
          {scoreStatus === 'submitting' && (
            <p className="text-xs text-slate-400 mt-1">Submitting score...</p>
          )}
          {scoreStatus === 'submitted' && (
            <p className="text-xs text-emerald-300 mt-1">Score recorded on leaderboard</p>
          )}
          {scoreStatus === 'failed' && (
            <p className="text-xs text-amber-400 mt-1">Could not sync score to cloud</p>
          )}
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-center">
          <p className="text-red-400 font-bold">
            Out of guesses ({MAX_GUESSES}/{MAX_GUESSES})
          </p>
          <p className="text-xs text-slate-400 mt-1">
            The word was <span className="text-white font-mono">{state.targetWord}</span>
          </p>
        </div>
      )}
    </div>
  );
}
