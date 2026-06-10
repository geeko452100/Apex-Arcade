import { api, getAccessToken, setAccessToken } from './apiClient.js';

const listeners = new Set();

function notify(session) {
  listeners.forEach((fn) => fn(session));
}

export function onAuthStateChange(callback) {
  listeners.add(callback);
  return {
    unsubscribe: () => listeners.delete(callback),
  };
}

export async function getSession() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const { user, accessToken } = await api.auth.getSession();
    if (accessToken) setAccessToken(accessToken);
    return { user, access_token: accessToken };
  } catch {
    setAccessToken(null);
    return null;
  }
}

export async function signIn(email, password) {
  const { user, accessToken, error } = await api.auth.signIn(email, password).catch((err) => ({
    error: err,
  }));

  if (error) return { error };

  setAccessToken(accessToken);
  const session = { user, access_token: accessToken };
  notify(session);
  return { data: { session } };
}

export async function signUp(email, password, screenName) {
  const result = await api.auth.signUp(email, password, screenName).catch((err) => ({
    error: err,
  }));

  if (result.error) return { error: result.error };

  if (result.accessToken) {
    setAccessToken(result.accessToken);
    const session = { user: result.user, access_token: result.accessToken };
    notify(session);
    return { data: { session } };
  }

  return { data: { user: result.user } };
}

export async function signOut() {
  try {
    await api.auth.signOut();
  } catch {
    // Clear local session even if server sign-out fails.
  }
  setAccessToken(null);
  notify(null);
  return { error: null };
}
