'use client'

import { useState, useEffect } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react'

export default function DebugLogsPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [cookiesInfo, setCookiesInfo] = useState<any[]>([])

  useEffect(() => {
    setIsClient(true)
    
    // Capturer les logs existants
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    
    const capturedLogs: string[] = []
    
    console.log = (...args: any[]) => {
      originalLog(...args)
      const logMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      capturedLogs.push(`[${new Date().toISOString()}] LOG: ${logMessage}`)
      setLogs([...capturedLogs])
    }
    
    console.error = (...args: any[]) => {
      originalError(...args)
      const logMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      capturedLogs.push(`[${new Date().toISOString()}] ERROR: ${logMessage}`)
      setLogs([...capturedLogs])
    }
    
    console.warn = (...args: any[]) => {
      originalWarn(...args)
      const logMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      capturedLogs.push(`[${new Date().toISOString()}] WARN: ${logMessage}`)
      setLogs([...capturedLogs])
    }
    
    // Récupérer les informations de session et cookies
    const getSessionInfo = async () => {
      try {
        const response = await fetch('/api/debug/session')
        const data = await response.json()
        setSessionInfo(data)
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error)
      }
    }
    
    const getCookiesInfo = () => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').map(cookie => {
          const [name, value] = cookie.trim().split('=')
          return { name, value: value?.substring(0, 50) + (value?.length > 50 ? '...' : '') }
        })
        setCookiesInfo(cookies)
      }
    }
    
    getSessionInfo()
    getCookiesInfo()
    
    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  const clearLogs = () => {
    setLogs([])
  }

  const testRedirection = async (path: string) => {
    console.log(`🧪 TEST - Test de redirection vers ${path}`)
    window.location.href = path
  }

  const getLogIcon = (log: string) => {
    if (log.includes('ERROR:')) return <AlertCircle className="w-4 h-4 text-red-500" />
    if (log.includes('WARN:')) return <AlertCircle className="w-4 h-4 text-yellow-500" />
    if (log.includes('MIDDLEWARE')) return <Info className="w-4 h-4 text-blue-500" />
    if (log.includes('LOGIN')) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (log.includes('DASHBOARD')) return <CheckCircle className="w-4 h-4 text-nude-500" />
    return <Info className="w-4 h-4 text-gray-500" />
  }

  const getLogColor = (log: string) => {
    if (log.includes('ERROR:')) return 'text-red-600 border-red-200'
    if (log.includes('WARN:')) return 'text-yellow-600 border-yellow-200'
    if (log.includes('MIDDLEWARE')) return 'text-blue-600 border-blue-200'
    if (log.includes('LOGIN')) return 'text-green-600 border-green-200'
    if (log.includes('DASHBOARD')) return 'text-nude-600 border-nude-200'
    if (log.includes('AUTH CALLBACK')) return 'text-orange-600 border-orange-200'
    return 'text-gray-600 border-gray-200'
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Chargement de la page de debug...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔍 Page de Debug - Logs de Redirection</h1>
          <p className="text-gray-600">
            Surveillez tous les logs du système pour détecter les problèmes de redirection
          </p>
        </div>

        {/* Informations de session */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations de Session</CardTitle>
            <CardDescription>État actuel de l'authentification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Session Supabase:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : 'Chargement...'}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cookies du navigateur:</h4>
                <div className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-32">
                  {cookiesInfo.length > 0 ? (
                    cookiesInfo.map((cookie, index) => (
                      <div key={index} className="mb-1">
                        <strong>{cookie.name}:</strong> {cookie.value}
                      </div>
                    ))
                  ) : (
                    'Aucun cookie trouvé'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tests de redirection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tests de Redirection</CardTitle>
            <CardDescription>Testez manuellement les redirections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => testRedirection('/login')} 
                variant="outline"
                size="sm"
              >
                Test Login
              </Button>
              <Button 
                onClick={() => testRedirection('/dashboard')} 
                variant="outline"
                size="sm"
              >
                Test Dashboard Client
              </Button>
              <Button 
                onClick={() => testRedirection('/professional/pro-dashboard')} 
                variant="outline"
                size="sm"
              >
                Test Dashboard Pro
              </Button>
              <Button 
                onClick={() => testRedirection('/auth/callback?code=test')} 
                variant="outline"
                size="sm"
              >
                Test Auth Callback
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs en temps réel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Logs en Temps Réel</CardTitle>
              <CardDescription>
                {logs.length} logs capturés • 
                <Badge variant="secondary" className="ml-2">
                  Auto-rafraîchissement
                </Badge>
              </CardDescription>
            </div>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Effacer les logs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length > 0 ? (
                logs.slice(-50).reverse().map((log, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start space-x-2 p-2 rounded border ${getLogColor(log)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log)}
                    </div>
                    <div className="flex-1 text-sm font-mono">
                      {log}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-8 h-8 mx-auto mb-2" />
                  <p>Aucun log capturé pour l'instant</p>
                  <p className="text-sm">
                    Effectuez des actions (connexion, navigation) pour voir les logs apparaître
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• <strong>Pour capturer les logs de middleware:</strong> Naviguez vers différentes pages</p>
              <p>• <strong>Pour tester la connexion:</strong> Utilisez la page de login</p>
              <p>• <strong>Pour tester OAuth:</strong> Cliquez sur "Connexion Google"</p>
              <p>• <strong>Pour voir les redirections:</strong> Essayez d'accéder aux pages protégées</p>
              <p>• <strong>Les logs sont automatiquement capturés</strong> et affichés ici</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
