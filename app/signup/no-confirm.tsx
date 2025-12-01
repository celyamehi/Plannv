'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NoConfirmSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Tentative d\'inscription sans confirmation:', email)

      // Créer le compte
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      console.log('📊 Réponse inscription:', { data, error: signUpError })

      if (signUpError) {
        console.error('❌ Erreur inscription:', signUpError)
        throw signUpError
      }

      if (data.user) {
        console.log('✅ Utilisateur créé:', data.user)
        
        // Confirmer l'email manuellement dans la base de données
        const { error: confirmError } = await supabase.rpc('confirm_email', {
          user_id: data.user.id
        })
        
        if (confirmError) {
          console.log('⚠️ Erreur confirmation auto (normal):', confirmError)
        }
        
        // Se connecter automatiquement
        console.log('🔑 Connexion automatique...')
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.log('⚠️ Erreur connexion auto, redirection vers login:', signInError)
          setSuccess(true)
        } else {
          console.log('✅ Connexion automatique réussie!')
          // Redirection directe vers dashboard
          setTimeout(() => {
            router.push('/dashboard/simple')
          }, 1000)
        }
      }

    } catch (error: any) {
      console.error('💥 Erreur complète:', error)
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">✅ Compte Créé !</CardTitle>
            <CardDescription className="text-center">
              Votre compte a été créé avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Vous pouvez maintenant vous connecter immédiatement
            </p>
            <Link href="/login/debug">
              <Button className="w-full">
                Se connecter maintenant
              </Button>
            </Link>
            <Link href="/dashboard/simple">
              <Button variant="outline" className="w-full">
                Aller au dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <span className="text-3xl font-semibold">PlannV</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>
              Sans confirmation email - connexion immédiate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nom complet
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
                <p className="text-xs text-gray-500">
                  Minimum 8 caractères
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Création du compte...' : 'Créer mon compte (sans confirmation)'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Vous avez déjà un compte ? </span>
              <Link href="/login/debug" className="text-purple-600 hover:text-purple-700 font-medium">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
