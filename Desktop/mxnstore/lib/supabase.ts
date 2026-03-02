import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Developer hint: If running in development and these env vars are missing,
// the Supabase client won't be able to fetch data. Provide them in a local
// .env.local file (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).
if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the app; just warn during development so the issue is actionable
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn('[SUPABASE] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Please set them in .env.local (e.g., NEXT_PUBLIC_SUPABASE_URL=...)');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
