'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import ProSidebar from '../../../components/layout/ProSidebar'
import { Phone, Clock, Calendar, CheckCircle, XCircle, MessageSquare, User, Filter } from 'lucide-react'

interface CallItem {
  id: string
  client_name: string
  client_phone: string
  service_name: string
  appointment_time: string
  appointment_date: string
  staff_name: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_answer'
  notes?: string
  call_attempts: number
}

export default function ProCallsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [calls, setCalls] = useState<CallItem[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [callNotes, setCallNotes] = useState('')

  useEffect(() => {
    checkAuthAndLoadCalls()
  }, [filterStatus])

  const checkAuthAndLoadCalls = async () => {
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

      await loadCalls()
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/professionals/login')
    } finally {
      setLoading(false)
    }
  }

  const loadCalls = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', session.user.id)
        .single()

      if (!establishment) return

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      let query = supabase
        .from('appointments')
        .select(`
          id,
          guest_name,
          guest_phone,
          appointment_date,
          start_time,
          status,
          client_notes,
          services (name),
          staff_members (first_name, last_name)
        `)
        .eq('establishment_id', establishment.id)
        .eq('appointment_date', tomorrowStr)
        .in('status', ['pending', 'confirmed'])
        .order('start_time', { ascending: true })

      const { data: appointments, error } = await query
      if (error) throw error

      const callItems: CallItem[] = (appointments || []).map(apt => ({
        id: apt.id,
        client_name: apt.guest_name || 'Client',
        client_phone: apt.guest_phone || '',
        service_name: apt.services?.name || '',
        appointment_time: apt.start_time.substring(0, 5),
        appointment_date: apt.appointment_date,
        staff_name: `${apt.staff_members?.first_name || ''} ${apt.staff_members?.last_name || ''}`.trim(),
        status: apt.status as CallItem['status'],
        notes: apt.client_notes,
        call_attempts: 0
      }))

      const filteredCalls = filterStatus === 'all' 
        ? callItems 
        : callItems.filter(call => call.status === filterStatus)

      setCalls(filteredCalls)
    } catch (error) {
      console.error('Erreur chargement appels:', error)
    }
  }

  const updateCallStatus = async (callId: string, status: CallItem['status'], notes?: string) => {
    try {
      await supabase
        .from('appointments')
        .update({ 
          status: status === 'no_answer' ? 'pending' : status,
          client_notes: notes 
        })
        .eq('id', callId)

      setCalls(prevCalls => 
        prevCalls.map(call => 
          call.id === callId 
            ? { 
                ...call, 
                status, 
                notes: notes || call.notes,
                call_attempts: status === 'no_answer' ? call.call_attempts + 1 : call.call_attempts
              }
            : call
        )
      )
      setShowNotesModal(false)
      setSelectedCall(null)
      setCallNotes('')
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'no_answer':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé'
      case 'pending':
        return 'En attente'
      case 'cancelled':
        return 'Annulé'
      case 'no_answer':
        return 'Pas de réponse'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'no_answer':
        return <Phone className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const makePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self')
  }

  if (loading) {
    return (
      <ProSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </ProSidebar>
    )
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    <ProSidebar>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Appels de confirmation
            </h1>
            <p className="text-gray-600">
              Confirmez les rendez-vous du {tomorrow.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <Button onClick={() => loadCalls()}>
            <Filter className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total appels</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calls.length}</div>
              <p className="text-xs text-muted-foreground">Rendez-vous à confirmer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {calls.filter(call => call.status === 'confirmed').length}
              </div>
              <p className="text-xs text-muted-foreground">Clients ont confirmé</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {calls.filter(call => call.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">À appeler</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pas de réponse</CardTitle>
              <Phone className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {calls.filter(call => call.status === 'no_answer').length}
              </div>
              <p className="text-xs text-muted-foreground">À rappeler</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous les appels</option>
                <option value="pending">En attente d'appel</option>
                <option value="confirmed">Confirmés</option>
                <option value="no_answer">Pas de réponse</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des appels à effectuer</CardTitle>
            <CardDescription>
              {calls.filter(call => call.status === 'pending').length} appels en attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calls.length > 0 ? (
              <div className="space-y-4">
                {calls.map((call) => (
                  <div key={call.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{call.client_name}</h3>
                            <p className="text-sm text-gray-600">{call.client_phone}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(call.appointment_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{call.appointment_time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{call.staff_name}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Service : {call.service_name}</p>
                          {call.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <MessageSquare className="w-3 h-3 inline mr-1" />
                              {call.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getStatusColor(call.status)}`}>
                            {getStatusIcon(call.status)}
                            <span>{getStatusLabel(call.status)}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => makePhoneCall(call.client_phone)}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Appeler
                        </Button>
                        
                        {call.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => {
                                setSelectedCall(call)
                                setCallNotes('')
                                setShowNotesModal(true)
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmer
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun appel à effectuer
                </h3>
                <p className="text-gray-600">
                  Tous les rendez-vous de demain ont été traités
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {showNotesModal && selectedCall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Confirmer le rendez-vous</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Client : {selectedCall.client_name}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Rendez-vous : {selectedCall.appointment_time} - {selectedCall.service_name}
                </p>
                
                <label className="block text-sm font-medium mb-2">Notes (optionnel)</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Ajoutez des notes sur cet appel..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => updateCallStatus(selectedCall.id, 'confirmed', callNotes)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmer
                </Button>
                <Button
                  onClick={() => updateCallStatus(selectedCall.id, 'cancelled', callNotes)}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    setShowNotesModal(false)
                    setSelectedCall(null)
                    setCallNotes('')
                  }}
                  variant="ghost"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProSidebar>
  )
}
