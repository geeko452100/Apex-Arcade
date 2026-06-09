import { useEffect, useState } from 'react';

export function useLeaderboardTab(userId, fetchEntries, fetchUserRank, deps = []) {
  const [loadStatus, setLoadStatus] = useState('loading');
  const [entries, setEntries] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadStatus('loading');

      try {
        const [leaderboard, rank] = await Promise.all([
          fetchEntries(),
          fetchUserRank(userId),
        ]);

        if (cancelled) return;

        setEntries(leaderboard);
        setUserRank(rank);
        setLoadStatus('ready');
      } catch {
        if (cancelled) return;
        setEntries([]);
        setUserRank(null);
        setLoadStatus('error');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, ...deps]);

  return { loadStatus, entries, userRank };
}