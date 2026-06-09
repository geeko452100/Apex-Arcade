import { useState } from 'react';
import { Plus, Shield, Swords } from 'lucide-react';
import GameCard from './GameCard';
import { isAttackCard, isDefenseCard } from '../gameRules';

function getEmptySlotHint(index, { isPlayerTurn, combatPhase }) {
  if (!isPlayerTurn) return 'Waiting for your turn';

  const slotLabel = index === 0 ? 'Left' : index === 1 ? 'Center' : 'Right';
  if (combatPhase === 'attack-phase') {
    return `Drop an attack card · ${slotLabel} slot`;
  }
  return `Drop a defense card · ${slotLabel} slot`;
}

export default function FieldGrid({
  stagedCards,
  isPlayerTurn,
  combatPhase,
  playerBlock = 0,
  stagedDefenseGain = 0,
  stagedAttackBlockBonus = 0,
  stagedCounterattack = 0,
  handleDragStart,
  handleDragOver,
  handleSlotDrop,
  onUnstage,
}) {
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const isAttackPhase = combatPhase === 'attack-phase';
  const blockStagingGain = isAttackPhase ? stagedAttackBlockBonus : stagedDefenseGain;
  const showBlockPreview = playerBlock > 0 || (isPlayerTurn && blockStagingGain > 0);
  const projectedBlock = isAttackPhase
    ? playerBlock + blockStagingGain
    : blockStagingGain;
  const canStage = isPlayerTurn;
  const stagedCount = (stagedCards ?? []).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">Battlefield</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
                isAttackPhase
                  ? 'bg-rose-500/15 text-rose-300 ring-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
              }`}
            >
              {isAttackPhase ? <Swords className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
              {isAttackPhase ? 'Attack phase' : 'Defense phase'}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {canStage
              ? 'Drag a card from your hand into a slot, or click a playable card to auto-stage it.'
              : 'Cards staged here resolve when the active player executes their action.'}
            {canStage && stagedCount > 0 && ' Click a staged card to return it to your hand.'}
          </p>
        </div>

        {showBlockPreview && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-700/50 bg-emerald-950/40 px-4 py-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Block</span>
            <span className="text-lg font-black tabular-nums text-emerald-300">{playerBlock}</span>
            {blockStagingGain > 0 && (
              <>
                <span className="text-slate-500">→</span>
                <span className="text-lg font-black tabular-nums text-emerald-200">{projectedBlock}</span>
              </>
            )}
          </div>
        )}

        {isPlayerTurn && !isAttackPhase && stagedCounterattack > 0 && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-rose-700/50 bg-rose-950/40 px-4 py-2">
            <Swords className="h-4 w-4 text-rose-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Counter</span>
            <span className="text-lg font-black tabular-nums text-rose-300">{stagedCounterattack}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 sm:p-4 bg-slate-950 rounded-xl border border-slate-800">
        {[0, 1, 2].map((i) => {
          const card = stagedCards?.[i];
          const isDropTarget = canStage && activeSlotIndex === i;

          return (
            <div
              key={i}
              className={`relative aspect-[3/4] max-h-52 sm:max-h-60 bg-slate-900 border-2 border-dashed rounded-lg flex items-center justify-center overflow-visible transition-all duration-200 ${
                isDropTarget
                  ? 'border-indigo-400 bg-indigo-950/40 shadow-[0_0_0_4px_rgba(129,140,248,0.15)] scale-[1.02]'
                  : canStage
                    ? 'border-slate-700 hover:border-slate-600'
                    : 'border-slate-800'
              }`}
              onDragEnter={() => canStage && setActiveSlotIndex(i)}
              onDragLeave={() => setActiveSlotIndex((current) => (current === i ? null : current))}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                handleSlotDrop(e, i);
                setActiveSlotIndex(null);
              }}
            >
              {card ? (
                <GameCard
                  card={card}
                  className="animate-in slide-in-from-bottom-4 fade-in duration-500 w-full h-full"
                  canAfford
                  clickable
                  hint="Tap to remove"
                  draggable={isPlayerTurn}
                  onDragStart={handleDragStart(card.instanceId, 'stage')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    handleSlotDrop(e, i);
                    setActiveSlotIndex(null);
                  }}
                  onClick={() => onUnstage(card.instanceId)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 px-3 text-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                      canStage ? 'border-slate-600 bg-slate-800 text-slate-400' : 'border-slate-800 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {canStage ? <Plus className="h-5 w-5" /> : isAttackPhase ? <Swords className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </div>
                  <span className="text-[11px] font-medium leading-snug text-slate-500">
                    {getEmptySlotHint(i, { isPlayerTurn, combatPhase })}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
