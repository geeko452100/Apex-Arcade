// Support cards (IDs 17, 18, 20) have been intentionally removed.

import { shuffleDeck, ATTACK_HAND_SIZE, DEFENSE_HAND_SIZE } from './gameLogic';

/** @typedef {{ id: number, name: string, cost: number, type: 'attack'|'defend', attack: number, defense: number, description: string }} CardDef */
/** @typedef {CardDef & { instanceId: string }} CardInstance */

export const FULL_DECK = [
  { id: 1,  name: 'Plasma Strike',      cost: 1, type: 'attack', attack: 4,  defense: 0,  description: 'Deal 4 damage to the target.' },
  { id: 2,  name: 'Photon Shield',      cost: 1, type: 'defend', attack: 0,  defense: 5,  description: 'Gain 5 block points.' },
  { id: 3,  name: 'Overcharge',         cost: 2, type: 'attack', attack: 8,  defense: 2,  description: 'Heavy offensive output.' },
  { id: 4,  name: 'Nanite Repair',      cost: 3, type: 'defend', attack: 0,  defense: 12, description: 'Maximum damage mitigation.' },
  { id: 5,  name: 'Micro Burst',        cost: 1, type: 'attack', attack: 3,  defense: 0,  description: 'Quick strike to weaken armor.' },
  { id: 6,  name: 'Reactive Shield',    cost: 2, type: 'defend', attack: 0,  defense: 7,  description: 'Absorb incoming fire for one turn.' },
  { id: 7,  name: 'Ion Cleaver',        cost: 2, type: 'attack', attack: 9,  defense: 0,  description: 'Pierce enemy shields with focused energy.' },
  { id: 8,  name: 'Stabilize Matrix',   cost: 2, type: 'defend', attack: 1,  defense: 6,  description: 'Defend while slightly recharging systems.' },
  { id: 9,  name: 'Nano Lance',         cost: 3, type: 'attack', attack: 12, defense: 0,  description: 'High-impact strike that hurts through defenses.' },
  { id: 10, name: 'Fortress Protocol',  cost: 3, type: 'defend', attack: 0,  defense: 14, description: 'Build an advanced barrier around the core.' },
  { id: 11, name: 'Pulse Burst',        cost: 1, type: 'attack', attack: 5,  defense: 0,  description: 'Fast energy burst that disrupts the enemy.' },
  { id: 12, name: 'Kinetic Field',      cost: 2, type: 'defend', attack: 2,  defense: 5,  description: 'Generate a field to deflect incoming damage.' },
  { id: 13, name: 'Phase Strike',       cost: 2, type: 'attack', attack: 7,  defense: 1,  description: 'Strike and reframe your stabilizers.' },
  { id: 14, name: 'Aegis Feedback',     cost: 3, type: 'defend', attack: 3,  defense: 10, description: 'Reinforce shields and counterattack.' },
  { id: 15, name: 'EMP Shard',          cost: 1, type: 'attack', attack: 2,  defense: 0,  description: 'Weak attack that leaves the enemy exposed.' },
  { id: 16, name: 'Quantum Deflector',  cost: 2, type: 'defend', attack: 0,  defense: 8,  description: 'Redirect energy to keep the core safe.' },
  { id: 19, name: 'Spectral Strike',    cost: 3, type: 'attack', attack: 10, defense: 0,  description: 'A heavy attack that forces the enemy to react.' },
];

/** Returns all cards of the given type from the full deck. */
export const getDeckByType = (type) => FULL_DECK.filter((card) => card.type === type);

/** Shuffled draw pile for one card type. */
export function generateDeckByType(type) {
  const tag = type === 'attack' ? 'atk' : 'def';
  return shuffleDeck(
    getDeckByType(type).map((card) => ({
      ...card,
      instanceId: `${card.id}-deck-${tag}-${crypto.randomUUID()}`,
    }))
  );
}

/** Deal `count` cards from the top of a shuffled deck into a hand. */
function dealFromDeck(deck, count) {
  const pile = [...deck];
  const hand = pile.splice(0, count);
  return { hand, deck: pile };
}

/** Starting attack/defense hands (5 each) plus separate draw piles. */
export function createPlayerLoadout() {
  const attackDeck = generateDeckByType('attack');
  const defenseDeck = generateDeckByType('defend');

  const { hand: attackHand, deck: attackDeckRemaining } = dealFromDeck(attackDeck, ATTACK_HAND_SIZE);
  const { hand: defenseHand, deck: defenseDeckRemaining } = dealFromDeck(defenseDeck, DEFENSE_HAND_SIZE);

  return {
    attackHand,
    defenseHand,
    attackDeck: attackDeckRemaining,
    defenseDeck: defenseDeckRemaining,
  };
}

/** @deprecated Legacy single-hand generator — kept for reference only. */
export function generateStartingHand() {
  const attackDeck = generateDeckByType('attack');
  const defenseDeck = generateDeckByType('defend');
  return [
    ...dealFromDeck(attackDeck, ATTACK_HAND_SIZE).hand,
    ...dealFromDeck(defenseDeck, DEFENSE_HAND_SIZE).hand,
  ];
}

/** @deprecated Legacy unified deck — use generateDeckByType instead. */
export function generateDeck() {
  return shuffleDeck(
    FULL_DECK.map((card) => ({
      ...card,
      instanceId: `${card.id}-deck-${crypto.randomUUID()}`,
    }))
  );
}
