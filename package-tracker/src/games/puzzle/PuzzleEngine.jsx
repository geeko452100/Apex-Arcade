import { useEffect, useRef, useState } from 'react';
import { Loader2, Puzzle } from 'lucide-react';
import { usePuzzleGame } from './hooks/usePuzzleGame';
import PuzzleGrid from './components/PuzzleGrid';
import PuzzleKeyboard from './components/PuzzleKeyboard';
import PuzzleStats from './components/PuzzleStats';
import { getRevealDurationMs, TILE_FLIP_DELAY_MS, TILE_FLIP_DURATION_MS } from './animationConstants';
import { WORD_LENGTH } from './initialState';

const LETTER_PRIORITY = { correct: 3, present: 2, absent: 1 };

function mergeDisplayedLetter(displayed, letter, status) {
  const existing = displayed[letter];
  if (existing && LETTER_PRIORITY[existing] >= LETTER_PRIORITY[status]) {
    return displayed;
  }
  return { ...displayed, [letter]: status };
}

function PuzzleBoard({
  state,
  scoreStatus,
  typeLetter,
  deleteLetter,
  submitGuess,
  clearError,
}) {
  const [animatedGuessCount, setAnimatedGuessCount] = useState(state.guesses.length);
  const [displayedLetterStates, setDisplayedLetterStates] = useState(state.letterStates);
  const [popIndex, setPopIndex] = useState(-1);
  const [isShaking, setIsShaking] = useState(false);
  const prevGuessLengthRef = useRef(state.currentGuess.length);
  const prevErrorNonceRef = useRef(state.errorNonce ?? 0);

  const isRevealing = state.guesses.length > animatedGuessCount;
  const isPlaying = state.gameStatus === 'playing';
  const isInteractive = isPlaying && !isRevealing;

  useEffect(() => {
    if (state.guesses.length <= animatedGuessCount) return undefined;

    const targetCount = state.guesses.length;
    const latestGuess = state.guesses[targetCount - 1];
    const finalLetterStates = state.letterStates;

    const timers = [];

    if (latestGuess?.word && latestGuess?.evaluation) {
      for (let col = 0; col < WORD_LENGTH; col += 1) {
        const delay = col * TILE_FLIP_DELAY_MS + TILE_FLIP_DURATION_MS;
        timers.push(setTimeout(() => {
          const letter = latestGuess.word[col];
          const status = latestGuess.evaluation[col];
          setDisplayedLetterStates((prev) => mergeDisplayedLetter(prev, letter, status));
        }, delay));
      }
    }

    timers.push(setTimeout(() => {
      setAnimatedGuessCount(targetCount);
      setDisplayedLetterStates(finalLetterStates);
    }, getRevealDurationMs()));

    return () => {
      timers.forEach(clearTimeout);
    };
  // Only react to a new submitted row; snapshot guess data when the count changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- guesses/letterStates read at trigger time
  }, [state.guesses.length, animatedGuessCount]);

  useEffect(() => {
    const len = state.currentGuess.length;

    if (len > prevGuessLengthRef.current) {
      setPopIndex(len - 1);
      const timer = setTimeout(() => setPopIndex(-1), 120);
      prevGuessLengthRef.current = len;
      return () => clearTimeout(timer);
    }

    prevGuessLengthRef.current = len;
    return undefined;
  }, [state.currentGuess]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!isInteractive) return;

      const key = event.key.toUpperCase();

      if (key === 'ENTER') {
        event.preventDefault();
        submitGuess();
        return;
      }

      if (key === 'BACKSPACE') {
        event.preventDefault();
        deleteLetter();
        return;
      }

      if (/^[A-Z]$/.test(key) && key.length === 1) {
        event.preventDefault();
        typeLetter(key);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInteractive, typeLetter, deleteLetter, submitGuess]);

  useEffect(() => {
    if (state.errorNonce <= prevErrorNonceRef.current) return undefined;

    prevErrorNonceRef.current = state.errorNonce;
    setIsShaking(false);
    const startTimer = requestAnimationFrame(() => setIsShaking(true));

    const shakeTimer = setTimeout(() => setIsShaking(false), 450);
    const errorTimer = setTimeout(clearError, 1500);

    return () => {
      cancelAnimationFrame(startTimer);
      clearTimeout(shakeTimer);
      clearTimeout(errorTimer);
    };
  }, [state.errorNonce, clearError]);

  function handleKeyPress(key) {
    if (!isInteractive) return;

    if (key === 'ENTER') {
      submitGuess();
      return;
    }

    if (key === '⌫') {
      deleteLetter();
      return;
    }

    typeLetter(key);
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className={`space-y-8 ${isShaking ? 'animate-screen-shake' : ''}`}>
        <PuzzleGrid
          guesses={state.guesses}
          currentGuess={state.currentGuess}
          gameStatus={state.gameStatus}
          errorMessage={state.errorMessage}
          animatedGuessCount={animatedGuessCount}
          revealKey={state.guesses.length}
          popIndex={popIndex}
        />
        <PuzzleKeyboard
          letterStates={displayedLetterStates}
          onKeyPress={handleKeyPress}
          disabled={!isInteractive}
        />
      </div>

      <PuzzleStats state={state} scoreStatus={scoreStatus} />
    </div>
  );
}

export default function PuzzleEngine({ userId }) {
  const {
    state,
    loadStatus,
    scoreStatus,
    typeLetter,
    deleteLetter,
    submitGuess,
    clearError,
  } = usePuzzleGame(userId);

  if (loadStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-sm font-medium">Loading today&apos;s puzzle...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Puzzle className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest font-mono">
              Daily Word Engine
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Daily Puzzle</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Guess the 5-letter word in six tries. Green means correct spot, gold means wrong spot.
          </p>
        </div>
      </div>

      <PuzzleBoard
        key={state.puzzleDate}
        state={state}
        scoreStatus={scoreStatus}
        typeLetter={typeLetter}
        deleteLetter={deleteLetter}
        submitGuess={submitGuess}
        clearError={clearError}
      />
    </div>
  );
}
