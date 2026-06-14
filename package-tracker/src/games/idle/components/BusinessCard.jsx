import { BUSINESS_BY_ID } from '../businesses';
import {
  formatMoney,
  getBulkCost,
  getCycleRevenue,
  getCycleTime,
  getManagerCost,
  getMaxAffordable,
  getUnitCost,
  isBusinessUnlocked,
} from '../gameLogic';

export default function BusinessCard({
  business,
  state,
  onBuy,
  onRun,
  onHireManager,
}) {
  const def = BUSINESS_BY_ID[business.id];
  const unlocked = isBusinessUnlocked(business.id, state.businesses);

  if (!unlocked) {
    return (
      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 opacity-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl grayscale">{def.icon}</span>
          <div>
            <h3 className="font-bold text-slate-500">{def.name}</h3>
            <p className="text-xs text-slate-600">
              Unlock at {def.unlockAt} Lemonade Stands
            </p>
          </div>
        </div>
      </div>
    );
  }

  const unitCost = getUnitCost(business.id, business.owned);
  const bulk10Cost = getBulkCost(business.id, business.owned, 10);
  const maxBuy = getMaxAffordable(business.id, business.owned, state.cash);
  const maxCost = maxBuy > 0 ? getBulkCost(business.id, business.owned, maxBuy) : 0;
  const cycleTime = getCycleTime(business.id, state);
  const cycleRevenue = getCycleRevenue(business.id, business.owned, state);
  const progress = business.hasManager
    ? 100
    : Math.min((business.cycleProgress / cycleTime) * 100, 100);
  const canRun = !business.hasManager && business.owned > 0 && business.cycleProgress >= cycleTime;
  const managerCost = getManagerCost(def.managerCost, state.purchasedAngelUpgrades ?? []);
  const canHire = business.owned > 0 && !business.hasManager && state.cash >= managerCost;

  return (
    <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/30 rounded-xl p-4 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{def.icon}</span>
          <div>
            <h3 className="font-bold text-white">{def.name}</h3>
            <p className="text-xs text-slate-500">
              Owned: <span className="text-amber-400 font-mono">{business.owned}</span>
              {business.hasManager && (
                <span className="ml-2 text-emerald-400">• Managed</span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Per cycle</p>
          <p className="text-sm font-bold text-emerald-400 tabular-nums">
            {formatMoney(cycleRevenue)}
          </p>
          <p className="text-[10px] text-slate-600 font-mono">{cycleTime.toFixed(1)}s cycle</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-100 ${
              business.hasManager ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!business.hasManager && business.owned > 0 && (
          <button
            type="button"
            onClick={() => onRun(business.id)}
            disabled={!canRun}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              canRun
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            Collect
          </button>
        )}

        <button
          type="button"
          onClick={() => onBuy(business.id, 1)}
          disabled={state.cash < unitCost}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buy 1 ({formatMoney(unitCost)})
        </button>

        <button
          type="button"
          onClick={() => onBuy(business.id, 10)}
          disabled={state.cash < bulk10Cost}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buy 10 ({formatMoney(bulk10Cost)})
        </button>

        {maxBuy > 0 && (
          <button
            type="button"
            onClick={() => onBuy(business.id, maxBuy)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300"
          >
            Buy Max ({maxBuy}) — {formatMoney(maxCost)}
          </button>
        )}

        {!business.hasManager && business.owned > 0 && (
          <button
            type="button"
            onClick={() => onHireManager(business.id)}
            disabled={!canHire}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ml-auto transition-all ${
              canHire
                ? 'bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            Hire Manager ({formatMoney(managerCost)})
          </button>
        )}
      </div>
    </div>
  );
}
