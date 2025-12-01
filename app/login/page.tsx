'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true) // Commencer par le chargement
  const [error, setError] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState('/dashboard')

  // Vérifier si l'utilisateur est déjà connecté au chargement de la page
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // Si l'utilisateur est déjà connecté, le rediriger
          const redirectPath = searchParams?.get('redirectedFrom') || '/dashboard'
          console.log('Utilisateur déjà connecté, redirection vers:', redirectPath)
          router.replace(redirectPath)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Tenter de se connecter avec email/mot de passe
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // 2. Si la connexion est réussie, récupérer le profil utilisateur
      if (data?.user) {
        console.log('🔐 Connexion réussie pour l\'utilisateur:', data.user.email)

        // 3. Récupérer les informations du profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, full_name')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          console.error('❌ Profil non trouvé:', profileError)
          // Si le profil n'existe pas, déconnecter l'utilisateur et rediriger vers la page de configuration
          await supabase.auth.signOut()
          router.push('/setup-profile')
          return
        }

        // 4. Vérifier le type d'utilisateur
        if (profile.user_type === 'professional' || profile.user_type === 'admin') {
          console.log('👔 Compte professionnel détecté, redirection vers le tableau de bord pro')
          await supabase.auth.signOut()
          setError('Veuillez utiliser la page de connexion professionnelle.')
          return
        }

        // 5. Déterminer où rediriger l'utilisateur
        const redirectPath = searchParams?.get('redirectedFrom') || '/client/dashboard'
        console.log(`🔄 Redirection vers: ${redirectPath}`)

        // 6. Forcer un rechargement complet pour s'assurer que toutes les données sont à jour
        window.location.href = redirectPath
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-3xl font-semibold">Kalendo</span>
          </Link>
          <h1 className="text-2xl font-bold mt-8 mb-2">Bon retour parmi nous</h1>
          <p className="text-gray-600">
            Connectez-vous à votre espace Kalendo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion Client</CardTitle>
            <CardDescription>
              Accédez à votre espace personnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-purple-600 hover:text-purple-700">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm">
                <span className="text-gray-600">Pas encore de compte ? </span>
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                  S'inscrire
                </Link>
              </div>

              <div className="text-center text-sm">
                <Link href="/professionals/login" className="text-purple-600 hover:text-purple-700">
                  Vous êtes un professionnel ? Connexion pro →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
