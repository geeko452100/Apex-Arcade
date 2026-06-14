import { initialGameState, createNewGameState } from './initialState';
import { handlePvPReducer } from './pvpLogic';

/**
 * Root reducer for the card battler game.
 * Delegates all PvP mutations to handlePvPReducer; owns only meta-level actions here.
 *
 * @param {typeof initialGameState} state
 * @param {{ type: string, payload?: any }} action
 */
export function gameReducer(state = initialGameState, action) {
  switch (action.type) {

    case 'INITIALIZE_GAME': {
      const { player1Id, player2Id } = action.payload ?? {};

      if (!player1Id) {
        console.warn('gameReducer: INITIALIZE_GAME called without a valid player1Id.');
        return state;
      }

      return createNewGameState(player1Id, player2Id);
    }

    // Blind-replace local state with the authoritative server snapshot.
    case 'SYNC_FROM_SERVER':
      return action.payload ?? state;

    case 'STAGE_CARD':
    case 'UNSTAGE_CARD':
    case 'EXECUTE_ATTACK':
    case 'EXECUTE_DEFENSE':
    case 'NEXT_PHASE':
    case 'DISCARD_CARD':
      return handlePvPReducer(state, action);

    case 'RESET_GAME':
      return createNewGameState(state.player_1_id, state.player_2_id);

    default:
      return state;
  }
}
