import { ANSWER_WORDS, VALID_GUESSES } from './wordList';
import { MAX_GUESSES, WORD_LENGTH } from './initialState';

export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDailyWord(dateStr) {
  const index = hashDate(dateStr) % ANSWER_WORDS.length;
  return ANSWER_WORDS[index];
}

export function isValidWord(word) {
  return VALID_GUESSES.has(word.toUpperCase());
}

export function evaluateGuess(guess, answer) {
  const normalizedGuess = guess.toUpperCase();
  const normalizedAnswer = answer.toUpperCase();
  const result = Array(WORD_LENGTH).fill('absent');
  const answerCounts = {};

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const letter = normalizedAnswer[i];
    answerCounts[letter] = (answerCounts[letter] ?? 0) + 1;
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (normalizedGuess[i] === normalizedAnswer[i]) {
      result[i] = 'correct';
      answerCounts[normalizedGuess[i]] -= 1;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] === 'correct') continue;
    const letter = normalizedGuess[i];
    if (answerCounts[letter] > 0) {
      result[i] = 'present';
      answerCounts[letter] -= 1;
    }
  }

  return result;
}

export function mergeLetterStates(existing, guess, evaluation) {
  const priority = { correct: 3, present: 2, absent: 1 };
  const next = { ...existing };

  for (let i = 0; i < guess.length; i += 1) {
    const letter = guess[i];
    const status = evaluation[i];
    if (!next[letter] || priority[status] > priority[next[letter]]) {
      next[letter] = status;
    }
  }

  return next;
}

function storageKey(userId, puzzleDate) {
  return `puzzle:${userId}:${puzzleDate}`;
}

function statsKey(userId) {
  return `puzzle:${userId}:stats`;
}

export function loadStats(userId) {
  try {
    const raw = localStorage.getItem(statsKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistStats(userId, stats) {
  localStorage.setItem(statsKey(userId), JSON.stringify(stats));
}

function getYesterdayDate(dateStr) {
  const date = new Date(`${dateStr}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function updateStatsOnEnd(stats, won, puzzleDate) {
  const gamesPlayed = stats.gamesPlayed + 1;
  const gamesWon = won ? stats.gamesWon + 1 : stats.gamesWon;
  const yesterday = getYesterdayDate(puzzleDate);

  let currentStreak = 0;
  if (won) {
    if (stats.lastPlayedDate === yesterday) {
      currentStreak = stats.currentStreak + 1;
    } else if (stats.lastPlayedDate === puzzleDate) {
      currentStreak = stats.currentStreak;
    } else {
      currentStreak = 1;
    }
  }

  return {
    gamesPlayed,
    gamesWon,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastPlayedDate: puzzleDate,
  };
}

export function loadSave(userId, puzzleDate) {
  try {
    const raw = localStorage.getItem(storageKey(userId, puzzleDate));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistSave(userId, state) {
  const payload = {
    guesses: state.guesses,
    currentGuess: state.currentGuess,
    gameStatus: state.gameStatus,
    letterStates: state.letterStates,
    lastSavedAt: Date.now(),
  };

  localStorage.setItem(storageKey(userId, state.puzzleDate), JSON.stringify(payload));
  persistStats(userId, state.stats);
  return payload;
}

function defaultStats(savedStats) {
  return {
    gamesPlayed: savedStats?.gamesPlayed ?? 0,
    gamesWon: savedStats?.gamesWon ?? 0,
    currentStreak: savedStats?.currentStreak ?? 0,
    maxStreak: savedStats?.maxStreak ?? 0,
    lastPlayedDate: savedStats?.lastPlayedDate ?? null,
  };
}

function normalizeGuesses(rawGuesses, targetWord) {
  if (!Array.isArray(rawGuesses)) return [];

  return rawGuesses.slice(0, MAX_GUESSES).map((entry) => {
    const word = typeof entry?.word === 'string' ? entry.word.toUpperCase().slice(0, WORD_LENGTH) : '';
    if (!word) return null;

    const hasEvaluation = Array.isArray(entry.evaluation) && entry.evaluation.length === WORD_LENGTH;
    const evaluation = hasEvaluation ? entry.evaluation : evaluateGuess(word, targetWord);

    return { word, evaluation };
  }).filter(Boolean);
}

function rebuildLetterStates(guesses, savedLetterStates) {
  if (guesses.length === 0) {
    return savedLetterStates ?? {};
  }

  return guesses.reduce(
    (acc, guess) => mergeLetterStates(acc, guess.word, guess.evaluation),
    {},
  );
}

export function normalizeLoadedState(payload, puzzleDate, savedStats) {
  if (!payload || typeof payload !== 'object') return null;

  const targetWord = getDailyWord(puzzleDate);
  const guesses = normalizeGuesses(payload.guesses, targetWord);
  const currentGuess = typeof payload.currentGuess === 'string'
    ? payload.currentGuess.slice(0, WORD_LENGTH)
    : '';

  return {
    puzzleDate,
    targetWord,
    guesses,
    currentGuess,
    gameStatus: payload.gameStatus === 'won' || payload.gameStatus === 'lost'
      ? payload.gameStatus
      : 'playing',
    letterStates: rebuildLetterStates(guesses, payload.letterStates),
    errorMessage: null,
    errorNonce: 0,
    stats: defaultStats(savedStats),
  };
}

export function createStateForDate(puzzleDate, userId) {
  const savedStats = loadStats(userId);
  return {
    ...normalizeLoadedState(
      {
        guesses: [],
        currentGuess: '',
        gameStatus: 'playing',
        letterStates: {},
      },
      puzzleDate,
      savedStats,
    ),
  };
}
