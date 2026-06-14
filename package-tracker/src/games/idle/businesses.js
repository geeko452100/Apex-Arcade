/**
 * Business definitions inspired by classic idle tycoon games.
 * Each business produces revenue on a cycle; managers automate collection.
 */

export const BUSINESSES = [
  {
    id: 'lemonade',
    name: 'Lemonade Stand',
    icon: '🍋',
    baseCost: 4,
    costMultiplier: 1.15,
    baseRevenue: 1,
    cycleTime: 1,
    managerCost: 1000,
    unlockAt: 0,
  },
  {
    id: 'newspaper',
    name: 'Newspaper Delivery',
    icon: '📰',
    baseCost: 60,
    costMultiplier: 1.15,
    baseRevenue: 60,
    cycleTime: 3,
    managerCost: 15000,
    unlockAt: 1,
  },
  {
    id: 'carwash',
    name: 'Car Wash',
    icon: '🚗',
    baseCost: 720,
    costMultiplier: 1.15,
    baseRevenue: 540,
    cycleTime: 6,
    managerCost: 100000,
    unlockAt: 25,
  },
  {
    id: 'pizza',
    name: 'Pizza Delivery',
    icon: '🍕',
    baseCost: 8640,
    costMultiplier: 1.15,
    baseRevenue: 4320,
    cycleTime: 12,
    managerCost: 500000,
    unlockAt: 50,
  },
  {
    id: 'donut',
    name: 'Donut Shop',
    icon: '🍩',
    baseCost: 103680,
    costMultiplier: 1.15,
    baseRevenue: 51840,
    cycleTime: 24,
    managerCost: 1200000,
    unlockAt: 100,
  },
  {
    id: 'shrimp',
    name: 'Shrimp Boat',
    icon: '🦐',
    baseCost: 1244160,
    costMultiplier: 1.15,
    baseRevenue: 622080,
    cycleTime: 48,
    managerCost: 10000000,
    unlockAt: 200,
  },
  {
    id: 'hockey',
    name: 'Hockey Team',
    icon: '🏒',
    baseCost: 14929920,
    costMultiplier: 1.15,
    baseRevenue: 7464960,
    cycleTime: 96,
    managerCost: 111111111,
    unlockAt: 300,
  },
  {
    id: 'movie',
    name: 'Movie Studio',
    icon: '🎬',
    baseCost: 179159040,
    costMultiplier: 1.15,
    baseRevenue: 89579520,
    cycleTime: 192,
    managerCost: 1111111111,
    unlockAt: 400,
  },
  {
    id: 'bank',
    name: 'Bank',
    icon: '🏦',
    baseCost: 2149908480,
    costMultiplier: 1.15,
    baseRevenue: 1074954240,
    cycleTime: 384,
    managerCost: 11111111111,
    unlockAt: 500,
  },
  {
    id: 'oil',
    name: 'Oil Company',
    icon: '🛢️',
    baseCost: 25798901760,
    costMultiplier: 1.15,
    baseRevenue: 12899450880,
    cycleTime: 768,
    managerCost: 111111111111,
    unlockAt: 600,
  },
];

/**
 * Milestone upgrades that multiply a business's revenue.
 */
export const UPGRADES = [
  { id: 'lemonade-25', businessId: 'lemonade', name: 'Squeezed Fresh', atOwned: 25, multiplier: 2, cost: 1000 },
  { id: 'lemonade-50', businessId: 'lemonade', name: 'Organic Lemons', atOwned: 50, multiplier: 2, cost: 5000 },
  { id: 'lemonade-100', businessId: 'lemonade', name: 'Lemon Empire', atOwned: 100, multiplier: 2, cost: 25000 },
  { id: 'newspaper-25', businessId: 'newspaper', name: 'Extra Edition', atOwned: 25, multiplier: 2, cost: 15000 },
  { id: 'newspaper-50', businessId: 'newspaper', name: 'Sunday Special', atOwned: 50, multiplier: 2, cost: 75000 },
  { id: 'newspaper-100', businessId: 'newspaper', name: 'Media Mogul', atOwned: 100, multiplier: 2, cost: 375000 },
  { id: 'carwash-25', businessId: 'carwash', name: 'Wax On', atOwned: 25, multiplier: 2, cost: 100000 },
  { id: 'carwash-50', businessId: 'carwash', name: 'Premium Shine', atOwned: 50, multiplier: 2, cost: 500000 },
  { id: 'pizza-25', businessId: 'pizza', name: 'Extra Cheese', atOwned: 25, multiplier: 2, cost: 600000 },
  { id: 'pizza-50', businessId: 'pizza', name: 'Deep Dish Dynasty', atOwned: 50, multiplier: 2, cost: 3000000 },
  { id: 'donut-25', businessId: 'donut', name: 'Glazed & Confused', atOwned: 25, multiplier: 2, cost: 7200000 },
  { id: 'donut-50', businessId: 'donut', name: 'Hole Lotta Dough', atOwned: 50, multiplier: 2, cost: 36000000 },
  { id: 'donut-100', businessId: 'donut', name: 'Sprinkle Syndicate', atOwned: 100, multiplier: 2, cost: 180000000 },
  { id: 'shrimp-25', businessId: 'shrimp', name: 'Net Profits', atOwned: 25, multiplier: 2, cost: 86400000 },
  { id: 'shrimp-50', businessId: 'shrimp', name: 'Jumbo Catch', atOwned: 50, multiplier: 2, cost: 432000000 },
  { id: 'shrimp-100', businessId: 'shrimp', name: 'Ocean Monopoly', atOwned: 100, multiplier: 2, cost: 2160000000 },
  { id: 'hockey-25', businessId: 'hockey', name: 'Power Play', atOwned: 25, multiplier: 2, cost: 1036800000 },
  { id: 'hockey-50', businessId: 'hockey', name: 'Stanley Dreams', atOwned: 50, multiplier: 2, cost: 5184000000 },
  { id: 'hockey-100', businessId: 'hockey', name: 'Dynasty Franchise', atOwned: 100, multiplier: 2, cost: 25920000000 },
  { id: 'movie-25', businessId: 'movie', name: 'Blockbuster Deal', atOwned: 25, multiplier: 2, cost: 12441600000 },
  { id: 'movie-50', businessId: 'movie', name: 'Oscar Bait', atOwned: 50, multiplier: 2, cost: 62208000000 },
  { id: 'movie-100', businessId: 'movie', name: 'Studio Empire', atOwned: 100, multiplier: 2, cost: 311040000000 },
  { id: 'bank-25', businessId: 'bank', name: 'Compound Interest', atOwned: 25, multiplier: 2, cost: 149299200000 },
  { id: 'bank-50', businessId: 'bank', name: 'Vault Expansion', atOwned: 50, multiplier: 2, cost: 746496000000 },
  { id: 'bank-100', businessId: 'bank', name: 'Too Big to Fail', atOwned: 100, multiplier: 2, cost: 3732480000000 },
  { id: 'oil-25', businessId: 'oil', name: 'Gusher Fields', atOwned: 25, multiplier: 2, cost: 1791590400000 },
  { id: 'oil-50', businessId: 'oil', name: 'Pipeline Dominion', atOwned: 50, multiplier: 2, cost: 8957952000000 },
  { id: 'oil-100', businessId: 'oil', name: 'Black Gold Empire', atOwned: 100, multiplier: 2, cost: 44789760000000 },
];

