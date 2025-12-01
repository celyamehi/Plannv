'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Mail, Phone, Settings, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  specialties: string
  is_active: boolean
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null)
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialties: '',
    is_active: true,
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
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

        const { data, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq('establishment_id', establishment.id)
          .order('first_name', { ascending: true })

        if (error) throw error
        setStaff(data || [])
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
      if (editingMember) {
        const { error } = await supabase
          .from('staff_members')
          .update(formData)
          .eq('id', editingMember.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('staff_members')
          .insert({
            ...formData,
            establishment_id: establishmentId,
          })

        if (error) throw error
      }

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialties: '',
        is_active: true,
      })
      setEditingMember(null)
      setShowForm(false)
      fetchStaff()
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
      specialties: member.specialties,
      is_active: member.is_active,
    })
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
      fetchStaff()
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
      fetchStaff()
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
            <Link href="/professional/pro-services" className="text-gray-600 hover:text-gray-900">
              Services
            </Link>
            <Link href="/professional/pro-staff" className="text-purple-600 font-medium">
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
            <h1 className="text-3xl font-bold mb-2">Gestion de l'équipe</h1>
            <p className="text-gray-600">Gérez vos collaborateurs et leurs disponibilités</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm)
              setEditingMember(null)
              setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                specialties: '',
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
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Spécialités
                  </label>
                  <Input
                    type="text"
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    placeholder="Ex: Coloriste, Barbier expert..."
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
                    Collaborateur actif
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    {editingMember ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingMember(null)
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
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun collaborateur</h3>
              <p className="text-gray-600 mb-6">
                Ajoutez les membres de votre équipe
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
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {member.first_name} {member.last_name}
                      </h3>
                      {member.specialties && (
                        <p className="text-sm text-gray-600">{member.specialties}</p>
                      )}
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${member.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                        {member.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <a href={`mailto:${member.email}`} className="hover:text-purple-600">
                        {member.email}
                      </a>
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${member.phone}`} className="hover:text-purple-600">
                          {member.phone}
                        </a>
                      </div>
                    )}
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
      </main>
    </div>
  )
}
