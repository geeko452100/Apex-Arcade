export default function BattleActionBar({
  combatPhase,
  gameFinished,
  isPlayerTurn,
  actionReady,
  phaseButtonLabel,
  actionLabel,
  phaseHint,
  actionHint,
  handleSkipPhase,
  handleExecuteAction,
}) {
  const phaseDisabled = gameFinished || !isPlayerTurn;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex-1 space-y-1.5">
          <button
            onClick={handleSkipPhase}
            disabled={phaseDisabled}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${combatPhase === 'attack-phase' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-500 hover:bg-orange-400'} ${phaseDisabled ? 'opacity-50 cursor-not-allowed' : 'text-slate-950'}`}
          >
            {phaseButtonLabel}
          </button>
          {phaseHint && (
            <p className="text-[11px] text-slate-500 text-center px-1">{phaseHint}</p>
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <button
            onClick={handleExecuteAction}
            disabled={gameFinished || !actionReady}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${!gameFinished && actionReady ? (actionLabel.toLowerCase().includes('attack') ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white') : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'}`}
          >
            {actionLabel}
          </button>
          {actionHint && (
            <p className="text-[11px] text-slate-500 text-center px-1">{actionHint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
