'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/ui/ImageUploader'
import { toast } from 'sonner'
import ProSidebar from '@/components/layout/ProSidebar'

export default function EstablishmentSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [establishment, setEstablishment] = useState<{
    id: string
    name: string
    description: string | null
    address: string | null
    city: string | null
    postal_code: string | null
    phone: string | null
    email: string | null
    website: string | null
    logo_url: string | null
    gallery: string[]
  } | null>(null)

  const router = useRouter()

  useEffect(() => {
    fetchEstablishment()
  }, [])

  const fetchEstablishment = async () => {
    try {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: establishmentData, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (error) throw error

      setEstablishment({
        ...establishmentData,
        gallery: establishmentData.gallery || []
      })
    } catch (error) {
      console.error('Error fetching establishment:', error)
      toast.error('Erreur lors du chargement des informations de l\'établissement')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!establishment) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('establishments')
        .update({
          name: establishment.name,
          description: establishment.description,
          address: establishment.address,
          city: establishment.city,
          postal_code: establishment.postal_code,
          phone: establishment.phone,
          email: establishment.email,
          website: establishment.website,
          logo_url: establishment.logo_url,
          gallery: establishment.gallery,
          updated_at: new Date().toISOString()
        })
        .eq('id', establishment.id)

      if (error) throw error

      toast.success('Paramètres enregistrés avec succès')
    } catch (error) {
      console.error('Error updating establishment:', error)
      toast.error('Erreur lors de la mise à jour des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (urls: string[]) => {
    if (!establishment) return
    setEstablishment({
      ...establishment,
      logo_url: urls[0] || null
    })
  }

  const handleGalleryUpload = (urls: string[]) => {
    if (!establishment) return
    setEstablishment({
      ...establishment,
      gallery: urls
    })
  }

  if (loading) {
    return (
      <ProSidebar>
        <div className="p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProSidebar>
    )
  }

  if (!establishment) {
    return (
      <ProSidebar>
        <div className="p-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Aucun établissement trouvé</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez d'abord créer un établissement pour accéder aux paramètres.
            </p>
            <Button onClick={() => router.push('/professional/onboarding')}>
              Créer un établissement
            </Button>
          </div>
        </div>
      </ProSidebar>
    )
  }

  return (
    <ProSidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Paramètres de l'établissement</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les informations et l'apparence de votre établissement
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="appearance">Apparence</TabsTrigger>
              <TabsTrigger value="gallery">Galerie photos</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Ces informations seront visibles par les clients sur votre page d'établissement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de l'établissement *</Label>
                      <Input
                        id="name"
                        value={establishment.name || ''}
                        onChange={(e) => setEstablishment({ ...establishment, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email de contact</Label>
                      <Input
                        id="email"
                        type="email"
                        value={establishment.email || ''}
                        onChange={(e) => setEstablishment({ ...establishment, email: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={establishment.description || ''}
                      onChange={(e) => setEstablishment({ ...establishment, description: e.target.value })}
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      Décrivez votre établissement en quelques phrases (max 500 caractères).
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Coordonnées</CardTitle>
                  <CardDescription>
                    Ces informations permettront aux clients de vous localiser.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={establishment.address || ''}
                      onChange={(e) => setEstablishment({ ...establishment, address: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Code postal</Label>
                      <Input
                        id="postal_code"
                        value={establishment.postal_code || ''}
                        onChange={(e) => setEstablishment({ ...establishment, postal_code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={establishment.city || ''}
                        onChange={(e) => setEstablishment({ ...establishment, city: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={establishment.phone || ''}
                        onChange={(e) => setEstablishment({ ...establishment, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        type="url"
                        value={establishment.website || ''}
                        onChange={(e) => setEstablishment({ ...establishment, website: e.target.value })}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apparence</CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence de votre page d'établissement.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Logo</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Téléchargez le logo de votre établissement. Il sera affiché sur votre page et dans les confirmations de rendez-vous.
                      </p>
                      <ImageUploader
                        onUpload={handleLogoUpload}
                        maxFiles={1}
                        initialImages={establishment.logo_url ? [establishment.logo_url] : []}
                        folder={`${establishment.id}/logo`}
                        isLogo
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Galerie photos</CardTitle>
                  <CardDescription>
                    Ajoutez jusqu'à 10 photos de votre établissement pour le présenter à vos clients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    onUpload={handleGalleryUpload}
                    maxFiles={10}
                    initialImages={establishment.gallery || []}
                    folder={`${establishment.id}/gallery`}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </ProSidebar>
  )
}
