import {
  formatMoney,
  formatNumber,
  getLifetimeEarnings,
  getSpeedMultiplier,
  getTotalProfitMultiplier,
} from '../gameLogic';
import { Coins, TrendingUp, Sparkles, Gauge, Cloud, CloudOff, History } from 'lucide-react';

const CLOUD_LABELS = {
  loading: 'Loading...',
  saving: 'Saving...',
  synced: 'Cloud synced',
  'local-only': 'Local only',
  new: 'New game',
  idle: 'Ready',
};

export default function CurrencyHeader({ state, cloudStatus }) {
  const profitMult = getTotalProfitMultiplier(state);
  const speedMult = getSpeedMultiplier(state);
  const lifetimeEarnings = getLifetimeEarnings(state);
  const isCloudOk = cloudStatus === 'synced' || cloudStatus === 'saving';

  return (
    <header className="bg-slate-950 border border-amber-500/20 rounded-xl p-5 shadow-lg shadow-amber-500/5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500/80 font-mono mb-1">
            Current Balance
          </p>
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-amber-400" />
            <span className="text-4xl font-black text-amber-300 tabular-nums">
              {formatMoney(state.cash)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-right">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-1 flex items-center justify-end gap-1">
              <TrendingUp className="w-3 h-3" />
              This Run
            </p>
            <span className="text-lg font-bold text-slate-300 tabular-nums">
              {formatMoney(state.totalEarned)}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-1 flex items-center justify-end gap-1">
              <History className="w-3 h-3" />
              Lifetime
            </p>
            <span className="text-lg font-bold text-slate-400 tabular-nums">
              {formatMoney(lifetimeEarnings)}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-violet-500/80 font-mono mb-1 flex items-center justify-end gap-1">
              <Sparkles className="w-3 h-3" />
              Profit ×{profitMult.toFixed(2)}
            </p>
            <span className="text-lg font-bold text-violet-300 tabular-nums">
              {formatNumber(state.angels ?? 0)} 👼
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-500/80 font-mono mb-1 flex items-center justify-end gap-1">
              <Gauge className="w-3 h-3" />
              Speed
            </p>
            <span className="text-lg font-bold text-cyan-300 tabular-nums">
              ×{speedMult.toFixed(1)}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-1 flex items-center justify-end gap-1">
              {isCloudOk ? <Cloud className="w-3 h-3 text-emerald-400" /> : <CloudOff className="w-3 h-3" />}
              Save
            </p>
            <span className={`text-xs font-semibold ${isCloudOk ? 'text-emerald-400' : 'text-slate-500'}`}>
              {CLOUD_LABELS[cloudStatus] ?? cloudStatus}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
