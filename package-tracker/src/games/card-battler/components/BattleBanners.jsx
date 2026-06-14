import { HeartCrack, Shield, Swords } from 'lucide-react';

const EVENT_STYLES = {
  attack: {
    shell: 'border-rose-500/60 bg-gradient-to-b from-rose-950/95 to-slate-950/95',
    badge: 'bg-rose-500/20 text-rose-300 ring-rose-500/40',
    stat: 'text-rose-300',
    icon: Swords,
    label: 'Your Attack',
  },
  defense: {
    shell: 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/95 to-slate-950/95',
    badge: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/40',
    stat: 'text-emerald-300',
    icon: Shield,
    label: 'Your Defense',
  },
  damage: {
    shell: 'border-rose-500/60 bg-gradient-to-b from-rose-950/95 to-slate-950/95',
    badge: 'bg-rose-500/20 text-rose-300 ring-rose-500/40',
    stat: 'text-rose-300',
    icon: HeartCrack,
    label: 'Damage Taken',
  },
  'enemy-attack': {
    shell: 'border-rose-500/60 bg-gradient-to-b from-rose-900/95 to-slate-950/95',
    badge: 'bg-rose-500/20 text-rose-200 ring-rose-500/40',
    stat: 'text-rose-200',
    icon: Swords,
    label: 'Opponent Attack',
  },
  'enemy-defense': {
    shell: 'border-amber-500/60 bg-gradient-to-b from-amber-950/95 to-slate-950/95',
    badge: 'bg-amber-500/20 text-amber-300 ring-amber-500/40',
    stat: 'text-amber-300',
    icon: Shield,
    label: 'Opponent Defense',
  },
};

function PhaseBanner({ banner, slidingOut }) {
  const { visible, title, subtitle, combatPhase, isPlayerTurn } = banner;
  const isAttack = combatPhase === 'attack-phase';

  const shell = isAttack
    ? 'border-rose-500/60 bg-gradient-to-b from-rose-950/95 to-slate-950/95'
    : 'border-amber-500/60 bg-gradient-to-b from-amber-950/95 to-slate-950/95';

  return (
    <div
      className={`fixed left-1/2 top-24 z-40 w-[min(92vw,30rem)] -translate-x-1/2 rounded-2xl border ${shell} px-5 py-4 shadow-2xl transition-all duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${slidingOut ? '-translate-y-16 opacity-0' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isPlayerTurn ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-slate-700/80 text-slate-300 ring-1 ring-slate-600'}`}
        >
          {title}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${isAttack ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40' : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'}`}
        >
          {isAttack ? <Swords className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
          {isAttack ? 'Attack Phase' : 'Defense Phase'}
        </span>
      </div>
      <p className="mt-3 text-center text-sm leading-relaxed text-slate-200">{subtitle}</p>
    </div>
  );
}

function EventBanner({ banner, slidingOut }) {
  const { visible, title, subtitle, variant, stat, statLabel } = banner;
  const style = EVENT_STYLES[variant] ?? EVENT_STYLES.attack;
  const Icon = style.icon;

  return (
    <div
      className={`fixed left-1/2 top-24 z-40 w-[min(92vw,30rem)] -translate-x-1/2 rounded-2xl border ${style.shell} px-5 py-4 shadow-2xl transition-all duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${slidingOut ? '-translate-y-16 opacity-0' : ''}`}
    >
      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${style.badge}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {style.label}
        </span>
      </div>
      {stat !== undefined && (
        <div className="mt-3 text-center">
          <p className={`text-4xl font-black tabular-nums ${style.stat}`}>{stat}</p>
          {statLabel && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{statLabel}</p>}
        </div>
      )}
      <h2 className="mt-3 text-center text-base font-bold text-white">{title}</h2>
      <p className="mt-1 text-center text-sm leading-relaxed text-slate-300">{subtitle}</p>
    </div>
  );
}

function Banner({ top, border, bg, label, title, subtitle, visible, slidingOut, extra }) {
  return (
    <div className={`fixed left-1/2 ${top} z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-3xl border ${border} ${bg} p-4 text-center shadow-2xl transition-all duration-500 ease-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${slidingOut ? '-translate-y-16 opacity-0' : ''}`}>
      <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{label}</p>
      <h2 className="mt-2 text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
      {extra}
    </div>
  );
}

export default function BattleBanners({
  startingBanner,
  startingBannerSlidingOut,
  phaseBanner,
  phaseSlidingOut,
  attackBanner,
  attackBannerSlidingOut,
  defenseBanner,
  defenseBannerSlidingOut,
  playerDamageBanner,
  playerDamageBannerSlidingOut,
  enemyAttackBanner,
  enemyAttackBannerSlidingOut,
  enemyDefenseBanner,
  enemyDefenseBannerSlidingOut,
}) {
  return (
    <>
      <Banner
        top="top-6"
        border="border-amber-500"
        bg="bg-amber-600/95"
        label="Game Start"
        title={startingBanner.title}
        subtitle={startingBanner.subtitle}
        visible={startingBanner.visible}
        slidingOut={startingBannerSlidingOut}
      />
      <PhaseBanner banner={phaseBanner} slidingOut={phaseSlidingOut} />
      <EventBanner banner={attackBanner} slidingOut={attackBannerSlidingOut} />
      <EventBanner banner={defenseBanner} slidingOut={defenseBannerSlidingOut} />
      <EventBanner banner={playerDamageBanner} slidingOut={playerDamageBannerSlidingOut} />
      <EventBanner banner={enemyAttackBanner} slidingOut={enemyAttackBannerSlidingOut} />
      <EventBanner banner={enemyDefenseBanner} slidingOut={enemyDefenseBannerSlidingOut} />
    </>
  );
}
