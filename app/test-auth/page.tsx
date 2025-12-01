'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const addResult = (type: 'info' | 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    }])
  }

  const testUserExists = async () => {
    if (!email) {
      addResult('error', 'Veuillez entrer un email')
      return
    }

    addResult('info', `Vérification de l'existence de l'utilisateur: ${email}`)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          addResult('error', 'Utilisateur non trouvé dans la table profiles', error)
        } else {
          addResult('error', 'Erreur lors de la vérification du profil', error)
        }
      } else {
        addResult('success', 'Profil trouvé dans la table profiles', data)
      }
    } catch (error: any) {
      addResult('error', 'Exception lors de la vérification du profil', error)
    }
  }

  const testAuthUsers = async () => {
    if (!email) {
      addResult('error', 'Veuillez entrer un email')
      return
    }

    addResult('info', `Vérification de l'utilisateur dans auth.users: ${email}`)
    
    try {
      // Utiliser une fonction RPC pour vérifier auth.users
      const { data, error } = await supabase.rpc('check_user_exists', { 
        user_email: email 
      })

      if (error) {
        addResult('error', 'Erreur lors de la vérification dans auth.users', error)
      } else {
        addResult('success', 'Résultat de la vérification auth.users', data)
      }
    } catch (error: any) {
      addResult('error', 'Exception lors de la vérification auth.users', error)
    }
  }

  const testLogin = async () => {
    if (!email || !password) {
      addResult('error', 'Veuillez entrer email et mot de passe')
      return
    }

    addResult('info', `Tentative de connexion avec: ${email}`)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      addResult('info', 'Réponse Supabase complète:', {
        hasData: !!data,
        hasError: !!error,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : null,
        session: data.session ? {
          expiresAt: new Date(data.session.expires_at! * 1000).toISOString()
        } : null,
        error: error ? {
          message: error.message,
          status: error.status,
          name: error.name
        } : null
      })

      if (error) {
        addResult('error', 'Échec de la connexion', error)
      } else {
        addResult('success', 'Connexion réussie', data)
      }
    } catch (error: any) {
      addResult('error', 'Exception lors de la connexion', error)
    } finally {
      setLoading(false)
    }
  }

  const testSignup = async () => {
    if (!email || !password) {
      addResult('error', 'Veuillez entrer email et mot de passe')
      return
    }

    addResult('info', `Tentative d'inscription avec: ${email}`)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0]
          }
        }
      })

      addResult('info', 'Réponse inscription Supabase:', {
        hasData: !!data,
        hasError: !!error,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : null,
        session: data.session ? 'Session présente' : 'Aucune session',
        error: error ? {
          message: error.message,
          status: error.status,
          name: error.name
        } : null
      })

      if (error) {
        addResult('error', 'Échec de l\'inscription', error)
      } else {
        addResult('success', 'Inscription réussie', data)
      }
    } catch (error: any) {
      addResult('error', 'Exception lors de l\'inscription', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmEmailManually = async () => {
    if (!email) {
      addResult('error', 'Veuillez entrer un email')
      return
    }

    addResult('info', `Tentative de confirmation manuelle de l'email: ${email}`)
    
    try {
      const { data, error } = await supabase.rpc('confirm_user_email', { 
        user_email: email 
      })

      if (error) {
        addResult('error', 'Erreur lors de la confirmation manuelle', error)
      } else {
        addResult('success', 'Email confirmé manuellement', data)
      }
    } catch (error: any) {
      addResult('error', 'Exception lors de la confirmation manuelle', error)
    }
  }

  const checkSession = async () => {
    addResult('info', 'Vérification de la session actuelle')
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      addResult('info', 'Session actuelle:', {
        hasSession: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at
        } : null,
        expiresAt: session ? new Date(session.expires_at! * 1000).toISOString() : null,
        error
      })
    } catch (error: any) {
      addResult('error', 'Exception lors de la vérification de session', error)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Test d'Authentification</h1>
          <p className="text-gray-600">
            Diagnostic complet des problèmes d'authentification
          </p>
        </div>

        {/* Formulaire de test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Formulaire de Test</CardTitle>
            <CardDescription>
              Entrez les identifiants à tester
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button onClick={testUserExists} variant="outline" size="sm">
                Vérifier Profil
              </Button>
              <Button onClick={testAuthUsers} variant="outline" size="sm">
                Vérifier Auth Users
              </Button>
              <Button onClick={testLogin} disabled={loading} size="sm">
                Tester Connexion
              </Button>
              <Button onClick={testSignup} disabled={loading} variant="outline" size="sm">
                Tester Inscription
              </Button>
              <Button onClick={confirmEmailManually} variant="outline" size="sm">
                Confirmer Email
              </Button>
              <Button onClick={checkSession} variant="outline" size="sm">
                Vérifier Session
              </Button>
            </div>

            <div className="flex justify-between">
              <Button onClick={clearResults} variant="outline" size="sm">
                Effacer les résultats
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
            <CardDescription>
              {results.length} résultat(s) • Dernier: {results[0]?.timestamp || 'Aucun'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded border ${
                      result.type === 'error' ? 'border-red-200 bg-red-50' :
                      result.type === 'success' ? 'border-green-200 bg-green-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {result.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        {result.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {result.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{result.message}</div>
                        {result.data && (
                          <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun test effectué</p>
                  <p className="text-sm">Utilisez les boutons ci-dessus pour tester l'authentification</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
