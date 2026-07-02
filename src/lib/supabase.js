import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helps you notice a missing .env instead of silently failing.
export const isConfigured = Boolean(url && anonKey)

if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️  Supabase is not configured. Copy .env.example → .env and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  )
}

// Create a client even when unconfigured so the app can render a friendly
// "setup needed" state instead of crashing.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
)
