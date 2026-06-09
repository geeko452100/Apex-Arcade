import { createPlayerLoadout } from './cards';
import { INITIAL_ENERGY, INITIAL_HP } from './gameLogic';

/**
 * The blank player slot used as the canonical shape for both players.
 * Kept as a factory so each call gets a fresh object — avoids shared-reference bugs
 * that would occur if initialGameState.player_1 were mutated.
 */
const createBlankPlayer = () => ({
  hp: INITIAL_HP,
  energy: INITIAL_ENERGY,
  block: 0,
  attackHand: [],
  defenseHand: [],
  staged: [],
  attackDiscard: [],
  defenseDiscard: [],
  attackDeck: [],
  defenseDeck: [],
});

/**
 * The zero-value game state used as the reducer's default.
 * Do NOT mutate this object — always spread or use createNewGameState().
 */
export const initialGameState = {
  player_1_id:      null,
  player_2_id:      null,
  turnOwner:        null,
  combatPhase:      'attack-phase',
  turnExpiration:   null,
  isFirstTurnOfGame: true,
  gameOver:         null,
  stateVersion:     0,
  player_1:         createBlankPlayer(),
  player_2:         createBlankPlayer(),
};

/**
 * Returns a fully initialized game state with dealt starting hands.
 * @param {string|number} player1Id
 * @param {string|number} player2Id
 */
export const createNewGameState = (player1Id, player2Id) => ({
  ...initialGameState,
  player_1_id:       player1Id,
  player_2_id:       player2Id,
  turnOwner:         player1Id,
  combatPhase:       'defense-phase',
  isFirstTurnOfGame: true,
  turnExpiration:    Date.now() + 30_000,
  stateVersion:      0,
  player_1: { ...createBlankPlayer(), ...createPlayerLoadout() },
  player_2: { ...createBlankPlayer(), ...createPlayerLoadout() },
});
