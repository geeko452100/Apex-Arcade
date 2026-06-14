import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Cpu, Loader2, Trophy } from 'lucide-react';
import { useIdleGame } from './hooks/useIdleGame';
import CurrencyHeader from './components/CurrencyHeader';
import BusinessCard from './components/BusinessCard';
import UpgradePanel from './components/UpgradePanel';
import SpeedUpgradePanel from './components/SpeedUpgradePanel';
import PrestigePanel from './components/PrestigePanel';
import AngelUpgradePanel from './components/AngelUpgradePanel';

export default function IdleEngine({ userId }) {
  const {
    state,
    loadStatus,
    cloudStatus,
    buyBusiness,
    runBusiness,
    hireManager,
    buyUpgrade,
    buySpeedUpgrade,
    buyAngelUpgrade,
    prestige,
    resetGame,
  } = useIdleGame(userId);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (loadStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm font-medium">Loading your empire...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Cpu className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-mono">
              Incremental Engine
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Tycoon Terminal</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Build businesses, hire managers, stack upgrades, and prestige for angel investors.
            Progress syncs to the cloud and continues while you are away.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/leaderboard?game=idle"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
          >
            <Trophy className="w-4 h-4" />
            View Leaderboard
          </Link>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Save
          </button>
        </div>
      </div>

      <CurrencyHeader state={state} cloudStatus={cloudStatus} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Businesses
          </h2>
          {state.businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              state={state}
              onBuy={buyBusiness}
              onRun={runBusiness}
              onHireManager={hireManager}
            />
          ))}
        </div>

        <div className="space-y-4">
          <PrestigePanel state={state} onPrestige={prestige} />
          <AngelUpgradePanel state={state} onBuyAngelUpgrade={buyAngelUpgrade} />
          <SpeedUpgradePanel state={state} onBuySpeedUpgrade={buySpeedUpgrade} />
          <UpgradePanel state={state} onBuyUpgrade={buyUpgrade} />
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Reset Progress?</h3>
            <p className="text-sm text-slate-400 mb-6">
              This wipes all progress including angels and cloud save data, starting fresh
              with one Lemonade Stand.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
