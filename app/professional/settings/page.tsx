'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Save, Building, Phone, Mail, MapPin, Globe, Clock, LogOut } from 'lucide-react'
import ProSidebar from '../../../components/layout/ProSidebar'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import LocationPicker from '../../../components/ui/LocationPicker'

export default function ProSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [establishment, setEstablishment] = useState<any>(null)
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: '',
    avatar_url: ''
  })
  
  const [establishmentData, setEstablishmentData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Algérie',
    latitude: null as number | null,
    longitude: null as number | null,
    phone: '',
    email: '',
    website: '',
    opening_hours: '',
    cover_image_url: '',
    gallery: [] as string[]
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Vérifier le type d'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, full_name, phone, email, avatar_url')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.user_type !== 'professional') {
        router.push('/dashboard')
        return
      }

      setUser(profile)
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      })

      // Récupérer l'établissement
      const { data: estData } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (estData) {
        setEstablishment(estData)
        setEstablishmentData({
          name: estData.name || '',
          description: estData.description || '',
          address: estData.address || '',
          city: estData.city || '',
          postal_code: estData.postal_code || '',
          country: estData.country || 'Algérie',
          latitude: estData.latitude || null,
          longitude: estData.longitude || null,
          phone: estData.phone || '',
          email: estData.email || '',
          website: estData.website || '',
          opening_hours: estData.opening_hours || '',
          cover_image_url: estData.cover_image_url || '',
          gallery: estData.gallery || []
        })
      }

    } catch (error) {
      console.error('Erreur checkAuth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url
        })
        .eq('id', session.user.id)

      if (error) throw error

      // Synchroniser également dans professionals si la ligne existe
      await supabase
        .from('professionals')
        .update({
          avatar_url: profileData.avatar_url
        })
        .eq('id', session.user.id)
      
      alert('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      alert('Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (urls: string[]) => {
    const newAvatar = urls[0] || ''
    setProfileData(prev => ({
      ...prev,
      avatar_url: newAvatar
    }))

    // Sauvegarde automatique et immédiate de l'avatar
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase
          .from('profiles')
          .update({ avatar_url: newAvatar })
          .eq('id', session.user.id)

        await supabase
          .from('professionals')
          .update({ avatar_url: newAvatar })
          .eq('id', session.user.id)
      }
    } catch (err) {
      console.error('Erreur auto-save avatar:', err)
    }
  }

  const handleEstablishmentUpdate = async () => {
    setSaving(true)
    try {
      if (!establishment) return

      const { error } = await supabase
        .from('establishments')
        .update({
          name: establishmentData.name,
          description: establishmentData.description,
          address: establishmentData.address,
          city: establishmentData.city,
          postal_code: establishmentData.postal_code,
          country: establishmentData.country,
          latitude: establishmentData.latitude,
          longitude: establishmentData.longitude,
          phone: establishmentData.phone,
          email: establishmentData.email,
          website: establishmentData.website,
          opening_hours: establishmentData.opening_hours,
          cover_image_url: establishmentData.cover_image_url,
          gallery: establishmentData.gallery
        })
        .eq('id', establishment.id)

      if (error) throw error
      
      alert('Établissement mis à jour avec succès')
    } catch (error) {
      console.error('Erreur mise à jour établissement:', error)
      alert('Erreur lors de la mise à jour de l\'établissement')
    } finally {
      setSaving(false)
    }
  }

  const handleGalleryUpload = (urls: string[]) => {
    setEstablishmentData((prev) => ({
      ...prev,
      gallery: urls
    }))
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <ProSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Chargement des paramètres...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <ProSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
            <p className="text-gray-600">Gérez votre profil et les informations de votre établissement</p>
          </div>

          {/* Profil personnel */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Mail className="w-5 h-5 mr-2 text-nude-600" />
                Profil personnel
              </CardTitle>
              <CardDescription>
                Informations et photo de votre compte professionnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Photo de profil */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">Photo de profil</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Choisissez une photo qui vous représente sur la plateforme et auprès de vos clients.
                </p>
                <ImageUploader
                  onUpload={handleAvatarUpload}
                  maxFiles={1}
                  initialImages={profileData.avatar_url ? [profileData.avatar_url] : []}
                  folder={`avatars/${user?.id || 'pro'}`}
                  isAvatar={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                  placeholder="Votre email (non modifiable)"
                />
              </div>
              <Button onClick={handleProfileUpdate} disabled={saving} className="mt-2 bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
              </Button>
            </CardContent>
          </Card>

          {/* Informations établissement */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Building className="w-5 h-5 mr-2 text-nude-600" />
                Établissement
              </CardTitle>
              <CardDescription>
                Informations et galerie photos de votre établissement professionnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="establishmentName">Nom de l'établissement</Label>
                <Input
                  id="establishmentName"
                  value={establishmentData.name}
                  onChange={(e) => setEstablishmentData({...establishmentData, name: e.target.value})}
                  placeholder="Nom de votre établissement"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={establishmentData.description}
                  onChange={(e) => setEstablishmentData({...establishmentData, description: e.target.value})}
                  placeholder="Décrivez votre établissement"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Localisation de l'établissement (Adresse & Google Maps)</Label>
                <LocationPicker
                  initialLocation={{
                    address: establishmentData.address,
                    city: establishmentData.city,
                    postalCode: establishmentData.postal_code,
                    latitude: establishmentData.latitude,
                    longitude: establishmentData.longitude,
                  }}
                  onLocationSelect={(location) => {
                    setEstablishmentData(prev => ({
                      ...prev,
                      address: location.address,
                      city: location.city,
                      postal_code: location.postalCode,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      country: 'Algérie'
                    }))
                  }}
                  showDirectFields={true}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="establishmentPhone">Téléphone</Label>
                  <Input
                    id="establishmentPhone"
                    value={establishmentData.phone}
                    onChange={(e) => setEstablishmentData({...establishmentData, phone: e.target.value})}
                    placeholder="Téléphone de l'établissement"
                  />
                </div>
                <div>
                  <Label htmlFor="establishmentEmail">Email</Label>
                  <Input
                    id="establishmentEmail"
                    value={establishmentData.email}
                    onChange={(e) => setEstablishmentData({...establishmentData, email: e.target.value})}
                    placeholder="Email de contact"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={establishmentData.website}
                  onChange={(e) => setEstablishmentData({...establishmentData, website: e.target.value})}
                  placeholder="https://votre-site-web.com"
                />
              </div>
              <div>
                <Label htmlFor="openingHours">Horaires d'ouverture</Label>
                <Textarea
                  id="openingHours"
                  value={establishmentData.opening_hours}
                  onChange={(e) => setEstablishmentData({...establishmentData, opening_hours: e.target.value})}
                  placeholder="Lundi: 9h-18h&#10;Mardi: 9h-18h&#10;..."
                  rows={4}
                />
              </div>

              {/* Photos de l'établissement */}
              <div className="border border-nude-200/80 rounded-2xl p-5 bg-white/70 space-y-6">
                {/* 1. Photo de profil du salon (Photo principale affichée sur la recherche et la bannière) */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900">Photo de profil du salon (Photo principale)</h3>
                    <span className="text-[11px] bg-nude-100 text-nude-800 font-semibold px-2.5 py-0.5 rounded-full">
                      Affichée sur la recherche & bannière
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Cette photo représente votre salon sur la carte des résultats de recherche et s'affiche en grand sur la bannière de votre salon.
                  </p>
                  <ImageUploader
                    onUpload={(urls) => setEstablishmentData(prev => ({ ...prev, cover_image_url: urls[0] || '' }))}
                    maxFiles={1}
                    initialImages={establishmentData.cover_image_url ? [establishmentData.cover_image_url] : []}
                    folder={establishment ? `${establishment.id}/cover` : 'default/cover'}
                  />
                </div>

                {/* 2. Galerie photos du salon */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-base font-bold text-gray-900 mb-1">Galerie photos du salon</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Ajoutez jusqu'à 10 photos supplémentaires pour présenter votre établissement, l'intérieur et vos réalisations aux clients.
                  </p>
                  <ImageUploader
                    onUpload={handleGalleryUpload}
                    maxFiles={10}
                    initialImages={establishmentData.gallery || []}
                    folder={establishment ? `${establishment.id}/gallery` : 'default/gallery'}
                  />
                </div>
              </div>

              <Button onClick={handleEstablishmentUpdate} disabled={saving} className="mt-4 bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer l\'établissement'}
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Actions de sécurité et de gestion du compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
