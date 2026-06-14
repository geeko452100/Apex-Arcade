import { Gauge } from 'lucide-react';
import { formatMoney, getAvailableSpeedUpgrades, getSpeedMultiplier } from '../gameLogic';

export default function SpeedUpgradePanel({ state, onBuySpeedUpgrade }) {
  const available = getAvailableSpeedUpgrades(state);
  const currentSpeed = getSpeedMultiplier(state);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Speed Upgrades
          </h2>
        </div>
        <span className="text-xs font-mono text-cyan-400">×{currentSpeed} speed</span>
      </div>

      {available.length === 0 ? (
        <p className="text-xs text-slate-600">
          Earn more this run to unlock global production speed boosts. Resets on prestige.
        </p>
      ) : (
        <div className="space-y-2">
          {available.map((upgrade) => {
            const canAfford = state.cash >= upgrade.cost;
            return (
              <button
                key={upgrade.id}
                type="button"
                onClick={() => onBuySpeedUpgrade(upgrade.id, upgrade.cost)}
                disabled={!canAfford}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  canAfford
                    ? 'border-cyan-500/30 bg-cyan-600/10 hover:bg-cyan-600/20'
                    : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{upgrade.name}</p>
                  <p className="text-xs text-slate-500">{upgrade.description}</p>
                </div>
                <span className="text-sm font-bold text-cyan-300 tabular-nums">
                  {formatMoney(upgrade.cost)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
