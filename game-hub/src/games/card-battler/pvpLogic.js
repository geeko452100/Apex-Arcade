import { drawZone, getTurnDrawCount, INITIAL_ENERGY, ATTACK_HAND_SIZE, DEFENSE_HAND_SIZE } from './gameLogic';
import {
  findCardInHands,
  getEffectiveCombatPhase,
  getHandKeyForCard,
  getHandKeyForPhase,
  isAttackCard,
  isDefenseCard,
  isOpeningTurn,
  sanitizeStaged,
} from './gameRules';

const MAX_FIELD_SLOTS = 3;

function normalizeStaged(staged = []) {
  return sanitizeStaged(staged);
}

function getStagedCards(staged) {
  return normalizeStaged(staged).filter(Boolean);
}

function returnStagedToHands(player, stagedCards) {
  const attackHand = [...(player.attackHand ?? [])];
  const defenseHand = [...(player.defenseHand ?? [])];

  for (const card of stagedCards) {
    const key = getHandKeyForCard(card);
    if (key === 'attackHand') attackHand.push(card);
    else defenseHand.push(card);
  }

  return { attackHand, defenseHand };
}

function drawHandsForPlayer(player) {
  const attackHand = player.attackHand ?? [];
  const defenseHand = player.defenseHand ?? [];

  const attackDrawCount = getTurnDrawCount(attackHand.length, ATTACK_HAND_SIZE);
  const defenseDrawCount = getTurnDrawCount(defenseHand.length, DEFENSE_HAND_SIZE);

  const attackResult = drawZone(
    attackDrawCount,
    player.attackDeck ?? [],
    player.attackDiscard ?? [],
    attackHand,
    ATTACK_HAND_SIZE
  );

  const defenseResult = drawZone(
    defenseDrawCount,
    player.defenseDeck ?? [],
    player.defenseDiscard ?? [],
    defenseHand,
    DEFENSE_HAND_SIZE
  );

  return {
    attackHand: attackResult.hand,
    attackDeck: attackResult.deck,
    attackDiscard: attackResult.discard,
    defenseHand: defenseResult.hand,
    defenseDeck: defenseResult.deck,
    defenseDiscard: defenseResult.discard,
  };
}

function resolveAttackAgainstTarget(totalAttack, target) {
  const targetBlock = target.block ?? 0;
  const damageAfterBlock = Math.max(0, totalAttack - targetBlock);
  const remainingBlock = Math.max(0, targetBlock - totalAttack);
  const newHp = Math.max(0, (target.hp ?? 0) - damageAfterBlock);

  return { newHp, remainingBlock, damageAfterBlock };
}

function endTurn(state, activeKey, active, targetPatch) {
  const targetKey = activeKey === 'player_1' ? 'player_2' : 'player_1';
  const nextTurnOwner = String(state.turnOwner) === String(state.player_1_id)
    ? state.player_2_id
    : state.player_1_id;

  const nextKey = String(nextTurnOwner) === String(state.player_1_id)
    ? 'player_1'
    : 'player_2';

  const nextPlayer = state[nextKey];
  const stagedCards = getStagedCards(active.staged);

  // A full cycle (P1 turn + P2 turn) completes when the turn passes back to player 1.
  const newRound = String(nextTurnOwner) === String(state.player_1_id);

  const returnedHands = returnStagedToHands(active, stagedCards);

  const endingPlayer = {
    ...active,
    staged: [],
    attackHand: returnedHands.attackHand,
    defenseHand: returnedHands.defenseHand,
    // Always keep the ending player's block — including fresh defense from EXECUTE_DEFENSE.
    block: active.block,
  };

  const drawnHands = drawHandsForPlayer(nextPlayer);

  return {
    ...state,
    combatPhase:       'attack-phase',
    isFirstTurnOfGame: false,
    turnOwner:         nextTurnOwner,
    turnExpiration:    Date.now() + 30_000,
    [activeKey]:       endingPlayer,
    ...(targetPatch
      ? { [targetKey]: { ...state[targetKey], ...targetPatch } }
      : {}),
    [nextKey]: {
      ...nextPlayer,
      staged:         [],
      energy:         INITIAL_ENERGY,
      ...drawnHands,
      // New round: clear P1's stale block from the previous cycle. P2's fresh block is kept above.
      block:          newRound ? 0 : nextPlayer.block,
    },
  };
}

