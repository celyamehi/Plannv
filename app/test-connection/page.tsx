'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<any>({
    envVars: false,
    connection: false,
    auth: false,
    database: false,
  })
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLogs([])
    setError(null)

    // Test 1: Variables d'environnement
    addLog('🔍 Test 1: Vérification des variables d\'environnement...')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (url && key) {
      addLog(`✅ URL Supabase: ${url}`)
      addLog(`✅ Clé Anon: ${key.substring(0, 20)}...`)
      setStatus((prev: any) => ({ ...prev, envVars: true }))
    } else {
      addLog('❌ Variables d\'environnement manquantes')
      setError('Variables d\'environnement non configurées')
      return
    }

    // Test 2: Connexion à Supabase
    addLog('🔍 Test 2: Test de connexion à Supabase...')
    try {
      const { data, error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (healthError) {
        addLog(`❌ Erreur de connexion: ${healthError.message}`)
        setError(`Erreur de connexion à la base de données: ${healthError.message}`)
      } else {
        addLog('✅ Connexion à la base de données réussie')
        setStatus((prev: any) => ({ ...prev, connection: true, database: true }))
      }
    } catch (err: any) {
      addLog(`❌ Erreur réseau: ${err.message}`)
      setError(`Erreur réseau: ${err.message}`)
    }

    // Test 3: Test d'authentification
    addLog('🔍 Test 3: Test de session...')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        addLog(`✅ Session active: ${session.user.email}`)
        setStatus((prev: any) => ({ ...prev, auth: true }))
      } else {
        addLog('ℹ️ Aucune session active (normal si non connecté)')
      }
    } catch (err: any) {
      addLog(`⚠️ Erreur lors de la vérification de session: ${err.message}`)
    }

    addLog('✅ Tests terminés')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Test de Connexion Supabase</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Erreur détectée</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Variables d'environnement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${status.envVars ? 'text-green-600' : 'text-red-600'}`}>
                {status.envVars ? '✅ OK' : '❌ Erreur'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connexion Base de données</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${status.database ? 'text-green-600' : 'text-red-600'}`}>
                {status.database ? '✅ OK' : '❌ Erreur'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Logs de diagnostic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p>Aucun log pour le moment...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <button
            onClick={testConnection}
            className="px-6 py-3 bg-nude-600 text-white rounded-lg hover:bg-nude-700 font-semibold"
          >
            🔄 Relancer les tests
          </button>
          
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Aller à la page de connexion
          </a>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Solutions possibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Vérifier la configuration Supabase</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Allez sur <a href="https://app.supabase.com" target="_blank" className="text-nude-600 hover:underline">app.supabase.com</a></li>
                <li>Sélectionnez votre projet</li>
                <li>Settings → API → Vérifiez l'URL et la clé</li>
                <li>Authentication → URL Configuration → Ajoutez <code className="bg-gray-100 px-1">http://localhost:3000</code></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Redémarrer le serveur</h3>
              <p className="text-sm text-gray-600">
                Arrêtez et relancez <code className="bg-gray-100 px-1">npm run dev</code> pour recharger les variables d'environnement
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Vérifier le fichier .env.local</h3>
              <p className="text-sm text-gray-600">
                Assurez-vous que le fichier contient les bonnes valeurs sans espaces ni guillemets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
