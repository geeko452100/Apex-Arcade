import { BUSINESSES } from './businesses';
import { calculateAngelsFromRun, getStartingCash } from './gameLogic';

export function createInitialState(overrides) {
  const opts = overrides ?? {};
  const purchasedAngelUpgrades = opts.purchasedAngelUpgrades ?? [];

  return {
    cash: opts.cash ?? getStartingCash(purchasedAngelUpgrades),
    totalEarned: 0,
    lifetimeEarnings: 0,
    angels: 0,
    totalPrestiges: 0,
    purchasedUpgrades: [],
    purchasedSpeedUpgrades: [],
    purchasedAngelUpgrades,
    lastSavedAt: Date.now(),
    businesses: BUSINESSES.map((def) => ({
      id: def.id,
      owned: def.id === 'lemonade' ? 1 : 0,
      hasManager: false,
      cycleProgress: 0,
    })),
    ...opts,
  };
}

export function createPrestigeState(previousState) {
  const angelsGained = calculateAngelsFromRun(previousState.totalEarned);
  const purchasedAngelUpgrades = previousState.purchasedAngelUpgrades ?? [];

  return createInitialState({
    angels: (previousState.angels ?? 0) + angelsGained,
    purchasedAngelUpgrades,
    cash: getStartingCash(purchasedAngelUpgrades),
    lifetimeEarnings: (previousState.lifetimeEarnings ?? 0) + previousState.totalEarned,
    totalPrestiges: (previousState.totalPrestiges ?? 0) + 1,
    lastSavedAt: Date.now(),
  });
}
