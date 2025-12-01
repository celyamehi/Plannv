'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { User, Building } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'client' | 'professional' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
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
      
      // Redirection automatique selon le type
      setTimeout(() => {
        if (userType === 'professional') {
          router.push('/professional/setup')
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="w-full max-w-4xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <span className="text-3xl font-semibold">PlannV</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Créer votre compte</h1>
            <p className="text-gray-600">Choisissez votre type de compte pour continuer</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Card */}
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-600"
              onClick={() => setUserType('client')}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Je suis un Client</CardTitle>
                <CardDescription className="text-base">
                  Je souhaite réserver des rendez-vous beauté
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>Réserver facilement vos rendez-vous</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>Découvrir les meilleurs salons</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>Gérer vos réservations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>Laisser des avis</span>
                  </li>
                </ul>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Continuer en tant que Client
                </Button>
              </CardContent>
            </Card>

            {/* Professional Card */}
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-pink-600"
              onClick={() => setUserType('professional')}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-pink-600" />
                </div>
                <CardTitle className="text-2xl">Je suis un Professionnel</CardTitle>
                <CardDescription className="text-base">
                  Je gère un salon ou un institut de beauté
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2">✓</span>
                    <span>Gérer votre établissement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2">✓</span>
                    <span>Organiser vos rendez-vous</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2">✓</span>
                    <span>Gérer votre équipe</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 mr-2">✓</span>
                    <span>Augmenter votre visibilité</span>
                  </li>
                </ul>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
                  Continuer en tant que Professionnel
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <span className="text-gray-600">Vous avez déjà un compte ? </span>
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Se connecter
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Étape 2 : Formulaire d'inscription
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-semibold">
              PlannV {userType === 'professional' ? 'Pro' : ''}
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {userType === 'professional' ? (
                <Building className="w-5 h-5 mr-2 text-pink-600" />
              ) : (
                <User className="w-5 h-5 mr-2 text-purple-600" />
              )}
              Inscription {userType === 'professional' ? 'Professionnelle' : 'Client'}
            </CardTitle>
            <CardDescription>
              {userType === 'professional' 
                ? 'Créez votre espace professionnel' 
                : 'Rejoignez notre communauté de clients'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Compte créé avec succès !</h3>
                <p className="text-gray-600 mb-4">
                  {userType === 'professional' 
                    ? 'Redirection vers la configuration de votre établissement...'
                    : 'Redirection vers votre dashboard...'
                  }
                </p>
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Nom complet *
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email *
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
                  <label htmlFor="phone" className="text-sm font-medium">
                    Téléphone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe *
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

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmer le mot de passe *
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className={`w-full ${
                    userType === 'professional' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                      : 'bg-purple-600'
                  }`} 
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                </Button>
              </form>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignup}
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
                <button
                  type="button"
                  onClick={() => setUserType(null)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  ← Changer de type de compte
                </button>
              </div>
              
              <div className="text-center text-sm">
                <span className="text-gray-600">Vous avez déjà un compte ? </span>
                <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  Se connecter
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
