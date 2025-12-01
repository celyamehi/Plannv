'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [establishment, setEstablishment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setMessage('Non connecté')
        setLoading(false)
        return
      }

      setUser(session.user)

      // Vérifier le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        setMessage(`Erreur profil: ${profileError.message}`)
      } else {
        setProfile(profileData)
      }

      // Vérifier l'établissement
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (establishmentError) {
        setMessage(`Profil trouvé! Pas d'établissement: ${establishmentError.message}`)
      } else {
        setEstablishment(establishmentData)
        setMessage('Profil et établissement trouvés!')
      }

    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Utilisateur',
          phone: user.user_metadata?.phone || '',
          user_type: 'professional', // Change ce que tu veux
        })

      if (error) {
        setMessage(`Erreur création: ${error.message}`)
      } else {
        setMessage('Profil créé avec succès!')
        setTimeout(checkProfile, 1000)
      }
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`)
    }
  }

  const createEstablishment = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('establishments')
        .insert({
          owner_id: user.id,
          name: 'Mon Salon Test',
          slug: 'mon-salon-test',
          category: 'coiffeur',
          address: '123 Rue de la Test',
          city: 'Testville',
          postal_code: '75001',
          phone: '0123456789',
          description: 'Salon de test créé depuis la page de test',
          is_active: true,
        })

      if (error) {
        setMessage(`Erreur création établissement: ${error.message}`)
      } else {
        setMessage('Établissement créé avec succès!')
        setTimeout(checkProfile, 1000)
      }
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Vérification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Profil</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Utilisateur</h2>
          {user ? (
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Créé le:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p>Aucun utilisateur connecté</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profil</h2>
          {profile ? (
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {profile.id}</p>
              <p><strong>Nom:</strong> {profile.full_name}</p>
              <p><strong>Téléphone:</strong> {profile.phone}</p>
              <p><strong>Type:</strong> {profile.user_type}</p>
              <p><strong>Créé le:</strong> {new Date(profile.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p>Aucun profil trouvé</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Établissement</h2>
          {establishment ? (
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {establishment.id}</p>
              <p><strong>Nom:</strong> {establishment.name}</p>
              <p><strong>Slug:</strong> {establishment.slug}</p>
              <p><strong>Catégorie:</strong> {establishment.category}</p>
              <p><strong>Adresse:</strong> {establishment.address}</p>
              <p><strong>Ville:</strong> {establishment.city}</p>
              <p><strong>Téléphone:</strong> {establishment.phone}</p>
              <p><strong>Actif:</strong> {establishment.is_active ? 'Oui' : 'Non'}</p>
              <p><strong>Créé le:</strong> {new Date(establishment.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-600">Aucun établissement trouvé - C&apos;est probablement le problème!</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Message</h2>
          <p className="text-sm">{message}</p>
        </div>

        {!profile && user && (
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={createProfile}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition"
            >
              Créer le profil (type: professional)
            </button>
          </div>
        )}

        {profile && !establishment && (
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={createEstablishment}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition"
            >
              Créer l&apos;établissement (nécessaire pour le dashboard)
            </button>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <a href="/login" className="block text-center text-purple-600 hover:text-purple-700">
            → Page de login
          </a>
          <a href="/signup" className="block text-center text-purple-600 hover:text-purple-700">
            → Page d&apos;inscription
          </a>
          <a href="/professionals/signup" className="block text-center text-purple-600 hover:text-purple-700">
            → Inscription professionnelle
          </a>
          <a href="/professional/pro-dashboard" className="block text-center text-purple-600 hover:text-purple-700">
            → Dashboard professionnel
          </a>
        </div>
      </div>
    </div>
  )
}
