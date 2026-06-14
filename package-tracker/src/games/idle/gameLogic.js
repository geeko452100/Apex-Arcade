import {
  ANGEL_PROFIT_BONUS,
  ANGEL_UPGRADES,
  BUSINESS_BY_ID,
  PRESTIGE_MIN_EARNINGS,
  SPEED_UPGRADES,
  UPGRADES,
} from './businesses';

const SAVE_KEY = 'apex-arcade-idle-save';

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/**
 * Format large numbers with compact suffixes (1.23M, 4.56B, etc.).
 */
export function formatMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return '$0';
  if (n < 0) return `-${formatMoney(-n)}`;

  const abs = Math.abs(n);
  const tier = Math.max(0, Math.min(Math.floor(Math.log10(abs) / 3), SUFFIXES.length - 1));

  if (tier === 0) {
    if (abs < 1) {
      return `$${abs < 0.01 ? abs.toFixed(4) : abs.toFixed(2)}`;
    }
    const rounded = abs < 10 ? abs.toFixed(2) : abs < 100 ? abs.toFixed(1) : Math.floor(abs).toString();
    return `$${rounded}`;
  }

  const scaled = abs / 10 ** (tier * 3);
  const formatted = scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2);
  return `$${formatted}${SUFFIXES[tier]}`;
}

export function formatNumber(value) {
  return formatMoney(value).replace('$', '');
}

/**
 * Angel investors earned from the current run's total earnings.
 */
export function calculateAngelsFromRun(totalEarned) {
  if (totalEarned < PRESTIGE_MIN_EARNINGS) return 0;
  return Math.floor(Math.sqrt(totalEarned / PRESTIGE_MIN_EARNINGS));
}

/**
 * Passive profit bonus from unspent angel investors.
 */
export function getUnspentAngelMultiplier(angels = 0) {
  return 1 + angels * ANGEL_PROFIT_BONUS;
}

/**
 * Permanent profit multiplier from purchased angel upgrades.
 */
export function getAngelUpgradeProfitMultiplier(purchasedAngelUpgrades = []) {
  return ANGEL_UPGRADES
    .filter((u) => purchasedAngelUpgrades.includes(u.id) && u.profitMultiplier)
    .reduce((acc, u) => acc * u.profitMultiplier, 1);
}

/**
 * Combined profit multiplier from angels and angel upgrades.
 */
export function getTotalProfitMultiplier(state) {
  return getUnspentAngelMultiplier(state.angels ?? 0)
    * getAngelUpgradeProfitMultiplier(state.purchasedAngelUpgrades ?? []);
}

/** @deprecated Use getTotalProfitMultiplier */
export function getAngelProfitMultiplier(angels = 0) {
  return getUnspentAngelMultiplier(angels);
}

/**
 * Starting cash from angel upgrades (used on new runs / prestige).
 */
export function getStartingCash(purchasedAngelUpgrades = []) {
  let cash = 10;
  for (const upgrade of ANGEL_UPGRADES) {
    if (purchasedAngelUpgrades.includes(upgrade.id) && upgrade.startingCash) {
      cash = Math.max(cash, upgrade.startingCash);
    }
  }
  return cash;
}

/**
 * Manager cost after angel discounts.
 */
export function getManagerCost(baseCost, purchasedAngelUpgrades = []) {
  const discount = ANGEL_UPGRADES
    .filter((u) => purchasedAngelUpgrades.includes(u.id))
    .reduce((acc, u) => acc + (u.managerDiscount ?? 0), 0);
  return baseCost * (1 - Math.min(discount, 0.75));
}

/**
 * Offline earnings bonus from angel upgrades.
 */
export function getOfflineBonus(purchasedAngelUpgrades = []) {
  return ANGEL_UPGRADES
    .filter((u) => purchasedAngelUpgrades.includes(u.id))
    .reduce((acc, u) => acc + (u.offlineBonus ?? 0), 0);
}

/**
 * Global speed multiplier from run upgrades and permanent angel upgrades.
 */
