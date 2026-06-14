export default function OpponentDisconnectOverlay({ secondsRemaining, onReturnNow }) {
  if (secondsRemaining === null) return null;

  const message = secondsRemaining > 0
    ? `Your opponent disconnected. Returning to lobby in ${secondsRemaining}…`
    : 'Returning to lobby…';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <h2 className="text-2xl font-black mb-3 text-amber-400">
          Opponent Disconnected
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          {message}
        </p>
        {secondsRemaining > 0 && (
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-500">
            {secondsRemaining}
          </div>
        )}
        {secondsRemaining > 0 && (
          <button
            type="button"
            onClick={onReturnNow}
            className="mt-6 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
          >
            Return to lobby now
          </button>
        )}
      </div>
    </div>
  );
}
