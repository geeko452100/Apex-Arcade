import { Zap } from 'lucide-react';
import GameCard from './GameCard';

function getDisabledReason(card, { isPlayerTurn, playerEnergy }) {
  if (!isPlayerTurn) return 'Wait for your turn';

  if (playerEnergy < card.cost) {
    return `Need ${card.cost} energy (${playerEnergy} available)`;
  }

  return null;
}

function getHandHint({ isPlayerTurn, combatPhase, hand, playerEnergy }) {
  if (!isPlayerTurn) return 'Your opponent is playing. Cards will unlock on your turn.';
  if (hand.length === 0) return 'End your turn to draw new cards.';

  const label = combatPhase === 'attack-phase' ? 'attack' : 'defense';
  const playable = hand.filter((c) => c.cost <= playerEnergy).length;

  if (combatPhase === 'attack-phase') {
    return playable > 0
      ? `${playable} attack card${playable === 1 ? '' : 's'} ready — click or drag to the battlefield.`
      : 'No affordable attack cards. Skip to defense or end your turn.';
  }

  return playable > 0
    ? `${playable} ${label} card${playable === 1 ? '' : 's'} ready — stage them or press Defend.`
    : `No affordable ${label} cards. You can still end your turn.`;
}

export default function BattleHandZone({
  hand,
  isPlayerTurn,
  playerEnergy,
  combatPhase,
  handlePlayCard,
  handleDragStart,
  handleDragOver,
  handleHandDrop,
}) {
  const handHint = getHandHint({ isPlayerTurn, combatPhase, hand, playerEnergy });
  const handTitle = combatPhase === 'attack-phase' ? 'Attack Hand' : 'Defense Hand';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">{handTitle}</h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{handHint}</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-700/40 bg-amber-950/30 px-3 py-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Energy</span>
          <span className="text-lg font-black tabular-nums text-amber-300">{playerEnergy}</span>
        </div>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40 p-3"
        onDragOver={handleDragOver}
        onDrop={handleHandDrop}
      >
        {hand.length > 0 ? (
          hand.map((card) => {
            const canAfford = playerEnergy >= card.cost;
            const isPlayable = isPlayerTurn && canAfford;
            const disabledReason = isPlayable
              ? null
              : getDisabledReason(card, { isPlayerTurn, playerEnergy });

            return (
              <GameCard
                key={card.instanceId}
                card={card}
                onClick={handlePlayCard}
                canAfford={canAfford}
                isPlayable={isPlayable}
                disabledReason={disabledReason}
                draggable={isPlayable}
                onDragStart={handleDragStart(card.instanceId, 'hand')}
              />
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-slate-500 text-sm text-center">
            Your {combatPhase === 'attack-phase' ? 'attack' : 'defense'} hand is empty. End your turn to draw new cards.
          </div>
        )}
      </div>

      {isPlayerTurn && hand.length > 0 && (
        <p className="text-[11px] text-slate-600 text-center">
          Drag staged cards back here to return them to your hand.
        </p>
      )}
    </div>
  );
}
