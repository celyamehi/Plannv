import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = new Date().toISOString()
  
  console.log(`\n🔍 [${timestamp}] DEBUG API - Récupération des informations de session`)
  
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Récupérer la session
    console.log(`🔑 DEBUG API - Vérification de la session Supabase...`)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log(`👤 DEBUG API - Session:`, session ? {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: new Date(session.expires_at! * 1000).toISOString(),
      hasSession: true
    } : {
      hasSession: false,
      error: sessionError
    })
    
    // Récupérer le profil si session existe
    let profile = null
    let profileError = null
    
    if (session?.user) {
      console.log(`📊 DEBUG API - Récupération du profil utilisateur...`)
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      profile = profileData
      profileError = profileErr
      
      console.log(`📋 DEBUG API - Profil:`, profile ? {
        id: profile.id,
        user_type: profile.user_type,
        full_name: profile.full_name
      } : {
        error: profileError
      })
    }
    
    // Récupérer tous les cookies
    console.log(`🍪 DEBUG API - Analyse des cookies...`)
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    console.log(`📊 DEBUG API - Cookies trouvés:`, allCookies.map(c => ({
      name: c.name,
      hasValue: !!c.value,
      length: c.value.length
    })))
    
    const response = {
      timestamp,
      session: session ? {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: new Date(session.expires_at! * 1000).toISOString(),
        hasSession: true
      } : {
        hasSession: false,
        error: sessionError?.message
      },
      profile: profile ? {
        id: profile.id,
        user_type: profile.user_type,
        full_name: profile.full_name,
        phone: profile.phone
      } : {
        error: profileError?.message
      },
      cookies: allCookies.map(c => ({
        name: c.name,
        value: c.value.substring(0, 50) + (c.value.length > 50 ? '...' : ''),
        length: c.value.length
      })),
      headers: {
        userAgent: 'Server-side request',
        timestamp
      }
    }
    
    console.log(`✅ DEBUG API - Informations de session récupérées avec succès`)
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`❌ DEBUG API - Erreur lors de la récupération de la session:`, error)
    
    return NextResponse.json({
      timestamp,
      error: error.message,
      session: { hasSession: false },
      profile: { error: error.message },
      cookies: [],
      headers: { error: error.message }
    }, { status: 500 })
  }
}
