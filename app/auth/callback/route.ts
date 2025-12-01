import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log(`\n🔗 [${timestamp}] AUTH CALLBACK - Début du callback OAuth`)
  console.log(`📍 URL complète: ${request.url}`)
  console.log(`🔑 Code présent: ${code ? 'OUI' : 'NON'}`)
  console.log(`📊 Paramètres URL:`, Object.fromEntries(requestUrl.searchParams.entries()))

  if (code) {
    console.log(`🔄 AUTH CALLBACK - Échange du code contre une session...`)
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log(`📥 AUTH CALLBACK - Réponse échange code:`, {
      hasData: !!data,
      hasError: !!error,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        confirmed_at: data.user.confirmed_at
      } : null,
      session: data.session ? {
        expiresAt: new Date(data.session.expires_at! * 1000).toISOString()
      } : null,
      error: error ? {
        message: error.message,
        status: error.status
      } : null
    })

    if (error) {
      console.error(`❌ AUTH CALLBACK - Erreur lors de l'échange de code:`, error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }
    
    // Récupérer le profil pour vérifier le type d'utilisateur
    if (data.user) {
      console.log(`👤 AUTH CALLBACK - Utilisateur authentifié, récupération du profil...`)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      console.log(`📊 AUTH CALLBACK - Profil récupéré:`, {
        profile: profile,
        error: profileError,
        userType: profile?.user_type
      })

      // Si le profil n'existe pas, rediriger vers la page de setup
      if (profileError || !profile) {
        console.log(`⚠️ AUTH CALLBACK - Profil non trouvé, redirection vers /setup-profile`)
        return NextResponse.redirect(new URL('/setup-profile', request.url))
      }

      // Pour les professionnels, vérifier si l'établissement est configuré
      if (profile.user_type === 'professional') {
        console.log(`🏢 AUTH CALLBACK - Vérification établissement pour professionnel...`)
        const { data: establishment, error: establishmentError } = await supabase
          .from('establishments')
          .select('id')
          .eq('owner_id', data.user.id)
          .maybeSingle() // Utiliser maybeSingle pour ne pas retourner d'erreur si pas de résultat

        console.log(`📊 AUTH CALLBACK - Établissement vérifié:`, {
          establishment: establishment,
          error: establishmentError,
          hasEstablishment: !!establishment
        })

        // Si l'établissement n'existe pas, rediriger vers setup
        if (!establishment) {
          console.log(`⚠️ AUTH CALLBACK - Établissement non configuré, redirection vers /setup-profile`)
          return NextResponse.redirect(new URL('/setup-profile', request.url))
        }
      }

      // Redirection selon le type d'utilisateur
      const redirectUrl = profile.user_type === 'professional' || profile.user_type === 'admin' 
        ? '/professional/pro-dashboard' 
        : '/dashboard'
      
      console.log(`🎯 AUTH CALLBACK - Redirection vers: ${redirectUrl} (user_type: ${profile.user_type})`)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  } else {
    console.log(`❌ AUTH CALLBACK - Aucun code dans l'URL`)
  }

  // Redirection par défaut vers le dashboard client
  console.log(`🏠 AUTH CALLBACK - Redirection par défaut vers /dashboard`)
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
