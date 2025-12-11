'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  const handleDebugLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStatus('')

    try {
      setStatus('🔐 Connexion en cours...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setStatus('✅ Connecté! Vérification de la session...')

      // Vérifier la session
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (sessionData.session) {
        setStatus('✅ Session active! Redirection...')
        
        // Récupérer le profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', sessionData.session.user.id)
          .single()

        if (profile) {
          if (profile.user_type === 'professional' || profile.user_type === 'admin') {
            setStatus('➡️ Redirection vers dashboard pro...')
            setTimeout(() => {
              window.location.href = '/professional/pro-dashboard'
            }, 1000)
          } else {
            setStatus('➡️ Redirection vers dashboard client...')
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
          }
        } else {
          setStatus('➡️ Redirection vers setup...')
          setTimeout(() => {
            window.location.href = '/setup-profile'
          }, 1000)
        }
      } else {
        setStatus('❌ Pas de session après connexion')
      }

    } catch (error: any) {
      setStatus('❌ Erreur')
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestDirect = async () => {
    // Test avec les comptes de test
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@client.com',
      password: 'password123',
    })

    if (!error) {
      window.location.href = '/dashboard'
    }
  }

  const handleTestPro = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@pro.com',
      password: 'password123',
    })

    if (!error) {
      window.location.href = '/professional/pro-dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Debug Login</CardTitle>
            <CardDescription>
              Connexion avec diagnostic complet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status && (
              <div className={`p-3 rounded-lg text-sm ${
                status.includes('❌') ? 'bg-red-50 text-red-600' :
                status.includes('✅') ? 'bg-green-50 text-green-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {status}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleDebugLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="border-t pt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleTestDirect}
              >
                Test Client (test@client.com)
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleTestPro}
              >
                Test Pro (test@pro.com)
              </Button>
            </div>

            <div className="text-center text-sm">
              <a href="/test-session" className="text-nude-600 hover:underline">
                Vérifier la session
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
