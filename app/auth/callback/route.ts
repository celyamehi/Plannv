import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const typeParam = requestUrl.searchParams.get('type') || ''
  const redirectedFrom = requestUrl.searchParams.get('redirectedFrom') || ''
  
  console.log(`\n🔗 [${timestamp}] AUTH CALLBACK - Début du callback OAuth`)
  console.log(`📍 URL complète: ${request.url}`)
  console.log(`🔑 Code présent: ${code ? 'OUI' : 'NON'}`)
  console.log(`👤 Type demandé: ${typeParam || 'non spécifié'}`)

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(`❌ AUTH CALLBACK - Erreur lors de l'échange de code:`, error)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
    }

    if (data?.user) {
      const user = data.user
      const meta = user.user_metadata || {}

      console.log(`👤 AUTH CALLBACK - Utilisateur connecté:`, {
        id: user.id,
        email: user.email,
        metaName: meta.full_name || meta.name
      })

      // 1. Vérifier si le profil existe déjà
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      let finalUserType = profile?.user_type

      // Si le profil n'existe pas encore, on le crée automatiquement avec les données Google
      if (!profile) {
        console.log(`🆕 AUTH CALLBACK - Création automatique du profil Google...`)
        finalUserType = typeParam === 'professional' ? 'professional' : 'client'
        const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Utilisateur'
        const phone = meta.phone || ''

        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 30)

        const newProfile: any = {
          id: user.id,
          email: user.email,
          full_name: fullName,
          phone: phone,
          user_type: finalUserType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        if (finalUserType === 'professional') {
          newProfile.subscription_status = 'trial'
          newProfile.trial_ends_at = trialEndsAt.toISOString()
          newProfile.subscription_ends_at = trialEndsAt.toISOString()
        }

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)

        if (insertError) {
          console.warn('⚠️ Erreur création profil OAuth:', insertError)
        } else {
          console.log(`✅ Profil créé avec succès (type: ${finalUserType})`)
        }
      }

      // 2. Redirection selon le type
      if (finalUserType === 'professional' || finalUserType === 'admin') {
        // Vérifier si l'établissement existe
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (!establishment) {
          console.log(`🏢 Établissement non trouvé, redirection vers /professionals/signup`)
          return NextResponse.redirect(new URL('/professionals/signup', request.url))
        }

        console.log(`🚀 Redirection pro vers /professional/pro-dashboard`)
        return NextResponse.redirect(new URL('/professional/pro-dashboard', request.url))
      }

      // Pour les clients : si une page de destination était prévue (ex: réservation)
      if (redirectedFrom && redirectedFrom.startsWith('/')) {
        console.log(`🎯 Redirection client vers page demandée: ${redirectedFrom}`)
        return NextResponse.redirect(new URL(redirectedFrom, request.url))
      }

      console.log(`🎯 Redirection client vers /client/dashboard`)
      return NextResponse.redirect(new URL('/client/dashboard', request.url))
    }
  }

  // Redirection par défaut
  return NextResponse.redirect(new URL('/login', request.url))
}
