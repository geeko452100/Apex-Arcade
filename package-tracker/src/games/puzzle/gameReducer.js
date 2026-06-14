import { MAX_GUESSES, WORD_LENGTH, createInitialState } from './initialState';
import {
  evaluateGuess,
  isValidWord,
  mergeLetterStates,
  normalizeLoadedState,
  updateStatsOnEnd,
  loadStats,
  createStateForDate,
} from './gameLogic';

export function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE': {
      const savedStats = loadStats(action.userId);
      const normalized = normalizeLoadedState(action.payload, action.puzzleDate, savedStats);
      return normalized ?? state;
    }

    case 'RESET_FOR_NEW_DAY':
      return createStateForDate(action.puzzleDate, action.userId) ?? createInitialState(action.puzzleDate);

    case 'TYPE_LETTER': {
      if (state.gameStatus !== 'playing') return state;
      if (state.currentGuess.length >= WORD_LENGTH) return state;

      return {
        ...state,
        currentGuess: state.currentGuess + action.letter.toUpperCase(),
        errorMessage: null,
      };
    }

    case 'DELETE_LETTER': {
      if (state.gameStatus !== 'playing') return state;
      if (state.currentGuess.length === 0) return state;

      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
        errorMessage: null,
      };
    }

    case 'CLEAR_ERROR':
      return { ...state, errorMessage: null };

    case 'SUBMIT_GUESS': {
      if (state.gameStatus !== 'playing') return state;

      const guess = state.currentGuess.toUpperCase();

      if (guess.length < WORD_LENGTH) {
        return {
          ...state,
          errorMessage: 'Not enough letters',
          errorNonce: (state.errorNonce ?? 0) + 1,
        };
      }

      if (!isValidWord(guess)) {
        return {
          ...state,
          errorMessage: 'Not in word list',
          errorNonce: (state.errorNonce ?? 0) + 1,
        };
      }

      const evaluation = evaluateGuess(guess, state.targetWord);
      const guesses = [...state.guesses, { word: guess, evaluation }];
      const letterStates = mergeLetterStates(state.letterStates, guess, evaluation);
      const won = guess === state.targetWord;
      const lost = !won && guesses.length >= MAX_GUESSES;
      const gameStatus = won ? 'won' : lost ? 'lost' : 'playing';

      return {
        ...state,
        guesses,
        currentGuess: '',
        letterStates,
        gameStatus,
        errorMessage: null,
        stats: won || lost ? updateStatsOnEnd(state.stats, won, state.puzzleDate) : state.stats,
      };
    }

    default:
      return state;
  }
}
