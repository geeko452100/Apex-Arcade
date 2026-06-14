import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ANGEL_PROFIT_BONUS, PRESTIGE_MIN_EARNINGS } from '../businesses';
import {
  formatMoney,
  formatNumber,
  getLifetimeEarnings,
  getPrestigePreview,
} from '../gameLogic';
import PrestigePreviewTooltip from './PrestigePreviewTooltip';

export default function PrestigePanel({ state, onPrestige }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const preview = getPrestigePreview(state);
  const { angelsGained, canPrestige, currentMult, afterPrestigeMult } = preview;
  const lifetimeEarnings = getLifetimeEarnings(state);

  return (
    <>
      <div className="bg-slate-950 border border-violet-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-violet-300 uppercase tracking-widest">
              Angel Investors
            </h2>
          </div>
          <PrestigePreviewTooltip state={state} />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Angels owned</span>
            <span className="font-bold text-violet-300 tabular-nums">
              {formatNumber(state.angels ?? 0)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Profit bonus</span>
            <span className="font-bold text-emerald-400">
              ×{currentMult.toFixed(2)} (+{((state.angels ?? 0) * ANGEL_PROFIT_BONUS * 100).toFixed(0)}% passive)
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Lifetime earnings</span>
            <span className="font-bold text-slate-300 tabular-nums">
              {formatMoney(lifetimeEarnings)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total prestiges</span>
            <span className="font-mono text-slate-400">{state.totalPrestiges ?? 0}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Progress to next angel</span>
            <span>{formatMoney(preview.nextAngelAt)}</span>
          </div>
          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-violet-500 transition-all"
              style={{ width: `${preview.progressToNextAngel * 100}%` }}
            />
          </div>
        </div>

        {canPrestige ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="w-full py-2.5 rounded-lg text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 transition-all"
          >
            Prestige (+{formatNumber(angelsGained)} angels)
          </button>
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed">
            Earn at least {formatMoney(PRESTIGE_MIN_EARNINGS)} this run to attract angel investors.
            Current run: {formatMoney(state.totalEarned)}.
          </p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-violet-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Prestige</h3>
            <p className="text-sm text-slate-400 mb-4">
              Reset all businesses and run upgrades, but gain{' '}
              <span className="text-violet-300 font-bold">{formatNumber(angelsGained)} angels</span>.
              Your profit multiplier rises from ×{currentMult.toFixed(2)} to ×{afterPrestigeMult.toFixed(2)}.
              Angel upgrades are kept.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onPrestige();
                  setShowConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white"
              >
                Prestige
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
