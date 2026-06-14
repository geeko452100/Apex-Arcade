import { Info } from 'lucide-react';
import { PRESTIGE_MIN_EARNINGS } from '../businesses';
import { formatMoney, formatNumber, getPrestigePreview } from '../gameLogic';

export default function PrestigePreviewTooltip({ state }) {
  const preview = getPrestigePreview(state);

  return (
    <div className="relative group">
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-300 transition-colors"
        aria-label="Prestige preview"
      >
        <Info className="w-3.5 h-3.5" />
        Preview
      </button>

      <div className="absolute left-0 top-full mt-2 z-20 w-64 p-3 rounded-lg border border-violet-500/30 bg-slate-900 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all pointer-events-none">
        <p className="text-[10px] uppercase tracking-widest text-violet-400 font-mono mb-2">
          Prestige Preview
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Angels on reset</span>
            <span className="font-bold text-violet-300">+{formatNumber(preview.angelsGained)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Profit multiplier</span>
            <span className="text-emerald-400">
              ×{preview.currentMult.toFixed(2)} → ×{preview.afterPrestigeMult.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Lifetime earnings</span>
            <span className="text-slate-300">{formatMoney(preview.lifetimeEarnings)}</span>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Next angel at</span>
              <span className="text-slate-300">{formatMoney(preview.nextAngelAt)}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${preview.progressToNextAngel * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1">
              {preview.canPrestige
                ? 'Ready to prestige now.'
                : `Need ${formatMoney(PRESTIGE_MIN_EARNINGS)} this run to prestige.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
