/**
 * True when player 1 is taking the opening turn (defense-only, no attack).
 */
export function isOpeningTurn(state) {
  if (!state?.player_1_id) return false;
  if (String(state.turnOwner) !== String(state.player_1_id)) return false;
  if (state.isFirstTurnOfGame === false) return false;
  if (state.isFirstTurnOfGame === true) return true;

  // Legacy snapshots missing the flag — infer from initial version.
  return (state.stateVersion ?? 0) <= 1;
}

export function isDefenseCard(card) {
  return card?.type === 'defend' || card?.type === 'defense';
}

export function isAttackCard(card) {
  return card?.type === 'attack';
}

/** Combat phase after applying opening-turn rules. */
export function getEffectiveCombatPhase(state) {
  if (isOpeningTurn(state)) return 'defense-phase';
  return state?.combatPhase ?? 'attack-phase';
}

export function getHandKeyForPhase(combatPhase) {
  return combatPhase === 'attack-phase' ? 'attackHand' : 'defenseHand';
}

export function getHandKeyForCard(card) {
  return isAttackCard(card) ? 'attackHand' : 'defenseHand';
}

/** The hand visible and playable during the current combat phase. */
export function getActiveHand(player, combatPhase) {
  const key = getHandKeyForPhase(combatPhase);
  return player?.[key] ?? [];
}

/** Find a card in either hand zone. */
export function findCardInHands(player, cardId) {
  for (const key of ['attackHand', 'defenseHand']) {
    const hand = player?.[key] ?? [];
    const index = hand.findIndex((c) => c.instanceId === cardId);
    if (index !== -1) return { handKey: key, index, card: hand[index] };
  }
  return null;
}

/** Normalize legacy / drifted snapshots. */
export function normalizeGameState(state) {
  if (!state || typeof state !== 'object') return state;

  let next = { ...state };

  if (isOpeningTurn(next)) {
    next = {
      ...next,
      combatPhase:       'defense-phase',
      isFirstTurnOfGame: true,
    };
  }

  if (Array.isArray(next.player_1?.staged)) {
    next = {
      ...next,
      player_1: { ...next.player_1, staged: sanitizeStaged(next.player_1.staged) },
    };
  }

  if (Array.isArray(next.player_2?.staged)) {
    next = {
      ...next,
      player_2: { ...next.player_2, staged: sanitizeStaged(next.player_2.staged) },
    };
  }

  next = {
    ...next,
    player_1: normalizePlayerZones(next.player_1),
    player_2: normalizePlayerZones(next.player_2),
  };

  return next;
}

function normalizePlayerZones(player) {
  if (!player) return player;

  let next = { ...player };

  if (Array.isArray(next.hand) && !Array.isArray(next.attackHand)) {
    next = {
      ...next,
      attackHand: next.hand.filter((c) => isAttackCard(c)),
      defenseHand: next.hand.filter((c) => isDefenseCard(c)),
    };
  }

  if (Array.isArray(next.deck) && !Array.isArray(next.attackDeck)) {
    next = {
      ...next,
      attackDeck: next.deck.filter((c) => isAttackCard(c)),
      defenseDeck: next.deck.filter((c) => isDefenseCard(c)),
    };
  }

  return {
    ...next,
    attackHand: next.attackHand ?? [],
    defenseHand: next.defenseHand ?? [],
    attackDeck: next.attackDeck ?? [],
    defenseDeck: next.defenseDeck ?? [],
    attackDiscard: next.attackDiscard ?? [],
    defenseDiscard: next.defenseDiscard ?? [],
  };
}

/** True when a game row has dealt starting hands (supports legacy unified hand snapshots). */
export function isGameInitialized(status) {
  if (!status || typeof status !== 'object') return false;

  const normalized = normalizeGameState(status);
  const p1 = normalized.player_1;
  if (!p1) return false;

  return (
    Array.isArray(p1.attackHand) &&
    p1.attackHand.length > 0 &&
    Array.isArray(p1.defenseHand) &&
    p1.defenseHand.length > 0
  );
}

/** JSON-safe staged slots (undefined → null). */
export function sanitizeStaged(staged = []) {
  const slots = [...staged];
  while (slots.length < 3) slots.push(null);
  return slots.slice(0, 3).map((slot) => slot ?? null);
}

export function sanitizeGameStateForStorage(state) {
  if (!state) return state;

  return normalizeGameState({
    ...state,
    player_1: state.player_1
      ? { ...state.player_1, staged: sanitizeStaged(state.player_1.staged) }
      : state.player_1,
    player_2: state.player_2
      ? { ...state.player_2, staged: sanitizeStaged(state.player_2.staged) }
      : state.player_2,
  });
}

/** All defend cards currently in the active player's defense hand. */
export function getDefenseCardsFromHand(player) {
  return (player?.defenseHand ?? []).filter((c) => isDefenseCard(c));
}

/** Defend cards in hand the active player can afford right now. */
export function getAffordableDefenseFromHand(player) {
  const energy = player?.energy ?? 0;
  return getDefenseCardsFromHand(player).filter((c) => c.cost <= energy);
}

/** Total block value from defense cards currently staged on the field. */
export function getStagedDefenseTotal(player) {
  return (player?.staged ?? [])
    .filter(Boolean)
    .filter(isDefenseCard)
    .reduce((sum, card) => sum + (card.defense ?? 0), 0);
}

/** Counterattack damage from defense cards currently staged on the field. */
export function getStagedCounterattackTotal(player) {
  return (player?.staged ?? [])
    .filter(Boolean)
    .filter(isDefenseCard)
    .reduce((sum, card) => sum + (card.attack ?? 0), 0);
}

/** Block bonus from attack cards currently staged on the field. */
export function getStagedAttackDefenseBonus(player) {
  return (player?.staged ?? [])
    .filter(Boolean)
    .filter(isAttackCard)
    .reduce((sum, card) => sum + (card.defense ?? 0), 0);
}