export function getSpeedMultiplier(stateOrSpeedUpgrades, purchasedAngelUpgrades = []) {
  const speedUpgrades = Array.isArray(stateOrSpeedUpgrades)
    ? stateOrSpeedUpgrades
    : stateOrSpeedUpgrades.purchasedSpeedUpgrades ?? [];
  const angelUpgrades = Array.isArray(stateOrSpeedUpgrades)
    ? purchasedAngelUpgrades
    : stateOrSpeedUpgrades.purchasedAngelUpgrades ?? [];

  const runSpeed = SPEED_UPGRADES
    .filter((u) => speedUpgrades.includes(u.id))
    .reduce((acc, u) => acc * u.speedMultiplier, 1);

  const angelSpeed = ANGEL_UPGRADES
    .filter((u) => angelUpgrades.includes(u.id) && u.speedBonus)
    .reduce((acc, u) => acc * (1 + u.speedBonus), 1);

  return runSpeed * angelSpeed;
}

/**
 * Cost to buy the next single unit of a business.
 */
export function getUnitCost(businessId, owned) {
  const def = BUSINESS_BY_ID[businessId];
  return def.baseCost * def.costMultiplier ** owned;
}

/**
 * Total cost to buy `count` units starting from `owned`.
 */
export function getBulkCost(businessId, owned, count) {
  let total = 0;
  for (let i = 0; i < count; i += 1) {
    total += getUnitCost(businessId, owned + i);
  }
  return total;
}

/**
 * Max affordable units given current cash.
 */
export function getMaxAffordable(businessId, owned, cash) {
  let count = 0;
  let spent = 0;

  while (true) {
    const next = getUnitCost(businessId, owned + count);
    if (spent + next > cash) break;
    spent += next;
    count += 1;
    if (count >= 1000) break;
  }

  return count;
}

/**
 * Revenue multiplier from purchased milestone upgrades.
 */
export function getBusinessMultiplier(businessId, purchasedUpgrades) {
  return UPGRADES
    .filter((u) => u.businessId === businessId && purchasedUpgrades.includes(u.id))
    .reduce((acc, u) => acc * u.multiplier, 1);
}

/**
 * Revenue earned when a business completes one production cycle.
 */
export function getCycleRevenue(businessId, owned, state) {
  if (owned <= 0) return 0;
  const def = BUSINESS_BY_ID[businessId];
  const upgradeMult = getBusinessMultiplier(businessId, state.purchasedUpgrades ?? []);
  const profitMult = getTotalProfitMultiplier(state);
  return def.baseRevenue * owned * upgradeMult * profitMult;
}

/**
 * Effective cycle duration in seconds after global speed upgrades.
 */
export function getCycleTime(businessId, state) {
  const base = BUSINESS_BY_ID[businessId].cycleTime;
  const speedMult = getSpeedMultiplier(state);
  return base / speedMult;
}

/**
 * Whether a business is unlocked based on total lemonade stand ownership.
 */
export function isBusinessUnlocked(businessId, businesses) {
  const def = BUSINESS_BY_ID[businessId];
  const lemonade = businesses.find((b) => b.id === 'lemonade');
  const lemonadeOwned = lemonade?.owned ?? 0;
  return lemonadeOwned >= def.unlockAt;
}

/**
 * Milestone upgrades available to purchase.
 */
export function getAvailableUpgrades(businesses, purchasedUpgrades) {
  return UPGRADES.filter((upgrade) => {
    const biz = businesses.find((b) => b.id === upgrade.businessId);
    return biz && biz.owned >= upgrade.atOwned && !purchasedUpgrades.includes(upgrade.id);
  });
}

/**
 * Speed upgrades available to purchase.
 */
export function getAvailableSpeedUpgrades(state) {
  const purchased = state.purchasedSpeedUpgrades ?? [];
  return SPEED_UPGRADES.filter((upgrade) => {
    if (purchased.includes(upgrade.id)) return false;
    if (state.totalEarned < upgrade.requiresTotalEarned) return false;
    if (upgrade.requires && !purchased.includes(upgrade.requires)) return false;
    return true;
  });
}

export function canPrestige(state) {
  return calculateAngelsFromRun(state.totalEarned) > 0;
}

