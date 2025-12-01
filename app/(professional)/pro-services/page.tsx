'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Clock, Euro, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  is_active: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      // Récupérer l'utilisateur
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Récupérer l'établissement
      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', session.user.id)
        .single()

      if (establishment) {
        setEstablishmentId(establishment.id)

        // Récupérer les services
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('establishment_id', establishment.id)
          .order('name', { ascending: true })

        if (error) throw error
        setServices(data || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!establishmentId) return

    try {
      if (editingService) {
        // Mise à jour
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', editingService.id)

        if (error) throw error
      } else {
        // Création
        const { error } = await supabase
          .from('services')
          .insert({
            ...formData,
            establishment_id: establishmentId,
          })

        if (error) throw error
      }

      // Réinitialiser et recharger
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        is_active: true,
      })
      setEditingService(null)
      setShowForm(false)
      fetchServices()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      is_active: service.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchServices()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id)

      if (error) throw error
      fetchServices()
    } catch (error: any) {
      console.error('Erreur:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-2xl font-semibold">Kalendo Pro</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            <Link href="/professional/pro-dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/professional/calendar" className="text-gray-600 hover:text-gray-900">
              Calendrier
            </Link>
            <Link href="/professional/pro-services" className="text-purple-600 font-medium">
              Services
            </Link>
            <Link href="/professional/pro-staff" className="text-gray-600 hover:text-gray-900">
              Équipe
            </Link>
            <Link href="/professional/settings" className="text-gray-600 hover:text-gray-900">
              <Settings className="w-5 h-5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des services</h1>
            <p className="text-gray-600">Créez et gérez vos prestations</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingService(null)
              setFormData({
                name: '',
                description: '',
                duration: 30,
                price: 0,
                is_active: true,
              })
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau service
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingService ? 'Modifier le service' : 'Nouveau service'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nom du service *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Coupe homme"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prix (€) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      placeholder="25"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Durée (minutes) *
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    placeholder="30"
                    min="5"
                    step="5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez votre service..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Service actif (visible pour les clients)
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    {editingService ? 'Mettre à jour' : 'Créer le service'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingService(null)
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Services List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun service</h3>
              <p className="text-gray-600 mb-6">
                Commencez par créer votre premier service
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {service.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center">
                      <Euro className="w-4 h-4 mr-1" />
                      {service.price}€
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(service)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => toggleActive(service)}
                      variant="outline"
                      size="sm"
                    >
                      {service.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(service.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
