'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import { User, Building, ArrowLeft, Eye, EyeOff, Loader2, Check } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Si on vient d'une page de booking, pré-sélectionner "client"
  const redirectedFrom = searchParams?.get('redirectedFrom') || ''
  const isFromBooking = redirectedFrom.includes('/booking/')
  
  const [userType, setUserType] = useState<'client' | 'professional' | null>(isFromBooking ? 'client' : null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation du type d'utilisateur
    if (!userType) {
      setError('Veuillez sélectionner un type de compte (Client ou Professionnel)')
      setLoading(false)
      return
    }

    console.log('🔍 SIGNUP - Type sélectionné:', userType)

    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setLoading(false)
      return
    }

    try {
      // Créer le compte
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      })

      if (signUpError) throw signUpError

      // Créer ou mettre à jour le profil dans la table profiles unifiée
      if (data.user) {
        console.log('✅ SIGNUP - Compte auth créé:', data.user.id)
        console.log('🔍 SIGNUP - user_type à insérer:', userType)

        // Attendre un peu pour laisser les triggers s'exécuter
        await new Promise(resolve => setTimeout(resolve, 500))

        // Vérifier si le profil existe déjà (créé par un trigger)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, user_type')
          .eq('id', data.user.id)
          .single()

        if (existingProfile) {
          console.log('⚠️ SIGNUP - Profil existe déjà avec user_type:', existingProfile.user_type)
          console.log('🔄 SIGNUP - Mise à jour du user_type vers:', userType)

          // Mettre à jour le profil existant
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              phone: phone,
              user_type: userType,
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('❌ SIGNUP - Erreur mise à jour profil:', updateError)
            throw updateError
          }

          console.log('✅ SIGNUP - Profil mis à jour avec user_type:', userType)
        } else {
          console.log('🆕 SIGNUP - Création du profil')

          // Créer le profil s'il n'existe pas
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              phone: phone,
              user_type: userType,
            })

          if (insertError) {
            console.error('❌ SIGNUP - Erreur création profil:', insertError)
            throw insertError
          }

          console.log('✅ SIGNUP - Profil créé avec user_type:', userType)
        }
      }

      setSuccess(true)

      // Redirection automatique selon le type ou vers la page d'origine
      const redirectPath = searchParams?.get('redirectedFrom')
      
      setTimeout(() => {
        if (redirectPath) {
          // Si on vient d'une page de booking, y retourner
          window.location.href = redirectPath
        } else if (userType === 'professional') {
          router.push('/professionals/signup')
        } else {
          router.push('/dashboard')
        }
      }, 2000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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

  if (!userType) {
    // Étape 1 : Choix du type de compte
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
          <div className="w-full max-w-4xl">
            {/* Logo et titre */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-nude-600 to-warm-600 rounded-2xl flex items-center justify-center shadow-lg shadow-nude-200">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">Kalendo</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
              <p className="text-gray-500">Choisissez votre type de compte pour continuer</p>
            </div>

            {/* Cartes de choix */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Client Card */}
              <button
                onClick={() => setUserType('client')}
                className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-left hover:border-nude-500 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 bg-nude-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-nude-200 transition-colors">
                  <User className="w-7 h-7 text-nude-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Je suis un Client</h3>
                <p className="text-gray-500 mb-6">Je souhaite réserver des rendez-vous beauté</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-nude-600" />
                    <span>Réserver facilement vos rendez-vous</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-nude-600" />
                    <span>Découvrir les meilleurs salons</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-nude-600" />
                    <span>Gérer vos réservations</span>
                  </li>
                </ul>
                <div className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl text-center group-hover:bg-nude-600 transition-colors">
                  Continuer en tant que Client
                </div>
              </button>

              {/* Professional Card - Redirige vers la page d'inscription pro complète */}
              <Link
                href="/professionals/signup"
                className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-left hover:border-warm-500 hover:shadow-lg transition-all group block"
              >
                <div className="w-14 h-14 bg-warm-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-warm-200 transition-colors">
                  <Building className="w-7 h-7 text-warm-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Je suis un Professionnel</h3>
                <p className="text-gray-500 mb-6">Je gère un salon ou un institut de beauté</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-warm-600" />
                    <span>Gérer votre établissement</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-warm-600" />
                    <span>Organiser vos rendez-vous</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-warm-600" />
                    <span>Augmenter votre visibilité</span>
                  </li>
                </ul>
                <div className="w-full py-3 bg-gradient-to-r from-nude-600 to-warm-600 text-white font-medium rounded-xl text-center">
                  Continuer en tant que Professionnel
                </div>
              </Link>
            </div>

            {/* Lien connexion */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="text-nude-600 hover:text-nude-700 font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Étape 2 : Formulaire d'inscription
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
            <span className="text-sm">Changer de type de compte</span>
          </button>
        </div>
      </header>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-nude-600 to-warm-600 rounded-2xl flex items-center justify-center shadow-lg shadow-nude-200">
                <span className="text-white font-bold text-2xl">K</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">Kalendo</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
              {userType === 'professional' ? (
                <Building className="w-4 h-4 text-warm-600" />
              ) : (
                <User className="w-4 h-4 text-nude-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                Compte {userType === 'professional' ? 'Professionnel' : 'Client'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
            <p className="text-gray-500">
              {userType === 'professional'
                ? 'Créez votre espace professionnel'
                : 'Rejoignez notre communauté'
              }
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compte créé avec succès !</h3>
                <p className="text-gray-500 mb-4">
                  {userType === 'professional'
                    ? 'Redirection vers la configuration...'
                    : 'Redirection vers votre espace...'
                  }
                </p>
                <Loader2 className="w-6 h-6 animate-spin text-nude-600 mx-auto" />
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nude-500 focus:border-transparent transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    userType === 'professional'
                      ? 'bg-gradient-to-r from-nude-600 to-warm-600 focus:ring-warm-500'
                      : 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-900'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </form>
            )}

            {!success && (
              <>
                {/* Séparateur */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm text-gray-500">Ou continuer avec</span>
                  </div>
                </div>

                {/* Google Signup */}
                <button
                  type="button"
                  onClick={handleGoogleSignup}
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

                {/* Lien connexion */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Vous avez déjà un compte ?{' '}
                    <Link href="/login" className="text-nude-600 hover:text-nude-700 font-semibold">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
