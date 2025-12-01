'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugMaxLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog('🚀 Page de debug initialisée')
    checkInitialSession()
  }, [])

  const checkInitialSession = async () => {
    addLog('🔍 Vérification de la session initiale...')
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`❌ Erreur session initiale: ${error.message}`)
      } else {
        addLog(`📋 Session initiale: ${data.session ? 'Active' : 'Inactive'}`)
        if (data.session) {
          addLog(`👤 User ID: ${data.session.user.id}`)
          addLog(`📧 Email: ${data.session.user.email}`)
        }
      }
    } catch (err: any) {
      addLog(`💥 Erreur critique session: ${err.message}`)
    }
  }

  const handleDebugLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLogs([])
    setLoading(true)
    setError(null)

    try {
      addLog('🔐 Début de la tentative de connexion...')
      addLog(`📧 Email: ${email}`)
      addLog(`🔑 Password: ${password ? '***' : 'vide'}`)

      // Étape 1: Connexion
      addLog('📡 Appel à supabase.auth.signInWithPassword...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addLog(`❌ Erreur de connexion: ${error.message}`)
        addLog(`📊 Code erreur: ${error.status}`)
        addLog(`🔍 Détails: ${JSON.stringify(error, null, 2)}`)
        throw error
      }

      addLog('✅ Réponse Supabase reçue')
      addLog(`👤 User ID: ${data.user?.id}`)
      addLog(`📧 Email: ${data.user?.email}`)
      addLog(`📅 Créé le: ${data.user?.created_at}`)
      addLog(`✅ Email confirmé: ${data.user?.email_confirmed_at ? 'Oui' : 'Non'}`)

      // Étape 2: Vérification immédiate de la session
      addLog('🔍 Vérification immédiate de la session...')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        addLog(`❌ Erreur session: ${sessionError.message}`)
        throw sessionError
      }

      addLog(`📋 État session: ${sessionData.session ? 'Active' : 'Inactive'}`)
      if (sessionData.session) {
        addLog(`👤 Session User ID: ${sessionData.session.user.id}`)
        addLog(`📧 Session Email: ${sessionData.session.user.email}`)
        addLog(`⏰ Session expiré: ${sessionData.session.expires_at ? new Date(sessionData.session.expires_at * 1000).toLocaleString() : 'Inconnu'}`)
      }

      // Étape 3: Récupération du profil
      if (data.user) {
        addLog('🔍 Recherche du profil utilisateur...')
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            addLog(`❌ Erreur profil: ${profileError.message}`)
            addLog(`📊 Code erreur: ${profileError.code}`)
            addLog(`🔍 Détails: ${JSON.stringify(profileError, null, 2)}`)
            
            // Si erreur, vérifier si le profil existe
            addLog('🔍 Vérification si le profil existe...')
            const { data: profiles, error: listError } = await supabase
              .from('profiles')
              .select('id, email, user_type')
              .eq('id', data.user.id)

            if (listError) {
              addLog(`❌ Erreur liste profils: ${listError.message}`)
            } else {
              addLog(`📊 Nombre de profils trouvés: ${profiles?.length || 0}`)
              if (profiles && profiles.length > 0) {
                addLog(`👤 Profil trouvé: ${JSON.stringify(profiles[0], null, 2)}`)
              }
            }
            
            throw profileError
          }

          addLog('✅ Profil récupéré avec succès')
          addLog(`👤 Profil ID: ${profile.id}`)
          addLog(`📧 Profil Email: ${profile.email}`)
          addLog(`🏷️ Type utilisateur: ${profile.user_type}`)
          addLog(`👤 Nom complet: ${profile.full_name || 'Non défini'}`)
          addLog(`📱 Téléphone: ${profile.phone || 'Non défini'}`)

          // Étape 4: Redirection selon le type
          addLog('🧭 Préparation de la redirection...')
          
          if (profile.user_type === 'professional' || profile.user_type === 'admin') {
            addLog('➡️ Type: Professionnel/Admin')
            addLog('🚀 Redirection vers /professional/pro-dashboard')
            setTimeout(() => {
              addLog('🔄 Exécution de la redirection...')
              window.location.href = '/professional/pro-dashboard'
            }, 1000)
          } else if (profile.user_type === 'client') {
            addLog('➡️ Type: Client')
            addLog('🚀 Redirection vers /dashboard')
            setTimeout(() => {
              addLog('🔄 Exécution de la redirection...')
              window.location.href = '/dashboard'
            }, 1000)
          } else {
            addLog(`⚠️ Type inconnu: ${profile.user_type}`)
            addLog('🚀 Redirection par défaut vers /dashboard')
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
          }

        } catch (err: any) {
          addLog(`❌ Erreur critique profil: ${err.message}`)
          addLog('🔄 Redirection vers setup-profile...')
          setTimeout(() => {
            window.location.href = '/setup-profile'
          }, 1000)
        }
      }

    } catch (error: any) {
      addLog(`💥 Erreur de connexion: ${error.message}`)
      setError(error.message)
    } finally {
      setLoading(false)
      addLog('✅ Processus terminé')
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Debug MAX - Connexion</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulaire */}
          <Card>
            <CardHeader>
              <CardTitle>Formulaire de connexion</CardTitle>
            </CardHeader>
            <CardContent>
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

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '⏳ Connexion en cours...' : '🔐 Se connecter'}
                </Button>
              </form>

              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setEmail('test@client.com')
                    setPassword('password123')
                  }}
                >
                  📝 Remplir compte client
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setEmail('test@pro.com')
                    setPassword('password123')
                  }}
                >
                  📝 Remplir compte pro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Logs de diagnostic</CardTitle>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                🗑️ Effacer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Aucun log pour le moment...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1 whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a href="/test-session" className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
              📋 Vérifier session
            </a>
            <a href="/test-connection" className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
              🔌 Tester connexion
            </a>
            <a href="/dashboard" className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm">
              🏠 Dashboard client
            </a>
            <a href="/professional/pro-dashboard" className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm">
              🏢 Dashboard pro
            </a>
            <a href="/login" className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
              🔙 Login normal
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
