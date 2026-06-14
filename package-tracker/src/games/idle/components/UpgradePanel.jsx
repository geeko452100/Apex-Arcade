import { BUSINESS_BY_ID } from '../businesses';
import { formatMoney, getAvailableUpgrades } from '../gameLogic';

export default function UpgradePanel({ state, onBuyUpgrade }) {
  const available = getAvailableUpgrades(state.businesses, state.purchasedUpgrades);

  if (available.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
          Milestone Upgrades
        </h2>
        <p className="text-xs text-slate-600">
          Hit ownership milestones to unlock revenue multipliers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
        Milestone Upgrades
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {available.map((upgrade) => {
          const canAfford = state.cash >= upgrade.cost;
          const bizName = BUSINESS_BY_ID[upgrade.businessId]?.name ?? upgrade.businessId;
          return (
            <button
              key={upgrade.id}
              type="button"
              onClick={() => onBuyUpgrade(upgrade.id, upgrade.cost)}
              disabled={!canAfford}
              className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                canAfford
                  ? 'border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20'
                  : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-white">{upgrade.name}</p>
                <p className="text-xs text-slate-500">
                  {bizName} ×{upgrade.multiplier} revenue
                </p>
              </div>
              <span className="text-sm font-bold text-indigo-300 tabular-nums">
                {formatMoney(upgrade.cost)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
