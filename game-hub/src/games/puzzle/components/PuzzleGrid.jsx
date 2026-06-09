import { MAX_GUESSES, WORD_LENGTH } from '../initialState';
import { TILE_FLIP_DELAY_MS } from '../animationConstants';

const TILE_COLORS = {
  correct: 'bg-emerald-600 border-emerald-500 text-white',
  present: 'bg-amber-500 border-amber-400 text-white',
  absent: 'bg-slate-700 border-slate-600 text-slate-300',
  empty: 'bg-slate-900 border-slate-700 text-white',
  current: 'bg-slate-800 border-slate-500 text-white',
  submitted: 'bg-slate-700 border-slate-500 text-white',
};

function StaticTile({ letter, status, pop }) {
  const colorClass = TILE_COLORS[status] ?? TILE_COLORS.submitted;

  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl font-black uppercase border-2 rounded-md ${colorClass} ${pop ? 'animate-pop' : ''}`}
    >
      {letter}
    </div>
  );
}

function FlipTile({ letter, status, colIndex, revealKey, pop }) {
  return (
    <div className="puzzle-tile-scene">
      <div
        key={`${revealKey}-${colIndex}`}
        className="puzzle-tile-flipper puzzle-tile-flipper--active"
        style={{ animationDelay: `${colIndex * TILE_FLIP_DELAY_MS}ms` }}
      >
        <div
          className={`puzzle-tile-face text-2xl font-black uppercase border-2 ${TILE_COLORS.submitted} ${pop ? 'animate-pop' : ''}`}
        >
          {letter}
        </div>
        <div
          className={`puzzle-tile-face puzzle-tile-face-back text-2xl font-black uppercase border-2 ${TILE_COLORS[status] ?? TILE_COLORS.absent}`}
        >
          {letter}
        </div>
      </div>
    </div>
  );
}

function Tile({ letter, status, isFlipping, colIndex, revealKey, pop }) {
  if (isFlipping) {
    return (
      <FlipTile
        letter={letter}
        status={status}
        colIndex={colIndex}
        revealKey={revealKey}
        pop={pop}
      />
    );
  }

  return <StaticTile letter={letter} status={status} pop={pop} />;
}

export default function PuzzleGrid({
  guesses,
  currentGuess,
  gameStatus,
  errorMessage,
  animatedGuessCount,
  revealKey,
  popIndex,
}) {
  const rows = [];

  for (let row = 0; row < MAX_GUESSES; row += 1) {
    const guessEntry = guesses[row];
    const isCurrentRow = row === guesses.length && gameStatus === 'playing';
    const isAnimatingRow = Boolean(guessEntry)
      && row === guesses.length - 1
      && guesses.length > animatedGuessCount;
    const isWinRow = gameStatus === 'won' && row === guesses.length - 1 && !isAnimatingRow;

    const letters = guessEntry
      ? guessEntry.word.split('')
      : isCurrentRow
        ? currentGuess.padEnd(WORD_LENGTH, ' ').split('')
        : Array(WORD_LENGTH).fill('');

    const statuses = guessEntry
      ? guessEntry.evaluation
      : letters.map((letter) => {
          if (!isCurrentRow) return 'empty';
          return letter.trim() ? 'current' : 'empty';
        });

    rows.push(
      <div
        key={row}
        className={`flex gap-2 justify-center ${isWinRow ? 'animate-win-bounce' : ''}`}
      >
        {letters.map((letter, col) => (
          <Tile
            key={`${row}-${col}-${revealKey}`}
            letter={letter.trim()}
            status={statuses[col] ?? 'absent'}
            isFlipping={isAnimatingRow}
            colIndex={col}
            revealKey={revealKey}
            pop={isCurrentRow && col === popIndex}
          />
        ))}
      </div>,
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows}
      {errorMessage && (
        <p className="text-center text-sm text-red-400 font-medium mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
