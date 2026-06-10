import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing server Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
  );
}

/** Anonymous client for auth sign-in/sign-up (no user session). */
export const anonSupabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

/**
 * User-scoped Supabase client that forwards the caller's JWT so RLS applies.
 */
export function createUserSupabase(accessToken) {
  return createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
