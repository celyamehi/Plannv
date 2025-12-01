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

export default function ProSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [establishment, setEstablishment] = useState<any>(null)
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: ''
  })
  
  const [establishmentData, setEstablishmentData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    opening_hours: '',
    logo_url: '',
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
        .select('user_type, full_name, phone, email')
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
        email: profile.email || ''
      })

      // Récupérer l'établissement
      const { data: establishmentData } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (establishmentData) {
        setEstablishment(establishmentData)
        setEstablishmentData({
          name: establishmentData.name || '',
          description: establishmentData.description || '',
          address: establishmentData.address || '',
          city: establishmentData.city || '',
          postal_code: establishmentData.postal_code || '',
          country: establishmentData.country || '',
          phone: establishmentData.phone || '',
          email: establishmentData.email || '',
          website: establishmentData.website || '',
          opening_hours: establishmentData.opening_hours || '',
          logo_url: establishmentData.logo_url || '',
          gallery: establishmentData.gallery || []
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
          phone: profileData.phone
        })
        .eq('id', session.user.id)

      if (error) throw error
      
      alert('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      alert('Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const handleEstablishmentUpdate = async () => {
    setSaving(true)
    try {
      if (!establishment) return

      const { error } = await supabase
        .from('establishments')
        .update(establishmentData)
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

  const handleLogoUpload = (urls: string[]) => {
    setEstablishmentData((prev) => ({
      ...prev,
      logo_url: urls[0] || ''
    }))
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
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Profil personnel
              </CardTitle>
              <CardDescription>
                Informations sur votre compte professionnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button onClick={handleProfileUpdate} disabled={saving} className="mt-4">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
              </Button>
            </CardContent>
          </Card>

          {/* Informations établissement */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Établissement
              </CardTitle>
              <CardDescription>
                Informations sur votre établissement professionnel
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
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={establishmentData.address}
                  onChange={(e) => setEstablishmentData({...establishmentData, address: e.target.value})}
                  placeholder="Adresse complète"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={establishmentData.city}
                    onChange={(e) => setEstablishmentData({...establishmentData, city: e.target.value})}
                    placeholder="Ville"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    value={establishmentData.postal_code}
                    onChange={(e) => setEstablishmentData({...establishmentData, postal_code: e.target.value})}
                    placeholder="Code postal"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={establishmentData.country}
                  onChange={(e) => setEstablishmentData({...establishmentData, country: e.target.value})}
                  placeholder="Pays"
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

              <div className="border rounded-lg p-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Logo</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Téléchargez le logo de votre établissement. Format carré recommandé.
                  </p>
                  <ImageUploader
                    onUpload={handleLogoUpload}
                    maxFiles={1}
                    initialImages={establishmentData.logo_url ? [establishmentData.logo_url] : []}
                    folder={establishment ? `${establishment.id}/logo` : 'default/logo'}
                    isLogo
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-1">Galerie photos</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Ajoutez jusqu'à 10 photos pour présenter votre établissement aux clients.
                  </p>
                  <ImageUploader
                    onUpload={handleGalleryUpload}
                    maxFiles={10}
                    initialImages={establishmentData.gallery || []}
                    folder={establishment ? `${establishment.id}/gallery` : 'default/gallery'}
                  />
                </div>
              </div>

              <Button onClick={handleEstablishmentUpdate} disabled={saving} className="mt-4">
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
