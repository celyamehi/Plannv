'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { Plus, Edit, Trash2, Clock, Euro, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import ProSidebar from '../../../components/layout/ProSidebar'
import { PREDEFINED_SERVICES, CATEGORIES_BY_TYPE, PreDefinedService } from '../../../lib/predefined-services'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  is_active: boolean
  category?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPredefined, setShowPredefined] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [establishmentCategory, setEstablishmentCategory] = useState<string>('')
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    is_active: true,
    category: 'Autres',
  })
  const [customCategory, setCustomCategory] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id, category')
        .eq('owner_id', session.user.id)
        .single()

      if (establishment) {
        setEstablishmentId(establishment.id)
        setEstablishmentCategory(establishment.category)

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('establishment_id', establishment.id)
          .order('category', { ascending: true })

        if (error) throw error
        setServices(data || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPredefinedServices = async () => {
    if (!establishmentId || selectedServices.size === 0) return

    try {
      const predefinedList = PREDEFINED_SERVICES[establishmentCategory] || []
      const servicesToAdd = predefinedList
        .filter(s => selectedServices.has(s.name))
        .map(s => ({
          establishment_id: establishmentId,
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.suggestedPrice,
          is_active: true,
          category: s.category
        }))

      const { error } = await supabase
        .from('services')
        .insert(servicesToAdd)

      if (error) throw error

      setSelectedServices(new Set())
      setShowPredefined(false)
      fetchServices()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!establishmentId) return

    // Utiliser la catégorie personnalisée si "Autres" est sélectionné et qu'un nom est fourni
    const finalCategory = formData.category === 'Autres' && customCategory.trim() 
      ? customCategory.trim() 
      : formData.category

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update({ ...formData, category: finalCategory })
          .eq('id', editingService.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            ...formData,
            category: finalCategory,
            establishment_id: establishmentId,
          })

        if (error) throw error
      }

      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        is_active: true,
        category: 'Autres',
      })
      setCustomCategory('')
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
    const serviceCategory = service.category || 'Autres'
    const isCustomCategory = !availableCategories.includes(serviceCategory)
    
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      is_active: service.is_active,
      category: isCustomCategory ? 'Autres' : serviceCategory,
    })
    setCustomCategory(isCustomCategory ? serviceCategory : '')
    setShowForm(true)
    setShowPredefined(false)
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

  const toggleServiceSelection = (serviceName: string) => {
    const newSelection = new Set(selectedServices)
    if (newSelection.has(serviceName)) {
      newSelection.delete(serviceName)
    } else {
      newSelection.add(serviceName)
    }
    setSelectedServices(newSelection)
  }

  const predefinedServices = PREDEFINED_SERVICES[establishmentCategory] || []
  const groupedPredefined = predefinedServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, PreDefinedService[]>)

  const groupedServices = services.reduce((acc, service) => {
    const cat = service.category || 'Autres'
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  const availableCategories = CATEGORIES_BY_TYPE[establishmentCategory] || ['Autres']

  return (
    <ProSidebar>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des services</h1>
            <p className="text-gray-600">Créez et gérez vos prestations</p>
          </div>
          <div className="flex space-x-3">
            {predefinedServices.length > 0 && (
              <Button
                onClick={() => {
                  setShowPredefined(!showPredefined)
                  setShowForm(false)
                }}
                variant="outline"
                className="border-purple-600 text-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Services suggérés
              </Button>
            )}
            <Button
              onClick={() => {
                setShowForm(!showForm)
                setShowPredefined(false)
                setEditingService(null)
                setCustomCategory('')
                setFormData({
                  name: '',
                  description: '',
                  duration: 30,
                  price: 0,
                  is_active: true,
                  category: 'Autres',
                })
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Service personnalisé
            </Button>
          </div>
        </div>

        {/* Services pré-définis */}
        {showPredefined && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Services suggérés pour votre établissement</CardTitle>
              <p className="text-sm text-gray-600">
                Sélectionnez les services que vous proposez. Vous pourrez modifier les prix après.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPredefined).map(([category, categoryServices]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-lg mb-3 text-purple-700">{category}</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {categoryServices.map((service) => (
                        <div
                          key={service.name}
                          onClick={() => toggleServiceSelection(service.name)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedServices.has(service.name)
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  selectedServices.has(service.name)
                                    ? 'bg-purple-600 border-purple-600'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedServices.has(service.name) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <h4 className="font-medium">{service.name}</h4>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 ml-7">{service.description}</p>
                              <div className="flex items-center space-x-4 mt-2 ml-7 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {service.duration} min
                                </span>
                                <span className="flex items-center">
                                  <Euro className="w-3 h-3 mr-1" />
                                  {service.suggestedPrice}€
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={handleAddPredefinedServices}
                  disabled={selectedServices.size === 0}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Ajouter {selectedServices.size > 0 && `(${selectedServices.size})`} service{selectedServices.size > 1 ? 's' : ''}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPredefined(false)
                    setSelectedServices(new Set())
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulaire personnalisé */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingService ? 'Modifier le service' : 'Nouveau service personnalisé'}
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
                      Catégorie *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Champ catégorie personnalisée si "Autres" est sélectionné */}
                {formData.category === 'Autres' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nom de la catégorie personnalisée
                    </label>
                    <Input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Ex: Soins spéciaux, Forfaits, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide pour utiliser "Autres" comme catégorie
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
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

        {/* Liste des services */}
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
                Commencez par ajouter vos services
              </p>
              <div className="flex justify-center space-x-3">
                {predefinedServices.length > 0 && (
                  <Button
                    onClick={() => setShowPredefined(true)}
                    variant="outline"
                    className="border-purple-600 text-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Services suggérés
                  </Button>
                )}
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Service personnalisé
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 text-purple-700">{category}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryServices.map((service) => (
                    <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.is_active
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
              </div>
            ))}
          </div>
        )}
      </div>
    </ProSidebar>
  )
}
