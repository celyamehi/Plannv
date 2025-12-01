'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import ProSidebar from '../../../components/layout/ProSidebar'
import { Calendar, Clock, Users, Phone } from 'lucide-react'

interface Appointment {
  id: string
  client_id: string | null
  guest_name?: string
  guest_phone?: string
  service_id: string
  staff_member_id: string
  appointment_date: string
  start_time: string
  end_time?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  client_notes?: string
  services?: { name: string; duration: number; price: number }
  staff_members?: { first_name: string; last_name: string }
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  color?: string
}

export default function ProCallsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  const [filterStaff, setFilterStaff] = useState<string>('all')

  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500']

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    if (establishmentId) {
      loadUpcomingAppointments()
    }
  }, [establishmentId, filterStaff])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/professionals/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (profileData?.user_type !== 'professional' && profileData?.user_type !== 'admin') {
        router.push('/login')
        return
      }

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', session.user.id)
        .single()

      if (!establishment) return
      setEstablishmentId(establishment.id)

      // Charger les collaborateurs
      const { data: staffData } = await supabase
        .from('staff_members')
        .select('id, first_name, last_name')
        .eq('establishment_id', establishment.id)
        .eq('is_active', true)

      const parsedStaff = (staffData || []).map((member, index) => ({
        ...member,
        color: colors[index % colors.length]
      }))

      setStaffMembers(parsedStaff)
      await loadUpcomingAppointments()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUpcomingAppointments = async () => {
    if (!establishmentId) return

    try {
      // Date d'aujourd'hui au format ISO
      const today = new Date().toISOString().split('T')[0]
      console.log('📅 Chargement RDV à partir de:', today)

      let query = supabase
        .from('appointments')
        .select(`
          *,
          services (name, duration, price),
          staff_members (first_name, last_name)
        `)
        .eq('establishment_id', establishmentId)
        .eq('appointment_date', today)
        .eq('status', 'confirmed')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (filterStaff !== 'all') {
        query = query.eq('staff_member_id', filterStaff)
      }

      const { data, error } = await query
      if (error) throw error

      console.log('✅ RDV chargés pour aujourd\'hui:', data)
      setUpcomingAppointments(data || [])
    } catch (error) {
      console.error('Erreur chargement RDV:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = { confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé', completed: 'Terminé' }
    return labels[status as keyof typeof labels] || status
  }

  const getClientName = (appointment: Appointment) => {
    return appointment.guest_name || 'Client'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const groupByDate = (appointments: Appointment[]) => {
    return appointments.reduce((acc, appointment) => {
      const date = appointment.appointment_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(appointment)
      return acc
    }, {} as Record<string, Appointment[]>)
  }

  const groupedAppointments = groupByDate(upcomingAppointments)

  return (
    <ProSidebar>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Appels & Suivi</h1>
            <p className="text-gray-600">Rendez-vous confirmés à contacter</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded-md text-sm"
            >
              <option value="all">Tous les collaborateurs</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun rendez-vous confirmé aujourd'hui</p>
                <p className="text-sm text-gray-500 mt-2">Les RDV confirmés apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedAppointments).map(([date, appointments]) => (
                  <div key={date}>
                    <h2 className="text-xl font-semibold mb-4 text-purple-700">
                      {formatDate(date)}
                    </h2>
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <Card key={appointment.id} className="hover:border-purple-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                    {getStatusLabel(appointment.status)}
                                  </span>
                                  <span className="text-sm text-gray-500 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {appointment.start_time}
                                  </span>
                                </div>
                                
                                <div className="grid md:grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">Client</p>
                                    <p className="font-semibold text-lg">{getClientName(appointment)}</p>
                                    {appointment.guest_phone && (
                                      <p className="text-sm text-gray-600">{appointment.guest_phone}</p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-gray-500">Service</p>
                                    <p className="font-semibold">{appointment.services?.name}</p>
                                    <p className="text-sm text-gray-600">
                                      {appointment.services?.duration} min • {appointment.services?.price}€
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-gray-500">Collaborateur</p>
                                    <p className="font-semibold">
                                      {appointment.staff_members?.first_name} {appointment.staff_members?.last_name}
                                    </p>
                                  </div>
                                </div>

                                {appointment.client_notes && (
                                  <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p className="text-sm text-gray-700">{appointment.client_notes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => window.open(`tel:${appointment.guest_phone || ''}`, '_blank')}
                                >
                                  <Phone className="w-4 h-4 mr-1" />
                                  Appeler
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProSidebar>
  )
}
