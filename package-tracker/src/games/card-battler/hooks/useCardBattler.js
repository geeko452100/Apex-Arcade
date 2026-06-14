// BUG FIX: CardBattlerEngine calls useCardBattler() with NO arguments and handles
// all syncAndBroadcast calls itself. The original hook accepted myUserId and
// syncAndBroadcast as params, then re-derived actions that CardBattlerEngine
// already re-derived externally — causing double-dispatch and double-broadcast.
//
// This version is the clean contract:
//   - Owns only local state via useReducer.
//   - Exposes localDispatch for the engine to drive.
//   - The engine computes next states and broadcasts; this hook just holds state.

import { useReducer } from 'react';
import { gameReducer } from '../gameReducer';
import { initialGameState } from '../initialState';

export function useCardBattler() {
  // BUG FIX: initialGameState (not null) is the correct initial value.
  // Passing null caused the reducer to receive null as state on first render,
  // bypassing the default parameter and crashing on state.player_1_id access.
  const [gameState, localDispatch] = useReducer(gameReducer, initialGameState);

  return { gameState, localDispatch };
}
