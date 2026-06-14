import { getDailyWord, getTodayDate } from './gameLogic';

export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;

export function createInitialState(puzzleDate = getTodayDate()) {
  return {
    puzzleDate,
    targetWord: getDailyWord(puzzleDate),
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    letterStates: {},
    errorMessage: null,
    errorNonce: 0,
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
    },
  };
}
