'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

/**
 * Capture les redirections OAuth si Supabase renvoie vers la page d'accueil
 * au lieu de /auth/callback (par exemple si les Redirect URLs Supabase sont manquantes)
 */
export default function AuthRedirectCatch() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Si on est sur une page (ex: accueil /) et qu'il y a un ?code= OAuth dans l'URL
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')

    if (code && pathname !== '/auth/callback') {
      console.log('🔄 OAuth Code détecté hors de /auth/callback, redirection automatique vers /auth/callback...')
      window.location.href = `/auth/callback${window.location.search}`
      return
    }

    // 2. Si Supabase a renvoyé un token dans le hash (#access_token=...)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log('🔑 Token OAuth détecté dans le hash, validation de la session...')
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data: profile }) => {
              if (profile?.user_type === 'professional' || profile?.user_type === 'admin') {
                router.replace('/professional/pro-dashboard')
              } else {
                router.replace('/client/dashboard')
              }
            })
        }
      })
    }
  }, [pathname, router])

  return null
}
