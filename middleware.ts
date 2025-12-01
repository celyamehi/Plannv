import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Liste des origines autorisées
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://votresite.com', // Remplacez par votre domaine de production
]

// Configuration des chemins publics (liste consolidée)
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/professionals/signup',
  '/professionals/login',
  '/auth/selection',
  '/search',
  '/establishments',
  '/test-session',
  '/test-connection',
  '/booking',
  '/debug-logs',
  '/test-auth',
  '/api/auth',
  '/api/debug',
  '/client/search',
  '/client/booking',
  '/_next',
  '/favicon.ico',
  '/assets'
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const method = req.method
  const origin = req.headers.get('origin')

  // Gestion CORS pour les requêtes OPTIONS (prévol)
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return response
  }

  // Pour les autres requêtes, ajouter les en-têtes CORS si nécessaire
  const res = NextResponse.next()

  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Vérifier si le chemin est public
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // Si c'est une route publique, laisser passer SANS vérifier la session
  if (isPublicPath) {
    console.log(`✅ Route publique autorisée: ${pathname}`)
    return res
  }

  // Pour les routes API, laisser passer
  if (pathname.startsWith('/api')) {
    return res
  }

  // À partir d'ici, ce sont des routes protégées qui nécessitent une authentification
  // Créer le client Supabase
  const supabase = createMiddlewareClient({ req, res })

  // Variable pour stocker la session
  let session = null

  try {
    // Récupérer la session
    const { data: { session: userSession }, error } = await supabase.auth.getSession()
    session = userSession

    if (error) {
      console.error('Erreur lors de la récupération de la session:', error)
    }

    // Si pas de session sur une route protégée, rediriger vers la page de connexion
    if (!session) {
      console.log('🔒 Aucune session trouvée, redirection vers /login')
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }

    console.log('✅ Session valide pour l\'utilisateur:', session.user?.email)

  } catch (error) {
    console.error('Erreur dans le middleware:', error)
    // En cas d'erreur, rediriger vers la page de connexion
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Routes client qui nécessitent une redirection
  const clientRoutes = ['/dashboard', '/appointments', '/favorites', '/notifications', '/profile']
  const isClientRoute = clientRoutes.some(route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`))

  // Rediriger les anciennes routes client vers les nouvelles
  if (isClientRoute) {
    const newUrl = req.nextUrl.clone()
    newUrl.pathname = `/client${newUrl.pathname}`
    console.log(`🔄 REDIRECTION - Ancienne route client détectée, redirection vers: ${newUrl.pathname}`)
    return NextResponse.redirect(newUrl)
  }

  const timestamp = new Date().toISOString()
  console.log(`✅ [${timestamp}] MIDDLEWARE - Accès autorisé à ${pathname}`)
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
