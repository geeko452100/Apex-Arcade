const API_BASE = import.meta.env.VITE_API_URL ?? '';

const TOKEN_KEY = 'gs_access_token';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.error ?? `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return body;
}

export const api = {
  auth: {
    signUp: (email, password, screenName) =>
      request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, screenName }),
      }),
    signIn: (email, password) =>
      request('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    signOut: () => request('/api/auth/signout', { method: 'POST' }),
    getSession: () => request('/api/auth/session'),
  },

  games: {
    fetch: (gameId) => request(`/api/games/${gameId}`),
    update: (gameId, nextState, expectedVersion) =>
      request(`/api/games/${gameId}`, {
        method: 'PUT',
        body: JSON.stringify({ nextState, expectedVersion }),
      }),
  },

  matchmaking: {
    join: (gameType = 'card-battler') =>
      request('/api/matchmaking/join', {
        method: 'POST',
        body: JSON.stringify({ gameType }),
      }),
    cancel: () => request('/api/matchmaking/cancel', { method: 'DELETE' }),
    status: (since) => {
      const params = since ? `?since=${encodeURIComponent(since)}` : '';
      return request(`/api/matchmaking/status${params}`);
    },
  },

  stats: {
    recordCardBattlerResult: (didWin) =>
      request('/api/stats/card-battler/result', {
        method: 'POST',
        body: JSON.stringify({ didWin }),
      }),
  },

  idle: {
    fetchSave: () => request('/api/idle/save'),
    upsertSave: (saveData) =>
      request('/api/idle/save', {
        method: 'PUT',
        body: JSON.stringify({ saveData }),
      }),
  },

  puzzle: {
    submitResult: (puzzleDate, guessesUsed) =>
      request('/api/puzzle/result', {
        method: 'POST',
        body: JSON.stringify({ puzzleDate, guessesUsed }),
      }),
    fetchLeaderboard: (puzzleDate, limit = 100) =>
      request(`/api/puzzle/leaderboard/${puzzleDate}?limit=${limit}`),
    fetchUserResult: (puzzleDate) => request(`/api/puzzle/result/${puzzleDate}`),
    fetchUserRank: (puzzleDate) => request(`/api/puzzle/rank/${puzzleDate}`),
  },

  leaderboard: {
    cardBattler: (limit = 100) =>
      request(`/api/leaderboard/card-battler?limit=${limit}`),
    cardBattlerRank: () => request('/api/leaderboard/card-battler/rank'),
    idle: (limit = 100) => request(`/api/leaderboard/idle?limit=${limit}`),
    idleRank: () => request('/api/leaderboard/idle/rank'),
  },
};
