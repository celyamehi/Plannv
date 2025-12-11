'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSessionPage() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // Vérifier la session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      console.log('Session:', currentSession)
      setSession(currentSession)

      if (currentSession?.user) {
        // Récupérer le profil
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()

        console.log('Profil:', profileData)
        console.log('Erreur:', error)
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test de Session</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-semibold">✅ Session active</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p><strong>User ID:</strong> {session.user.id}</p>
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>Email confirmé:</strong> {session.user.email_confirmed_at ? '✅ Oui' : '❌ Non'}</p>
                    <p><strong>Créé le:</strong> {new Date(session.user.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-600 font-semibold">❌ Aucune session active</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-semibold">✅ Profil trouvé</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p><strong>Nom:</strong> {profile.full_name || 'Non défini'}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Type:</strong> {profile.user_type}</p>
                    <p><strong>Téléphone:</strong> {profile.phone || 'Non défini'}</p>
                  </div>
                </div>
              ) : session ? (
                <p className="text-orange-600 font-semibold">⚠️ Profil non trouvé (session existe mais pas de profil)</p>
              ) : (
                <p className="text-gray-600">Pas de session active</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={checkSession}
                className="w-full px-4 py-2 bg-nude-600 text-white rounded-lg hover:bg-nude-700"
              >
                Rafraîchir
              </button>
              {session && (
                <>
                  <a
                    href="/dashboard"
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                  >
                    Aller au Dashboard Client
                  </a>
                  <a
                    href="/professional/pro-dashboard"
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
                  >
                    Aller au Dashboard Pro
                  </a>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      window.location.href = '/login'
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Se déconnecter
                  </button>
                </>
              )}
              {!session && (
                <a
                  href="/login"
                  className="block w-full px-4 py-2 bg-nude-600 text-white rounded-lg hover:bg-nude-700 text-center"
                >
                  Se connecter
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
