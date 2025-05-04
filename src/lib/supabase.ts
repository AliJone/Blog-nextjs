import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
// Removed unused import: import { cookies } from 'next/headers';

// These environment variables need to be set in a .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create the appropriate Supabase client based on context
export function createClient() {
  const isServerSide = typeof window === 'undefined';
  
  if (isServerSide) {
   // We're in a server environment (SSR/SSG/API)
    // Note: In true static generation, we won't have cookies
    try {
      // For SSR with cookie support
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    } catch (error) {
      console.error('[DEBUG] Error creating server-side client, falling back to basic client:', error);
      // Fallback for static generation
      return createSupabaseClient(supabaseUrl, supabaseAnonKey);
    }
  } else {
    // We're in the browser
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

// Legacy client for backward compatibility
// This is the original client without cookie support
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export default supabase;