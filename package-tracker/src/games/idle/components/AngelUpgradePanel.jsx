import { Sparkles } from 'lucide-react';
import { formatNumber, getAvailableAngelUpgrades } from '../gameLogic';

export default function AngelUpgradePanel({ state, onBuyAngelUpgrade }) {
  const available = getAvailableAngelUpgrades(state);
  const angels = state.angels ?? 0;

  return (
    <div className="bg-slate-950 border border-violet-500/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-violet-300 uppercase tracking-widest">
            Spend Angels
          </h2>
        </div>
        <span className="text-xs font-mono text-violet-400">{formatNumber(angels)} available</span>
      </div>

      {available.length === 0 ? (
        <p className="text-xs text-slate-600">
          All permanent angel upgrades purchased. Prestige to earn more angels.
        </p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {available.map((upgrade) => {
            const canAfford = angels >= upgrade.angelCost;
            return (
              <button
                key={upgrade.id}
                type="button"
                onClick={() => onBuyAngelUpgrade(upgrade.id)}
                disabled={!canAfford}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  canAfford
                    ? 'border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20'
                    : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{upgrade.name}</p>
                  <p className="text-xs text-slate-500">{upgrade.description}</p>
                </div>
                <span className="text-sm font-bold text-violet-300 tabular-nums shrink-0 ml-2">
                  {formatNumber(upgrade.angelCost)} 👼
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
