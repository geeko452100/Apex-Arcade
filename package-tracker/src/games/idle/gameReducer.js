import { ANGEL_UPGRADE_BY_ID, BUSINESS_BY_ID } from './businesses';
import {
  calculateOfflineEarnings,
  getBulkCost,
  getCycleRevenue,
  getCycleTime,
  getManagerCost,
  normalizeLoadedState,
} from './gameLogic';
import { createInitialState, createPrestigeState } from './initialState';

function completeCycles(state, businessId, cycles) {
  const biz = state.businesses.find((b) => b.id === businessId);
  if (!biz || biz.owned <= 0 || cycles <= 0) return state;

  const revenue = getCycleRevenue(businessId, biz.owned, state) * cycles;

  return {
    ...state,
    cash: state.cash + revenue,
    totalEarned: state.totalEarned + revenue,
    businesses: state.businesses.map((b) =>
      b.id === businessId ? { ...b, cycleProgress: 0 } : b,
    ),
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE': {
      const normalized = normalizeLoadedState(action.payload);
      if (!normalized) return state;

      const fresh = createInitialState();
      return {
        ...fresh,
        ...normalized,
        businesses: normalized.businesses ?? fresh.businesses,
      };
    }

    case 'APPLY_OFFLINE': {
      const earnings = calculateOfflineEarnings(state, action.elapsedSeconds);
      if (earnings <= 0) return state;
      return {
        ...state,
        cash: state.cash + earnings,
        totalEarned: state.totalEarned + earnings,
      };
    }

    case 'TICK': {
      const delta = action.deltaSeconds;
      let next = state;

      for (const biz of state.businesses) {
        if (biz.owned <= 0) continue;

        const cycleTime = getCycleTime(biz.id, state);
        let progress = biz.cycleProgress + delta;

        if (biz.hasManager) {
          const completed = Math.floor(progress / cycleTime);
          if (completed > 0) {
            next = completeCycles(next, biz.id, completed);
            progress -= completed * cycleTime;
          }
        } else {
          progress = Math.min(progress, cycleTime);
        }

        next = {
          ...next,
          businesses: next.businesses.map((b) =>
            b.id === biz.id ? { ...b, cycleProgress: progress } : b,
          ),
        };
      }

      return next;
    }

    case 'RUN_BUSINESS': {
      const biz = state.businesses.find((b) => b.id === action.businessId);
      if (!biz || biz.owned <= 0 || biz.hasManager) return state;

      const cycleTime = getCycleTime(action.businessId, state);
      if (biz.cycleProgress < cycleTime) return state;

      return completeCycles(state, action.businessId, 1);
    }

    case 'BUY_BUSINESS': {
      const { businessId, count } = action;
      if (count <= 0) return state;

      const biz = state.businesses.find((b) => b.id === businessId);
      const cost = getBulkCost(businessId, biz.owned, count);
      if (state.cash < cost) return state;

      return {
        ...state,
        cash: state.cash - cost,
        businesses: state.businesses.map((b) =>
          b.id === businessId ? { ...b, owned: b.owned + count } : b,
        ),
      };
    }

    case 'HIRE_MANAGER': {
      const def = BUSINESS_BY_ID[action.businessId];
      const biz = state.businesses.find((b) => b.id === action.businessId);
      const managerCost = getManagerCost(def.managerCost, state.purchasedAngelUpgrades ?? []);
      if (!biz || biz.hasManager || biz.owned <= 0) return state;
      if (state.cash < managerCost) return state;

      return {
        ...state,
        cash: state.cash - managerCost,
        businesses: state.businesses.map((b) =>
          b.id === action.businessId ? { ...b, hasManager: true, cycleProgress: 0 } : b,
        ),
      };
    }

    case 'BUY_ANGEL_UPGRADE': {
      const upgrade = ANGEL_UPGRADE_BY_ID[action.upgradeId];
      if (!upgrade) return state;
      if (state.purchasedAngelUpgrades.includes(action.upgradeId)) return state;
      if ((state.angels ?? 0) < upgrade.angelCost) return state;
      if (upgrade.requires && !state.purchasedAngelUpgrades.includes(upgrade.requires)) return state;

      return {
        ...state,
        angels: state.angels - upgrade.angelCost,
        purchasedAngelUpgrades: [...state.purchasedAngelUpgrades, action.upgradeId],
      };
    }

    case 'BUY_UPGRADE': {
      const { upgradeId, cost } = action;
      if (state.purchasedUpgrades.includes(upgradeId)) return state;
      if (state.cash < cost) return state;

      return {
        ...state,
        cash: state.cash - cost,
        purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
      };
    }

    case 'BUY_SPEED_UPGRADE': {
      const { upgradeId, cost } = action;
      if (state.purchasedSpeedUpgrades.includes(upgradeId)) return state;
      if (state.cash < cost) return state;

      return {
        ...state,
        cash: state.cash - cost,
        purchasedSpeedUpgrades: [...state.purchasedSpeedUpgrades, upgradeId],
      };
    }

    case 'PRESTIGE':
      if (!action.angelsGained || action.angelsGained <= 0) return state;
      return createPrestigeState(state);

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
