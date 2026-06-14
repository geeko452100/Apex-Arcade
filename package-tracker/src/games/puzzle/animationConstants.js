import { WORD_LENGTH } from './initialState';

export const TILE_FLIP_DELAY_MS = 300;
export const TILE_FLIP_DURATION_MS = 500;
export const REVEAL_BUFFER_MS = 200;

export function getRevealDurationMs() {
  return (WORD_LENGTH - 1) * TILE_FLIP_DELAY_MS + TILE_FLIP_DURATION_MS + REVEAL_BUFFER_MS;
}
