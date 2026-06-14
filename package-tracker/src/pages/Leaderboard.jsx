import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Cpu, Loader2, Puzzle, Swords, Trophy } from 'lucide-react';
import { formatMoney } from '@/games/idle/gameLogic';
import {
  fetchCardBattlerLeaderboard,
  fetchCardBattlerUserRank,
  fetchIdleLeaderboard,
  fetchIdleUserRank,
  fetchPuzzleLeaderboard,
  fetchPuzzleUserRank,
  getTodayPuzzleDate,
} from '@/lib/leaderboard/cloudPersistence';
import { useLeaderboardTab } from '@/lib/leaderboard/hooks/useLeaderboardTab';
import {
  formatCompletedTime,
  formatPlayerName,
  formatPuzzleDate,
  formatWinLoss,
} from '@/lib/leaderboard/formatters';

const TABS = [
  {
    id: 'cards',
    label: 'Card Battler',
    icon: Swords,
    accent: 'emerald',
    playPath: '/game/cards',
    description: 'Ranked by total wins. Tie-breaker: fewer losses.',
  },
  {
    id: 'idle',
    label: 'Tycoon Terminal',
    icon: Cpu,
    accent: 'amber',
    playPath: '/game/idle',
    description: 'Ranked by lifetime income (all runs + current run).',
  },
  {
    id: 'puzzle',
    label: 'Daily Puzzle',
    icon: Puzzle,
    accent: 'cyan',
    playPath: '/game/puzzle',
    description: "Today's solves — fewer guesses wins; ties broken by finish time.",
  },
];

const ACCENT_STYLES = {
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    tabActive: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20',
    tabIdle: 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10',
    highlight: 'bg-emerald-500/10',
    rank: 'text-emerald-400',
    you: 'text-emerald-500',
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    tabActive: 'bg-amber-600 text-white shadow-lg shadow-amber-600/20',
    tabIdle: 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10',
    highlight: 'bg-amber-500/10',
    rank: 'text-amber-400',
    you: 'text-amber-500',
  },
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    tabActive: 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20',
    tabIdle: 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10',
    highlight: 'bg-cyan-500/10',
    rank: 'text-cyan-400',
    you: 'text-cyan-500',
  },
};

function LoadingState({ accent }) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-slate-400">
      <Loader2 className={`w-8 h-8 animate-spin ${styles.text}`} />
      <p className="text-sm font-medium">Loading leaderboard...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="text-red-400 font-medium">Could not load leaderboard.</p>
      <p className="text-sm text-slate-400 mt-1">Check your connection and try again.</p>
    </div>
  );
}

function EmptyState({ accent, message, playPath, playLabel }) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
      <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <p className="text-slate-400">{message}</p>
      <Link
        to={playPath}
        className={`inline-block mt-4 text-sm font-semibold ${styles.text} hover:opacity-80`}
      >
        {playLabel} →
      </Link>
    </div>
  );
}