/**
 * Total lifetime earnings including the current run.
 */
export function getLifetimeEarnings(state) {
  return (state.lifetimeEarnings ?? 0) + (state.totalEarned ?? 0);
}

/**
 * Earnings required to gain one more angel on the current run.
 */
export function getEarningsForNextAngel(totalEarned) {
  const current = calculateAngelsFromRun(totalEarned);
  return (current + 1) ** 2 * PRESTIGE_MIN_EARNINGS;
}

/**
 * Progress toward the next angel (0–1) on the current run.
 */
export function getProgressToNextAngel(totalEarned) {
  const current = calculateAngelsFromRun(totalEarned);
  const nextAt = getEarningsForNextAngel(totalEarned);
  const prevAt = current === 0 ? 0 : current ** 2 * PRESTIGE_MIN_EARNINGS;
  if (nextAt <= prevAt) return 0;
  return Math.min(1, Math.max(0, (totalEarned - prevAt) / (nextAt - prevAt)));
}

/**
 * Snapshot of what happens if the player prestiges right now.
 */
export function getPrestigePreview(state) {
  const angelsGained = calculateAngelsFromRun(state.totalEarned);
  const currentMult = getTotalProfitMultiplier(state);
  const afterPrestigeMult = getTotalProfitMultiplier({
    ...state,
    angels: (state.angels ?? 0) + angelsGained,
  });

  return {
    angelsGained,
    currentMult,
    afterPrestigeMult,
    nextAngelAt: getEarningsForNextAngel(state.totalEarned),
    progressToNextAngel: getProgressToNextAngel(state.totalEarned),
    canPrestige: angelsGained > 0,
    lifetimeEarnings: getLifetimeEarnings(state),
  };
}

/**
 * Angel upgrades available to purchase.
 */
export function getAvailableAngelUpgrades(state) {
  const purchased = state.purchasedAngelUpgrades ?? [];
  return ANGEL_UPGRADES.filter((upgrade) => {
    if (purchased.includes(upgrade.id)) return false;
    if (upgrade.requires && !purchased.includes(upgrade.requires)) return false;
    return true;
  });
}

export function normalizeLoadedState(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    cash: raw.cash ?? 10,
    totalEarned: raw.totalEarned ?? 0,
    lifetimeEarnings: raw.lifetimeEarnings ?? raw.totalEarned ?? 0,
    angels: raw.angels ?? 0,
    totalPrestiges: raw.totalPrestiges ?? 0,
    purchasedUpgrades: Array.isArray(raw.purchasedUpgrades) ? raw.purchasedUpgrades : [],
    purchasedSpeedUpgrades: Array.isArray(raw.purchasedSpeedUpgrades) ? raw.purchasedSpeedUpgrades : [],
    purchasedAngelUpgrades: Array.isArray(raw.purchasedAngelUpgrades) ? raw.purchasedAngelUpgrades : [],
    lastSavedAt: raw.lastSavedAt ?? Date.now(),
    businesses: Array.isArray(raw.businesses) ? raw.businesses : undefined,
  };
}

export function loadSave(userId) {
  try {
    const raw = localStorage.getItem(`${SAVE_KEY}-${userId}`);
    if (!raw) return null;
    return normalizeLoadedState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistSave(userId, state) {
  const payload = {
    ...state,
    lastSavedAt: Date.now(),
  };
  localStorage.setItem(`${SAVE_KEY}-${userId}`, JSON.stringify(payload));
  return payload;
}

/**
 * Simulate offline earnings for managed businesses.
 */
export function calculateOfflineEarnings(state, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;

  let earnings = 0;

  for (const biz of state.businesses) {
    if (!biz.hasManager || biz.owned <= 0) continue;

    const cycleTime = getCycleTime(biz.id, state);
    const cycles = Math.floor(elapsedSeconds / cycleTime);
    if (cycles <= 0) continue;

    earnings += getCycleRevenue(biz.id, biz.owned, state) * cycles;
  }

  const offlineBonus = getOfflineBonus(state.purchasedAngelUpgrades ?? []);
  return earnings * (1 + offlineBonus);
}
