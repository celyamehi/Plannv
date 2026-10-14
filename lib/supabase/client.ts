import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnfnsgztpsuhymjxqifp.supabase.co'
const defaultKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZm5zZ3p0cHN1aHltanhxaWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTY4NjYsImV4cCI6MjA3Nzk5Mjg2Nn0.RDpBZRYks-xWkhTvLrtsKUGix3ydQwZRHeNQLcA0qSs'

// Client pour les opérations côté client (sécurisé contre les crashes si env variables absentes)
export const supabase = createClientComponentClient({
  supabaseUrl: defaultUrl,
  supabaseKey: defaultKey,
})

// Client pour les opérations serveur (avec service role key si nécessaire, sans instancier dans le navigateur)
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(
      defaultUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || defaultKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : (supabase as any)
