import { Shield, Zap } from 'lucide-react';

function EnergyMeter({ energy, align = 'left' }) {
  const value = energy ?? 0;
  const maxEnergy = Math.max(value, 3);

  return (
    <div
      className={`mt-2 flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}
      aria-label={`${value} of ${maxEnergy} energy`}
    >
      {Array.from({ length: maxEnergy }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-colors ${
            i < value ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'bg-slate-800 ring-1 ring-slate-700'
          }`}
        />
      ))}
      <span className="ml-1 text-[10px] font-bold text-amber-400/80 tabular-nums">{value} energy</span>
    </div>
  );
}

function BlockMeter({ block, stagedGain = 0, align = 'left', accent = 'emerald' }) {
  const current = block ?? 0;
  const projected = current + stagedGain;
  const scaleMax = Math.max(20, projected, current, 1);
  const currentPct = Math.min(100, (current / scaleMax) * 100);
  const projectedPct = Math.min(100, (projected / scaleMax) * 100);

  const accentStyles = {
    emerald: {
      icon: 'text-emerald-400',
      value: 'text-emerald-300',
      bar: 'bg-emerald-500',
      preview: 'bg-emerald-400/35',
      border: 'border-emerald-700/60',
      chip: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    },
    rose: {
      icon: 'text-rose-400',
      value: 'text-rose-300',
      bar: 'bg-rose-500',
      preview: 'bg-rose-400/35',
      border: 'border-rose-700/60',
      chip: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    },
  }[accent];

  return (
    <div className={`space-y-2 ${align === 'right' ? 'text-right' : ''}`}>
      <div className={`flex items-end gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
        <Shield className={`h-5 w-5 shrink-0 ${accentStyles.icon}`} />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Block</p>
          <div className={`flex items-baseline gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
            <span
              key={current}
              className={`text-2xl font-black tabular-nums transition-all duration-300 ${accentStyles.value}`}
            >
              {current}
            </span>
            {stagedGain > 0 && (
              <>
                <span className="text-sm font-bold text-slate-500">→</span>
                <span
                  key={projected}
                  className="text-2xl font-black tabular-nums text-emerald-200 animate-pulse"
                >
                  {projected}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${accentStyles.chip}`}>
                  +{stagedGain} staged
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`relative h-2 overflow-hidden rounded-full bg-slate-900 border ${accentStyles.border}`}>
        {stagedGain > 0 && (
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${accentStyles.preview}`}
            style={{ width: `${projectedPct}%` }}
          />
        )}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${accentStyles.bar}`}
          style={{ width: `${currentPct}%` }}
        />
      </div>
    </div>
  );
}

export default function BattleDashboard({
  localPlayer,
  remoteEnemy,
  playerShake,
  enemyShake,
  isPlayerTurn,
  combatPhase,
  timeLeft,
  stagedDefenseGain = 0,
  stagedAttackBlockBonus = 0,
}) {
  if (!localPlayer || !remoteEnemy) return null;

  const showDefenseStaging = isPlayerTurn && combatPhase === 'defense-phase';
  const blockStagingGain = showDefenseStaging
    ? stagedDefenseGain
    : (isPlayerTurn && combatPhase === 'attack-phase' ? stagedAttackBlockBonus : 0);
  const showStagingPreview = blockStagingGain > 0;
  const localEnergy = localPlayer.energy ?? 0;
  const remoteEnergy = remoteEnemy.energy ?? 0;

  return (
    <div className="space-y-3">
      {(isPlayerTurn !== undefined || timeLeft !== undefined) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-widest font-bold">
          <span className={isPlayerTurn ? 'text-emerald-400' : 'text-slate-500'}>
            {isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-amber-300 ring-1 ring-amber-700/50">
            <Zap className="h-3.5 w-3.5" />
            <span className="tabular-nums">{localEnergy}</span>
            <span className="text-slate-500 normal-case tracking-normal">you</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-amber-300/80 ring-1 ring-amber-700/40">
            <Zap className="h-3.5 w-3.5" />
            <span className="tabular-nums">{remoteEnergy}</span>
            <span className="text-slate-500 normal-case tracking-normal">opp</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-emerald-300 ring-1 ring-emerald-700/50">
            <Shield className="h-3.5 w-3.5" />
            <span className="tabular-nums">{localPlayer.block ?? 0}</span>
            {showStagingPreview && (
              <span className="text-emerald-200">→ {localPlayer.block + blockStagingGain}</span>
            )}
            <span className="text-slate-500 normal-case tracking-normal">block</span>
          </span>
          <span className={`${timeLeft !== undefined && timeLeft <= 10 ? 'text-rose-400' : 'text-amber-400'}`}>
            {combatPhase === 'attack-phase' ? 'Attack Phase' : 'Defense Phase'}
            {timeLeft !== undefined && ` · ${timeLeft}s`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className={`space-y-3 transition-all ${playerShake ? 'animate-shake' : ''}`}>
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">You</h2>
            <div className="text-3xl font-black text-white tabular-nums">{localPlayer.hp} HP</div>
            <EnergyMeter energy={localEnergy} />
          </div>
          <BlockMeter
            block={localPlayer.block}
            stagedGain={blockStagingGain}
            align="left"
            accent="emerald"
          />
        </div>

        <div className={`space-y-3 transition-all ${enemyShake ? 'animate-shake' : ''}`}>
          <div className="text-right">
            <h2 className="text-[10px] uppercase tracking-widest text-rose-500 font-bold">Opponent</h2>
            <div className="text-3xl font-black text-white tabular-nums">{remoteEnemy.hp} HP</div>
            <EnergyMeter energy={remoteEnergy} align="right" />
          </div>
          <BlockMeter
            block={remoteEnemy.block}
            align="right"
            accent="rose"
          />
        </div>
      </div>
    </div>
  );
}
