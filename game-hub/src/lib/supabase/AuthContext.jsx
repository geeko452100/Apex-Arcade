import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from './client';
import { fetchProfile } from './profilePersistence';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState(null);

  const refreshProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const nextProfile = await fetchProfile(userId);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  useEffect(() => {
    let active = true;

    async function initSession() {
      const { data: { session: initialSession } } = await supabase.auth.getSession();

      if (!active) return;

      setSession(initialSession);

      if (initialSession?.user?.id) {
        await refreshProfile(initialSession.user.id);
      }

      setLoading(false);
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        setSession(nextSession);
        setAuthEvent(event);

        if (nextSession?.user?.id) {
          await refreshProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      authEvent,
      refreshProfile,
      signOut,
    }),
    [session, profile, loading, authEvent, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
