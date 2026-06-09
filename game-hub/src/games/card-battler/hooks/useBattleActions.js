import { useCallback } from 'react';
import {
  getEffectiveCombatPhase,
  getActiveHand,
  getAffordableDefenseFromHand,
  getDefenseCardsFromHand,
  isAttackCard,
  isDefenseCard,
} from '../gameRules';

/**
 * Provides all player interaction handlers for the battle screen.
 * Stateless — derives everything from gameState on every render.
 */
export function useBattleActions({
  gameState,
  currentUserId,
  stageCard,
  unstageCard,
  handlePhaseTransition,
  executeAttack,
  executeDefense,
  setEnemyShake,
  showAttackBanner,
  showDefenseBanner,
}) {
  const isPlayerTurn = String(gameState?.turnOwner) === String(currentUserId);

  // ── Card play ─────────────────────────────────────────────────────────────
  const handlePlayCard = useCallback((instanceId) => {
    if (!gameState) return;

    // BUG FIX: Search by instanceId, not id. Multiple cards of the same type
    // share the same `id`; instanceId is the unique per-instance key used
    // throughout pvpLogic. Using `id` here caused wrong-card staging when
    // the hand contained duplicate card types.
    const combatPhase = getEffectiveCombatPhase(gameState);
    const activeHand = getActiveHand(gameState.player, combatPhase);
    const card = activeHand.find((c) => c.instanceId === instanceId);
    if (!card) return;

    if (card.attack > 0) {
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 500);
    }

    stageCard(instanceId);
  }, [gameState, stageCard, setEnemyShake]);

  // ── Execute attack or defense ─────────────────────────────────────────────
  const handleExecuteAction = useCallback(() => {
    if (!gameState || !isPlayerTurn) return;

    const { player } = gameState;
    const combatPhase = getEffectiveCombatPhase(gameState);
    const staged = (player.staged ?? []).filter(Boolean);

    if (combatPhase === 'attack-phase') {
      const attackCards = staged.filter((c) => isAttackCard(c));
      const totalAttack = attackCards.reduce((sum, c) => sum + (c.attack ?? 0), 0);
      const totalDefense = attackCards.reduce((sum, c) => sum + (c.defense ?? 0), 0);
      showAttackBanner(
        'Direct hit!',
        totalDefense > 0
          ? `Your attack landed and you gained ${totalDefense} block.`
          : 'Your attack landed on the opponent.',
        1500,
        2100,
        { variant: 'attack', stat: totalAttack, statLabel: 'Damage Dealt' }
      );
      executeAttack();
    } else {
      const defendCards = staged.filter((c) => isDefenseCard(c));
      const fromHand = getAffordableDefenseFromHand(player);
      const source = defendCards.length > 0 ? defendCards : fromHand;
      const totalDefense = source.reduce((sum, c) => sum + (c.defense ?? 0), 0);
      const totalAttack = source.reduce((sum, c) => sum + (c.attack ?? 0), 0);
      showDefenseBanner(
        'Shields raised!',
        totalAttack > 0
          ? `You're protected and counterattacked for ${totalAttack} damage.`
          : 'You\'re protected until the next hit.',
        1500,
        2100,
        { variant: 'defense', stat: totalDefense, statLabel: 'Block Added' }
      );
      executeDefense();
    }
  }, [gameState, isPlayerTurn, executeAttack, executeDefense, showAttackBanner, showDefenseBanner]);

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback((instanceId, location) => (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: instanceId, from: location }));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSlotDrop = useCallback((e, slotIndex) => {
    e.preventDefault();
    if (!isPlayerTurn) return;
    try {
      const { cardId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (from === 'hand') stageCard(cardId, slotIndex);
    } catch (err) {
      console.error('handleSlotDrop: malformed drag payload', err);
    }
  }, [isPlayerTurn, stageCard]);

  const handleHandDrop = useCallback((e) => {
    e.preventDefault();
    if (!isPlayerTurn) return;
    try {
      const { cardId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (from === 'stage') unstageCard(cardId);
    } catch (err) {
      console.error('handleHandDrop: malformed drag payload', err);
    }
  }, [isPlayerTurn, unstageCard]);

  const handleSkipPhase = useCallback(() => {
    if (gameState?.gameOver || !isPlayerTurn) return;
    handlePhaseTransition();
  }, [gameState?.gameOver, isPlayerTurn, handlePhaseTransition]);

  // ── Derived display values ────────────────────────────────────────────────
  const gameFinished = gameState?.gameOver ?? null;

  const combatPhase = getEffectiveCombatPhase(gameState);

  const phaseButtonLabel = combatPhase === 'attack-phase'
    ? 'To Defend Phase'
    : 'End Turn';

  const player = gameState?.player;
  const staged = (player?.staged ?? []).filter(Boolean);
  const defenseInHand = getDefenseCardsFromHand(player);
  const affordableDefense = getAffordableDefenseFromHand(player);

  const hasAttackStaged = staged.some((c) => isAttackCard(c));
  const hasDefenseStaged = staged.some((c) => isDefenseCard(c));
  const hasDefenseAvailable = hasDefenseStaged || affordableDefense.length > 0;

  const actionReady = isPlayerTurn && (
    (combatPhase === 'attack-phase'  && hasAttackStaged) ||
    (combatPhase === 'defense-phase' && hasDefenseAvailable)
  );

  const actionLabel = !isPlayerTurn
    ? combatPhase === 'attack-phase'
      ? 'Attack (Not Your Turn)'
      : 'Defend (Not Your Turn)'
    : combatPhase === 'attack-phase'
      ? actionReady ? 'Attack'  : 'No Attack Cards'
      : actionReady
        ? hasDefenseStaged ? 'Defend' : 'Defend From Hand'
        : defenseInHand.length > 0
          ? 'Not Enough Energy'
          : 'No Defense Cards';

  const phaseHint = !isPlayerTurn
    ? 'Available when it is your turn.'
    : combatPhase === 'attack-phase'
      ? 'Skip attacking and move straight to your defense phase.'
      : 'Pass your turn without playing more defense cards.';

  const actionHint = !isPlayerTurn
    ? 'Waiting for your opponent to finish their turn.'
    : combatPhase === 'attack-phase'
      ? actionReady
        ? 'Resolve staged attack cards — bonus block from defense stat applies too.'
        : 'Stage at least one attack card from your hand first.'
      : actionReady
        ? hasDefenseStaged
          ? 'Gain block from staged defense cards — counterattack damage applies too.'
          : 'Use affordable defense cards directly from your hand.'
        : defenseInHand.length > 0
          ? 'You have defense cards, but not enough energy to play them.'
          : 'No defense cards available — end your turn to continue.';

  return {
    actionReady,
    actionLabel,
    phaseButtonLabel,
    phaseHint,
    actionHint,
    handlePlayCard,
    handleExecuteAction,
    handleDragStart,
    handleDragOver,
    handleSlotDrop,
    handleHandDrop,
    handleSkipPhase,
    gameFinished,
  };
}
