'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowLeft, Loader2, User, Building } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Si on vient d'une page de booking, pré-sélectionner "client"
  // Si on vient avec ?type=professional, pré-sélectionner "professional"
  const redirectedFrom = searchParams?.get('redirectedFrom') || ''
  const typeParam = searchParams?.get('type') || ''
  const isFromBooking = redirectedFrom.includes('/booking/')
  
  const getInitialUserType = (): 'client' | 'professional' | null => {
    if (typeParam === 'admin') return 'professional' // Les admins se connectent via le formulaire pro
    if (typeParam === 'professional') return 'professional'
    if (isFromBooking) return 'client'
    return null
  }
  
  const [userType, setUserType] = useState<'client' | 'professional' | null>(getInitialUserType())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vérifier si l'utilisateur est déjà connecté au chargement de la page
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // Si l'utilisateur est déjà connecté, le rediriger
          const redirectPath = searchParams?.get('redirectedFrom') || '/dashboard'
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
    setSubmitting(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Email ou mot de passe incorrect')
        }
        throw error
      }

      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, full_name')
          .eq('id', data.user.id)
          .single()

        if (profileError || !profile) {
          await supabase.auth.signOut()
          router.push('/setup-profile')
          return
        }

        // Vérifier que le type de compte correspond au choix
        if (userType === 'client' && (profile.user_type === 'professional' || profile.user_type === 'admin')) {
          await supabase.auth.signOut()
          setError('Ce compte est un compte professionnel. Veuillez choisir "Espace Professionnel".')
          return
        }

        if (userType === 'professional' && profile.user_type === 'client') {
          await supabase.auth.signOut()
          setError('Ce compte est un compte client. Veuillez choisir "Espace Client".')
          return
        }

        // Redirection selon le type
        if (userType === 'professional') {
          window.location.href = '/professional/pro-dashboard'
        } else {
          const redirectPath = searchParams?.get('redirectedFrom') || '/client/dashboard'
          window.location.href = redirectPath
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
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

  // Afficher un loader pendant la vérification de session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-nude-600" />
      </div>
    )
  }

  // Étape 1 : Choix du type de compte
  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Retour à l'accueil</span>
            </Link>
          </div>
        </header>

        <main className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-3xl">
            {/* Logo et titre */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-nude-600 to-nude-500 rounded-2xl flex items-center justify-center shadow-lg shadow-nude-200">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">Kalendo</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h1>
              <p className="text-gray-500">Choisissez votre espace pour vous connecter</p>
            </div>

            {/* Cartes de choix */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Client Card */}
              <button
                onClick={() => setUserType('client')}
                className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-left hover:border-nude-400 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-nude-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-nude-200 transition-colors">
                  <User className="w-7 h-7 text-nude-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Espace Client</h3>
                <p className="text-gray-500 mb-6">Accédez à vos rendez-vous et réservations</p>
                <div className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl text-center group-hover:bg-nude-600 transition-colors">
                  Se connecter
                </div>
              </button>

              {/* Professional Card */}
              <button
                onClick={() => setUserType('professional')}
                className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-left hover:border-warm-400 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-warm-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-warm-200 transition-colors">
                  <Building className="w-7 h-7 text-warm-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Espace Professionnel</h3>
                <p className="text-gray-500 mb-6">Gérez votre établissement et vos rendez-vous</p>
                <div className="w-full py-3 bg-gradient-to-r from-nude-600 to-nude-500 text-white font-medium rounded-xl text-center">
                  Se connecter
                </div>
              </button>
            </div>

            {/* Lien inscription */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="text-nude-600 hover:text-nude-700 font-semibold">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Étape 2 : Formulaire de connexion
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => setUserType(null)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Changer d'espace</span>
          </button>
        </div>
      </header>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-nude-600 to-nude-500 rounded-2xl flex items-center justify-center shadow-lg shadow-nude-200">
                <span className="text-white font-bold text-2xl">K</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">Kalendo</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-nude-100 rounded-full mb-4">
              {userType === 'professional' ? (
                <Building className="w-4 h-4 text-nude-600" />
              ) : (
                <User className="w-4 h-4 text-nude-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                Espace {userType === 'professional' ? 'Professionnel' : 'Client'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bon retour parmi nous</h1>
            <p className="text-gray-500">Connectez-vous à votre espace</p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-400 focus:border-transparent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-nude-600 hover:text-nude-700 font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-nude-600 to-nude-500 focus:ring-nude-400 hover:shadow-lg hover:shadow-nude-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>

            {/* Lien inscription */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link 
                  href="/signup" 
                  className="text-nude-600 hover:text-nude-700 font-semibold"
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
