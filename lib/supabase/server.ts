import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iwhxbwikjfyvzuasybvs.supabase.co'
const defaultKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aHhid2lramZ5dnp1YXN5YnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1ODcyNjMsImV4cCI6MjA5OTE2MzI2M30.U-CD4u6MGjUDUPcZLAbni5SdWpMd7L8fSKEy0RzOV_c'

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies }, {
    supabaseUrl: defaultUrl,
    supabaseKey: defaultKey,
  })
}