/**
 * Returns the active/target player state keys based on whose turn it is.
 * Uses String() coercion to prevent type-mismatch bugs (e.g. number vs string IDs).
 */
function getPlayerKeys(state, executionUserId) {
  const isPlayer1 = String(executionUserId) === String(state.player_1_id);
  return {
    activeKey: isPlayer1 ? 'player_1' : 'player_2',
    targetKey: isPlayer1 ? 'player_2' : 'player_1',
  };
}

/** Actions that must belong to the current turn owner. */
const TURN_LOCKED = new Set([
  'STAGE_CARD',
  'UNSTAGE_CARD',
  'EXECUTE_ATTACK',
  'EXECUTE_DEFENSE',
  'NEXT_PHASE',
  'DISCARD_CARD',
]);

export function handlePvPReducer(state, action) {
  const { userId } = action.payload;

  // Turn-lock guard — silently reject out-of-turn actions.
  if (TURN_LOCKED.has(action.type) && String(state.turnOwner) !== String(userId)) {
    console.warn('Action blocked: not your turn.', { expected: state.turnOwner, got: userId });
    return state;
  }

  const { activeKey, targetKey } = getPlayerKeys(state, userId);
  const active = state[activeKey];
  const target = state[targetKey];

  switch (action.type) {
    // ─── STAGE_CARD ──────────────────────────────────────────────────────────
    case 'STAGE_CARD': {
      const { cardId, slotIndex } = action.payload;
      const phase = getEffectiveCombatPhase(state);
      const handKey = getHandKeyForPhase(phase);
      const hand = active[handKey] ?? [];
      const cardIndex = hand.findIndex((c) => c.instanceId === cardId);
      if (cardIndex === -1) return state;

      const card = hand[cardIndex];
      if (card.cost > active.energy) return state;

      if (isOpeningTurn(state) && isAttackCard(card)) return state;
      if (phase === 'attack-phase' && isDefenseCard(card)) return state;
      if (phase === 'defense-phase' && isAttackCard(card)) return state;

      const staged = normalizeStaged(active.staged);
      let targetSlot = slotIndex;

      if (targetSlot == null || targetSlot < 0 || targetSlot >= MAX_FIELD_SLOTS) {
        targetSlot = staged.findIndex((s) => !s);
        if (targetSlot === -1) return state;
      }

      if (staged[targetSlot]) return state;

      const newStaged = [...staged];
      newStaged[targetSlot] = card;

      const newHand = hand.filter((_, i) => i !== cardIndex);

      return {
        ...state,
        [activeKey]: {
          ...active,
          [handKey]: newHand,
          staged:    newStaged,
          energy:    active.energy - card.cost,
        },
      };
    }

    // ─── UNSTAGE_CARD ─────────────────────────────────────────────────────────
    case 'UNSTAGE_CARD': {
      const { cardId } = action.payload;
      const staged = normalizeStaged(active.staged);
      const cardIndex = staged.findIndex((c) => c?.instanceId === cardId);
      if (cardIndex === -1) return state;

      const card = staged[cardIndex];
      const handKey = getHandKeyForCard(card);
      const newStaged = [...staged];
      newStaged[cardIndex] = null;

      return {
        ...state,
        [activeKey]: {
          ...active,
          staged: newStaged,
          [handKey]: [...(active[handKey] ?? []), card],
          energy: active.energy + card.cost,
        },
      };
    }

    // ─── EXECUTE_ATTACK ───────────────────────────────────────────────────────
    case 'EXECUTE_ATTACK': {
      if (isOpeningTurn(state)) return state;

      const staged = normalizeStaged(active.staged);
      const attackCards = getStagedCards(staged).filter((c) => isAttackCard(c));
      if (attackCards.length === 0) return state;

      const totalAttack = attackCards.reduce((sum, c) => sum + (c.attack ?? 0), 0);
      const totalDefense = attackCards.reduce((sum, c) => sum + (c.defense ?? 0), 0);
      const { newHp, remainingBlock } = resolveAttackAgainstTarget(totalAttack, target);

      const newStaged = staged.map((c) => (isAttackCard(c) ? null : c));

      const gameOver = newHp <= 0
        ? { winnerId: userId, reason: 'hp-depleted' }
        : null;

      return {
        ...state,
        gameOver,
        ...(gameOver
          ? {}
          : {
              combatPhase:    'defense-phase',
              turnExpiration: Date.now() + 30_000,
            }),
        [activeKey]: {
          ...active,
          staged:        newStaged,
          energy:        INITIAL_ENERGY,
          block:         (active.block ?? 0) + totalDefense,
          attackDiscard: [...(active.attackDiscard ?? []), ...attackCards],
        },
        [targetKey]: {
          ...target,
          hp:    newHp,
          block: remainingBlock,
        },
      };
    }

    // ─── EXECUTE_DEFENSE ──────────────────────────────────────────────────────
    case 'EXECUTE_DEFENSE': {
      const staged = normalizeStaged(active.staged);
      let defenseCards = getStagedCards(staged).filter((c) => isDefenseCard(c));
      let defenseHand = active.defenseHand ?? [];
      let energy = active.energy;
      let newStaged = staged.map((c) => (isDefenseCard(c) ? null : c));

      // No staged defense — pull affordable defend cards straight from defense hand.
      if (defenseCards.length === 0) {
        const pulled = [];
        const handCopy = [...defenseHand];

        for (const card of handCopy) {
          if (!isDefenseCard(card) || card.cost > energy) continue;
          if (pulled.length >= MAX_FIELD_SLOTS) break;
          pulled.push(card);
          energy -= card.cost;
        }

        if (pulled.length === 0) return state;

        defenseCards = pulled;
        defenseHand = defenseHand.filter((c) => !pulled.some((p) => p.instanceId === c.instanceId));
        newStaged = normalizeStaged([]);
      }

      const totalDefense = defenseCards.reduce((sum, c) => sum + (c.defense ?? 0), 0);
      const totalAttack = defenseCards.reduce((sum, c) => sum + (c.attack ?? 0), 0);
      const { newHp, remainingBlock } = resolveAttackAgainstTarget(totalAttack, target);

      const afterDefense = {
        ...active,
        defenseHand,
        energy,
        staged:         newStaged,
        block:          totalDefense,
        defenseDiscard: [...(active.defenseDiscard ?? []), ...defenseCards],
      };

      const gameOver = newHp <= 0
        ? { winnerId: userId, reason: 'hp-depleted' }
        : null;

      if (gameOver) {
        return {
          ...state,
          gameOver,
          [activeKey]: afterDefense,
          [targetKey]: {
            ...target,
            hp:    newHp,
            block: remainingBlock,
          },
        };
      }

      return endTurn(state, activeKey, afterDefense, { hp: newHp, block: remainingBlock });
    }

    // ─── NEXT_PHASE ───────────────────────────────────────────────────────────
    case 'NEXT_PHASE': {
      const isAttackPhase = getEffectiveCombatPhase(state) === 'attack-phase';

      if (isAttackPhase) {
        if (isOpeningTurn(state)) {
          return endTurn(state, activeKey, active);
        }

        const staged = normalizeStaged(active.staged);
        const stagedCards = getStagedCards(staged);
        const returnedHands = returnStagedToHands(active, stagedCards);

        return {
          ...state,
          combatPhase:    'defense-phase',
          turnExpiration: Date.now() + 30_000,
          [activeKey]: {
            ...active,
            staged: [],
            attackHand: returnedHands.attackHand,
            defenseHand: returnedHands.defenseHand,
            energy: INITIAL_ENERGY,
          },
        };
      }

      return endTurn(state, activeKey, active);
    }

    // ─── DISCARD_CARD ─────────────────────────────────────────────────────────
    case 'DISCARD_CARD': {
      const { cardId } = action.payload;
      const located = findCardInHands(active, cardId);
      if (!located) return state;

      const { handKey, index, card } = located;
      const hand = active[handKey] ?? [];
      const newHand = hand.filter((_, i) => i !== index);
      const discardKey = isAttackCard(card) ? 'attackDiscard' : 'defenseDiscard';

      return {
        ...state,
        [activeKey]: {
          ...active,
          [handKey]:  newHand,
          [discardKey]: [...(active[discardKey] ?? []), card],
        },
      };
    }

    default:
      return state;
  }
}
