'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DirectLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Connexion directe avec:', email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('📊 Réponse:', { data, error: signInError })

      if (signInError) {
        console.error('❌ Erreur:', signInError)
        throw signInError
      }

      if (data.user) {
        console.log('✅ Connecté:', data.user.email)
        setSuccess(true)
        
        // Redirection directe avec window.location
        setTimeout(() => {
          console.log('🚀 Redirection directe...')
          window.location.href = '/dashboard/simple'
        }, 1000)
      } else {
        throw new Error('Aucun utilisateur trouvé')
      }

    } catch (error: any) {
      console.error('💥 Erreur:', error)
      setError(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">✅ Connexion Réussie !</CardTitle>
            <CardDescription className="text-center">
              Redirection vers votre dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-600">
              Si vous n'êtes pas redirigé automatiquement, cliquez ci-dessous
            </p>
            <Link href="/dashboard/simple">
              <Button className="w-full">
                Aller au dashboard maintenant
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
            <CardTitle>Connexion Directe</CardTitle>
            <CardDescription>
              Version ultra-simplifiée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  ❌ {error}
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <div className="text-center text-sm">
                <span className="text-gray-600">Pas encore de compte ? </span>
                <Link href="/signup/no-confirm" className="text-purple-600 hover:text-purple-700 font-medium">
                  S'inscrire (sans confirmation)
                </Link>
              </div>
              
              <div className="text-center text-sm">
                <Link href="/dashboard/simple" className="text-blue-600 hover:text-blue-700 font-medium">
                  → Accès direct au dashboard
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
