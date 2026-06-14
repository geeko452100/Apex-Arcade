const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const KEY_COLORS = {
  correct: 'bg-emerald-600 text-white border-emerald-500',
  present: 'bg-amber-500 text-white border-amber-400',
  absent: 'bg-slate-700 text-slate-400 border-slate-600',
  unused: 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700',
};

function getKeyClass(letter, letterStates, disabled) {
  const status = letterStates[letter] ?? 'unused';
  const base = KEY_COLORS[status] ?? KEY_COLORS.unused;
  return `${base} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
}

export default function PuzzleKeyboard({
  letterStates,
  onKeyPress,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-lg mx-auto select-none">
      {ROWS.map((row) => (
        <div key={row.join('-')} className="flex gap-1.5 justify-center">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKeyPress(key)}
                className={`${isWide ? 'px-3 min-w-[3.5rem]' : 'w-10'} h-14 rounded-md border text-xs sm:text-sm font-bold uppercase transition-colors ${getKeyClass(key, letterStates, disabled)}`}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
