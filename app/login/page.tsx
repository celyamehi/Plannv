'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
              <Link href="/" className="inline-flex items-center justify-center mb-6">
                <Image src="/logo.png" alt="Kalendo" width={200} height={70} className="h-16 w-auto" />
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
            <Link href="/" className="inline-flex items-center justify-center mb-6">
              <Image src="/logo.png" alt="Kalendo" width={200} height={70} className="h-16 w-auto" />
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
