export function formatPlayerName(entry) {
  const screenName = entry?.profiles?.screen_name;
  if (screenName) return screenName;

  const userId = entry?.user_id ?? '';
  if (!userId) return 'Anonymous';

  return `Player ${userId.slice(0, 8)}`;
}

export function formatCompletedTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatPuzzleDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatWinLoss(wins, losses) {
  return `${wins}W – ${losses}L`;
}
