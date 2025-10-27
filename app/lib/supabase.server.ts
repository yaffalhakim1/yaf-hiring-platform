import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client for server-side usage
 * Used in API routes, loaders, and actions
 * Cannot access localStorage (server environment)
 */
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist on server
      autoRefreshToken: false, // Don't refresh on server
      detectSessionInUrl: false, // Don't detect URL on server
    },
  });
}

/**
 * Default server-side Supabase client instance
 * Use this in loaders, actions, and server-side code
 */
export const supabase = createSupabaseClient();
