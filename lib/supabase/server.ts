import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnfnsgztpsuhymjxqifp.supabase.co'
const defaultKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZm5zZ3p0cHN1aHltanhxaWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTY4NjYsImV4cCI6MjA3Nzk5Mjg2Nn0.RDpBZRYks-xWkhTvLrtsKUGix3ydQwZRHeNQLcA0qSs'

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies }, {
    supabaseUrl: defaultUrl,
    supabaseKey: defaultKey,
  })
}
