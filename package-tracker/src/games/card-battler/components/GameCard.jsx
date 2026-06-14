import { Shield, ShieldAlert, Swords } from 'lucide-react';

export default function GameCard({
  card,
  onClick,
  canAfford,
  isPlayable,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  clickable,
  disabledReason,
  hint,
  className,
}) {
  const isStaged = Boolean(clickable && !isPlayable);
  const isDisabled = !isPlayable && !isStaged;
  const isClickable = Boolean(onClick && (isPlayable || clickable));

  const stateStyles = isPlayable
    ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/30 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(52,211,153,0.5)]'
    : isStaged
      ? 'border-indigo-400/80 shadow-lg ring-1 ring-indigo-400/25 hover:-translate-y-1 hover:border-indigo-300'
      : 'border-slate-800 opacity-55 saturate-50';

  const cursorStyles = isPlayable || isStaged
    ? (draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer')
    : 'cursor-default';

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => isClickable && onClick(card.instanceId)}
      title={disabledReason || hint || undefined}
      className={`${className ?? 'w-40 h-56'} relative bg-slate-950 border rounded-xl p-3 flex flex-col justify-between shadow-2xl transition-all duration-200 select-none ${stateStyles} ${cursorStyles}`}
    >
      {isStaged && hint && (
        <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md">
          {hint}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs font-black tracking-wide text-slate-200 truncate max-w-[70%]">{card.name}</span>
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border
          ${canAfford !== false ? 'bg-indigo-950 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
        >
          {card.cost}
        </span>
      </div>

      <div className="flex-1 my-2 rounded-lg bg-slate-900 border border-slate-800/50 flex items-center justify-center text-slate-600">
        {card.type === 'attack'
          ? <Swords className="w-8 h-8 text-rose-500/40" />
          : <Shield className="w-8 h-8 text-emerald-400/40" />}
      </div>

      <p className="text-[10px] text-slate-400 text-center leading-tight mb-2 min-h-[24px]">
        {card.description}
      </p>

      <div className="flex justify-around items-center border-t border-slate-800/50 pt-2 text-xs font-bold">
        <span className="flex items-center gap-1 text-rose-400">
          <Swords className="w-3.5 h-3.5" /> {card.attack}
        </span>
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldAlert className="w-3.5 h-3.5" /> {card.defense}
        </span>
      </div>

      {isDisabled && disabledReason && (
        <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-slate-950/95 px-2 py-1.5 text-center text-[9px] font-semibold leading-tight text-slate-400 border-t border-slate-800/80">
          {disabledReason}
        </div>
      )}
    </div>
  );
}