/**
 * Global speed upgrades — stack multiplicatively, reset on prestige.
 */
export const SPEED_UPGRADES = [
  {
    id: 'speed-hustle',
    name: 'Hustle Culture',
    description: 'All businesses run 2× faster',
    speedMultiplier: 2,
    cost: 50_000,
    requiresTotalEarned: 10_000,
  },
  {
    id: 'speed-overtime',
    name: 'Mandatory Overtime',
    description: 'All businesses run 2× faster',
    speedMultiplier: 2,
    cost: 500_000,
    requiresTotalEarned: 100_000,
    requires: 'speed-hustle',
  },
  {
    id: 'speed-caffeine',
    name: 'Corporate Caffeine',
    description: 'All businesses run 2× faster',
    speedMultiplier: 2,
    cost: 5_000_000,
    requiresTotalEarned: 1_000_000,
    requires: 'speed-overtime',
  },
  {
    id: 'speed-warp',
    name: 'Time Warp Drive',
    description: 'All businesses run 3× faster',
    speedMultiplier: 3,
    cost: 50_000_000,
    requiresTotalEarned: 10_000_000,
    requires: 'speed-caffeine',
  },
];

export const PRESTIGE_MIN_EARNINGS = 1_000_000;
export const ANGEL_PROFIT_BONUS = 0.02;

/**
 * Permanent upgrades purchased with angel investors. Persist through prestige.
 */
export const ANGEL_UPGRADES = [
  {
    id: 'angel-golden-1',
    name: 'Golden Touch I',
    description: 'Permanent ×1.10 profit',
    angelCost: 1,
    profitMultiplier: 1.1,
  },
  {
    id: 'angel-golden-2',
    name: 'Golden Touch II',
    description: 'Permanent ×1.25 profit',
    angelCost: 5,
    profitMultiplier: 1.25,
    requires: 'angel-golden-1',
  },
  {
    id: 'angel-golden-3',
    name: 'Golden Touch III',
    description: 'Permanent ×1.50 profit',
    angelCost: 15,
    profitMultiplier: 1.5,
    requires: 'angel-golden-2',
  },
  {
    id: 'angel-seed',
    name: 'Seed Capital',
    description: 'Start each run with $1,000',
    angelCost: 2,
    startingCash: 1_000,
  },
  {
    id: 'angel-venture',
    name: 'Venture Fund',
    description: 'Start each run with $10,000',
    angelCost: 8,
    startingCash: 10_000,
    requires: 'angel-seed',
  },
  {
    id: 'angel-velocity',
    name: 'Eternal Hustle',
    description: 'Permanent +25% production speed',
    angelCost: 3,
    speedBonus: 0.25,
  },
  {
    id: 'angel-velocity-2',
    name: 'Time Dilation',
    description: 'Permanent +50% production speed',
    angelCost: 12,
    speedBonus: 0.5,
    requires: 'angel-velocity',
  },
  {
    id: 'angel-talent',
    name: 'Talent Scout',
    description: 'Managers cost 25% less',
    angelCost: 4,
    managerDiscount: 0.25,
  },
  {
    id: 'angel-night',
    name: 'Night Shift',
    description: '+50% offline earnings',
    angelCost: 6,
    offlineBonus: 0.5,
  },
];

export const BUSINESS_BY_ID = Object.fromEntries(BUSINESSES.map((b) => [b.id, b]));
export const ANGEL_UPGRADE_BY_ID = Object.fromEntries(ANGEL_UPGRADES.map((u) => [u.id, u]));