function UserRankBanner({ accent, children }) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4 flex flex-wrap items-center justify-between gap-3`}>
      {children}
    </div>
  );
}

function CardBattlerTab({ userId, accent }) {
  const styles = ACCENT_STYLES[accent];
  const { loadStatus, entries, userRank } = useLeaderboardTab(
    userId,
    fetchCardBattlerLeaderboard,
    fetchCardBattlerUserRank,
  );

  if (loadStatus === 'loading') return <LoadingState accent={accent} />;
  if (loadStatus === 'error') return <ErrorState />;

  return (
    <div className="space-y-6">
      {userRank && (
        <UserRankBanner accent={accent}>
          <div>
            <p className={`text-xs uppercase tracking-widest ${styles.text} font-mono`}>Your Rank</p>
            <p className="text-2xl font-black text-white mt-1">#{userRank.rank}</p>
          </div>
          <p className="text-sm text-slate-400 font-mono">
            {formatWinLoss(userRank.wins, userRank.losses)}
          </p>
        </UserRankBanner>
      )}

      {entries.length === 0 ? (
        <EmptyState
          accent={accent}
          message="No matches recorded yet. Win your first battle to appear here!"
          playPath="/game/cards"
          playLabel="Play Card Battler"
        />
      ) : (
        <LeaderboardTable
          accent={accent}
          columns={[
            { key: 'rank', label: 'Rank', align: 'left', width: '3rem' },
            { key: 'player', label: 'Player', align: 'left' },
            { key: 'wins', label: 'Wins', align: 'right', width: '4rem' },
            { key: 'record', label: 'Record', align: 'right', width: '6rem' },
          ]}
          rows={entries.map((entry, index) => ({
            key: entry.user_id,
            isCurrentUser: entry.user_id === userId,
            rank: index + 1,
            cells: [
              index + 1,
              formatPlayerName(entry),
              entry.wins,
              formatWinLoss(entry.wins, entry.losses),
            ],
          }))}
        />
      )}
    </div>
  );
}

function IdleTab({ userId, accent }) {
  const styles = ACCENT_STYLES[accent];
  const { loadStatus, entries, userRank } = useLeaderboardTab(
    userId,
    fetchIdleLeaderboard,
    fetchIdleUserRank,
  );

  if (loadStatus === 'loading') return <LoadingState accent={accent} />;
  if (loadStatus === 'error') return <ErrorState />;

  return (
    <div className="space-y-6">
      {userRank && (
        <UserRankBanner accent={accent}>
          <div>
            <p className={`text-xs uppercase tracking-widest ${styles.text} font-mono`}>Your Rank</p>
            <p className="text-2xl font-black text-white mt-1">#{userRank.rank}</p>
          </div>
          <p className="text-sm text-slate-400 font-mono">
            {formatMoney(userRank.lifetimeTotal)}
          </p>
        </UserRankBanner>
      )}

      {entries.length === 0 ? (
        <EmptyState
          accent={accent}
          message="No tycoons on the board yet. Start earning to claim a spot!"
          playPath="/game/idle"
          playLabel="Play Tycoon Terminal"
        />
      ) : (
        <LeaderboardTable
          accent={accent}
          columns={[
            { key: 'rank', label: 'Rank', align: 'left', width: '3rem' },
            { key: 'player', label: 'Player', align: 'left' },
            { key: 'income', label: 'Lifetime Income', align: 'right', width: '8rem' },
          ]}
          rows={entries.map((entry, index) => ({
            key: entry.user_id,
            isCurrentUser: entry.user_id === userId,
            rank: index + 1,
            cells: [
              index + 1,
              formatPlayerName(entry),
              formatMoney(entry.lifetimeTotal),
            ],
          }))}
        />
      )}
    </div>
  );
}

function PuzzleTab({ userId, accent }) {
  const puzzleDate = getTodayPuzzleDate();
  const styles = ACCENT_STYLES[accent];
  const { loadStatus, entries, userRank } = useLeaderboardTab(
    userId,
    () => fetchPuzzleLeaderboard(puzzleDate),
    (id) => fetchPuzzleUserRank(id, puzzleDate),
    [puzzleDate],
  );

  if (loadStatus === 'loading') return <LoadingState accent={accent} />;
  if (loadStatus === 'error') return <ErrorState />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        {formatPuzzleDate(puzzleDate)}
      </p>

      {userRank && (
        <UserRankBanner accent={accent}>
          <div>
            <p className={`text-xs uppercase tracking-widest ${styles.text} font-mono`}>Your Rank Today</p>
            <p className="text-2xl font-black text-white mt-1">#{userRank.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">
              {userRank.guessesUsed} {userRank.guessesUsed === 1 ? 'guess' : 'guesses'}
            </p>
            <p className="text-xs text-slate-500">
              Finished at {formatCompletedTime(userRank.completedAt)}
            </p>
          </div>
        </UserRankBanner>
      )}

      {entries.length === 0 ? (
        <EmptyState
          accent={accent}
          message="No scores yet today. Be the first to solve the puzzle!"
          playPath="/game/puzzle"
          playLabel="Play Daily Puzzle"
        />
      ) : (
        <LeaderboardTable
          accent={accent}
          columns={[
            { key: 'rank', label: 'Rank', align: 'left', width: '3rem' },
            { key: 'player', label: 'Player', align: 'left' },
            { key: 'guesses', label: 'Guesses', align: 'right', width: '5rem' },
            { key: 'time', label: 'Time', align: 'right', width: '5rem' },
          ]}
          rows={entries.map((entry, index) => ({
            key: entry.user_id,
            isCurrentUser: entry.user_id === userId,
            rank: index + 1,
            cells: [
              index + 1,
              formatPlayerName(entry),
              entry.guesses_used,
              formatCompletedTime(entry.completed_at),
            ],
          }))}
        />
      )}
    </div>
  );
}

function LeaderboardTable({ accent, columns, rows }) {
  const styles = ACCENT_STYLES[accent];
  const gridTemplate = columns
    .map((col) => col.width ?? '1fr')
    .join(' ');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
      <div
        className="grid gap-2 px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-800 font-mono"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {columns.map((col) => (
          <span key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
            {col.label}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-slate-800">
        {rows.map((row) => (
          <li
            key={row.key}
            className={`grid gap-2 px-4 py-3 items-center text-sm ${
              row.isCurrentUser ? styles.highlight : ''
            }`}
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {row.cells.map((cell, cellIndex) => {
              const col = columns[cellIndex];
              const isRank = col.key === 'rank';
              const isPlayer = col.key === 'player';

              return (
                <span
                  key={col.key}
                  className={[
                    col.align === 'right' ? 'text-right' : '',
                    isRank
                      ? `font-black ${row.rank <= 3 ? styles.rank : 'text-slate-500'}`
                      : '',
                    isPlayer
                      ? `truncate ${row.isCurrentUser ? `${styles.text} font-semibold` : 'text-slate-200'}`
                      : isRank
                        ? ''
                        : 'font-mono text-white',
                    !isRank && !isPlayer && col.key === 'time' ? 'text-slate-500 text-xs' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {cell}
                  {isPlayer && row.isCurrentUser && (
                    <span className={`ml-2 text-[10px] uppercase ${styles.you} font-mono`}>You</span>
                  )}
                </span>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}

const TAB_COMPONENTS = {
  cards: CardBattlerTab,
  idle: IdleTab,
  puzzle: PuzzleTab,
};

export default function Leaderboard({ userId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    const game = searchParams.get('game');
    return TABS.some((tab) => tab.id === game) ? game : 'cards';
  }, [searchParams]);

  const currentTab = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const TabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <Trophy className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest font-mono">
            Gamer Stronghold Rankings
          </span>
        </div>
        <h1 className="text-3xl font-black text-white">Leaderboard</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Cross-game standings across Card Battler, Tycoon Terminal, and the Daily Puzzle.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const styles = ACCENT_STYLES[tab.accent];
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchParams({ game: tab.id })}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive ? styles.tabActive : styles.tabIdle
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">{currentTab.description}</p>
        <Link
          to={currentTab.playPath}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all ${ACCENT_STYLES[currentTab.accent].text}`}
        >
          Play {currentTab.label}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <TabComponent userId={userId} accent={currentTab.accent} />
    </div>
  );
}
