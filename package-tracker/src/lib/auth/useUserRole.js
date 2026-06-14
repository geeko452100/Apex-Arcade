import { useState, useEffect } from 'react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';

export function useUserRole(userId) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function loadRole() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!cancelled) {
        setRole(error ? 'user' : (data?.role ?? 'user'));
        setLoading(false);
      }
    }

    loadRole();
    return () => { cancelled = true; };
  }, [userId]);

  const effectiveRole = userId ? role : null;
  const effectiveLoading = userId ? loading : false;

  return {
    role: effectiveRole,
    loading: effectiveLoading,
    isAdmin: effectiveRole === 'admin',
    isStaff: effectiveRole === 'staff' || effectiveRole === 'admin',
  };
}
