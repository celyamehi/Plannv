'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { Plus, Edit, Trash2, Mail, Phone, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import ProSidebar from '../../../components/layout/ProSidebar'

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  specialties: string[]
  is_active: boolean
}

interface Service {
  id: string
  name: string
  category: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null)
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', session.user.id)
        .single()

      if (establishment) {
        setEstablishmentId(establishment.id)

        // Récupérer les services
        const { data: servicesData } = await supabase
          .from('services')
          .select('id, name, category')
          .eq('establishment_id', establishment.id)
          .eq('is_active', true)
          .order('category', { ascending: true })

        setServices(servicesData || [])

        // Récupérer le personnel
        const { data: staffData, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq('establishment_id', establishment.id)
          .order('first_name', { ascending: true })

        if (error) throw error
        
        // S'assurer que specialties est un tableau
        const parsedStaff = (staffData || []).map(member => ({
          ...member,
          specialties: Array.isArray(member.specialties) 
            ? member.specialties 
            : []
        }))
        
        setStaff(parsedStaff)
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
      const specialtiesArray = Array.from(selectedServices)
      
      if (editingMember) {
        const { error } = await supabase
          .from('staff_members')
          .update({
            ...formData,
            specialties: specialtiesArray
          })
          .eq('id', editingMember.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('staff_members')
          .insert({
            ...formData,
            specialties: specialtiesArray,
            establishment_id: establishmentId,
          })

        if (error) throw error
      }

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        is_active: true,
      })
      setSelectedServices(new Set())
      setEditingMember(null)
      setShowForm(false)
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const handleEdit = (member: StaffMember) => {
    setEditingMember(member)
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      is_active: member.is_active,
    })
    setSelectedServices(new Set(member.specialties))
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce collaborateur ?')) return

    try {
      const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    }
  }

  const toggleActive = async (member: StaffMember) => {
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ is_active: !member.is_active })
        .eq('id', member.id)

      if (error) throw error
      fetchData()
    } catch (error: any) {
      console.error('Erreur:', error)
    }
  }

  const toggleServiceSelection = (serviceId: string) => {
    const newSelection = new Set(selectedServices)
    if (newSelection.has(serviceId)) {
      newSelection.delete(serviceId)
    } else {
      newSelection.add(serviceId)
    }
    setSelectedServices(newSelection)
  }

  // Grouper les services par catégorie
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'Autres'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  // Obtenir les noms des services à partir des IDs
  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds
      .map(id => services.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <ProSidebar>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion de l'équipe</h1>
            <p className="text-gray-600">Gérez vos collaborateurs et leurs spécialités</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingMember(null)
              setSelectedServices(new Set())
              setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                is_active: true,
              })
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un collaborateur
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingMember ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prénom *
                    </label>
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="Jean"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nom *
                    </label>
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean.dupont@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Téléphone *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      required
                    />
                  </div>
                </div>

                {/* Sélection des spécialités */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Spécialités / Services proposés *
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Sélectionnez les services que ce collaborateur peut effectuer
                  </p>

                  {services.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Aucun service disponible. Veuillez d'abord créer des services dans la section "Services".
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                        <div key={category}>
                          <h3 className="font-semibold text-md mb-2 text-purple-700">{category}</h3>
                          <div className="grid md:grid-cols-2 gap-2">
                            {categoryServices.map((service) => (
                              <div
                                key={service.id}
                                onClick={() => toggleServiceSelection(service.id)}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedServices.has(service.id)
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedServices.has(service.id)
                                      ? 'bg-purple-600 border-purple-600'
                                      : 'border-gray-300'
                                  }`}>
                                    {selectedServices.has(service.id) && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium">{service.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedServices.size > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedServices.size} service{selectedServices.size > 1 ? 's' : ''} sélectionné{selectedServices.size > 1 ? 's' : ''}
                    </p>
                  )}
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
                    Collaborateur actif
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                    disabled={selectedServices.size === 0}
                  >
                    {editingMember ? 'Mettre à jour' : 'Ajouter le collaborateur'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingMember(null)
                      setSelectedServices(new Set())
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Staff List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : staff.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun collaborateur</h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre premier collaborateur
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un collaborateur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => (
              <Card key={member.id} className={!member.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {member.first_name} {member.last_name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {member.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {member.phone}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {member.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">Spécialités:</p>
                    <p className="text-sm text-gray-700">
                      {member.specialties.length > 0 
                        ? getServiceNames(member.specialties) 
                        : 'Aucune spécialité'}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(member)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => toggleActive(member)}
                      variant="outline"
                      size="sm"
                    >
                      {member.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(member.id)}
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
      </div>
    </ProSidebar>
  )
}
