'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Star, User, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteAppointmentAction } from '@/app/actions/appointments'
import ReviewModal from '@/components/appointments/ReviewModal'

export default function AppointmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState<any>(null)

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

      // Vérifier le rôle
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single()

      if (profileData?.user_type !== 'client') {
        router.push('/login')
        return
      }

      // Récupérer le profil client
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(clientData)
      fetchAppointments(session.user.id)
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          establishment:establishments(name, address, city, average_rating, slug),
          service:services(name, duration, price),
          staff_member:staff_members(first_name, last_name)
        `)
        .eq('client_id', userId)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false })

      setAppointments(data || [])
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Voulez-vous annuler ce rendez-vous ?')) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      if (error) throw error

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      )
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error)
      alert("Impossible d'annuler ce rendez-vous. Veuillez réessayer.")
    }
  }

  const handleRescheduleAppointment = (appointment: any) => {
    if (!appointment.establishment?.slug) {
      alert("Impossible d'ouvrir la modification pour ce rendez-vous.")
      return
    }

    router.push(
      `/booking/${appointment.establishment.slug}?service=${appointment.service_id}&appointmentId=${appointment.id}`
    )
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Voulez-vous supprimer définitivement ce rendez-vous annulé de votre liste ?')) return

    try {
      const result = await deleteAppointmentAction(appointmentId)

      if (result.error) {
        throw new Error(result.error)
      }

      setAppointments((prev) => prev.filter((appointment) => appointment.id !== appointmentId))
      alert('Rendez-vous supprimé avec succès')
    } catch (error: any) {
      console.error('Erreur suppression rendez-vous:', error)
      alert(error.message || "Impossible de supprimer ce rendez-vous. Veuillez réessayer.")
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Réinitialiser l'heure pour la comparaison de date uniquement
    const aptDate = new Date(apt.appointment_date)

    // Si le statut est 'cancelled', on l'affiche uniquement dans l'onglet 'cancelled'
    if (apt.status === 'cancelled') {
      return filter === 'cancelled' || filter === 'all'
    }

    switch (filter) {
      case 'upcoming':
        return aptDate >= today
      case 'past':
        return aptDate < today && apt.status !== 'cancelled'
      case 'cancelled':
        return false // Géré plus haut
      default: // 'all'
        return true
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé'
      case 'pending': return 'En attente'
      case 'cancelled': return 'Annulé'
      case 'completed': return 'Terminé'
      case 'no_show': return 'Non présenté'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mes Rendez-vous</h1>

      <div className="flex justify-end items-center mb-6">
        <Link href="/search">
          <Button className="bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700">
            <Calendar className="w-4 h-4 mr-2" />
            Nouveau rendez-vous
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filtrer:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'upcoming', label: 'À venir' },
              { key: 'past', label: 'Passés' },
              { key: 'cancelled', label: 'Annulés' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as any)}
                className={filter === key ? 'bg-nude-600' : ''}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Aucun rendez-vous' : `Aucun rendez-vous ${filter === 'upcoming' ? 'à venir' : filter === 'past' ? 'passé' : 'annulé'}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'upcoming'
                ? 'Réservez votre premier rendez-vous dès maintenant !'
                : filter === 'all'
                  ? 'Commencez par réserver un rendez-vous dans un salon.'
                  : `Vous n'avez pas de rendez-vous ${filter === 'past' ? 'passés' : 'annulés'}.`
              }
            </p>
            {filter === 'upcoming' && (
              <Link href="/search">
                <Button className="bg-gradient-to-r from-nude-600 to-warm-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Réserver un rendez-vous
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Date et heure */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-nude-600">
                        {new Date(appointment.appointment_date).getDate()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm font-medium">
                        {appointment.start_time}
                      </div>
                    </div>

                    {/* Détails du rendez-vous */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{appointment.service?.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{appointment.establishment?.name}</span>
                          {appointment.establishment?.city && (
                            <span>• {appointment.establishment.city}</span>
                          )}
                        </div>

                        {appointment.staff_member && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <Link
                              href={`/booking/${appointment.establishment.slug}?service=${appointment.service_id}&appointmentId=${appointment.id}`}
                              className="text-sm font-medium text-nude-600 hover:underline"
                            >
                              Modifier
                            </Link>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.service?.duration} min</span>
                          <span>• {appointment.service?.price}DA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Annuler
                      </Button>
                    )}

                    {appointment.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRescheduleAppointment(appointment)}
                      >
                        Modifier
                      </Button>
                    )}

                    {appointment.status === 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        Supprimer
                      </Button>
                    )}

                    {appointment.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-nude-600 hover:bg-nude-50"
                        onClick={() => {
                          setSelectedAppointmentForReview(appointment)
                          setShowReviewModal(true)
                        }}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Laisser un avis
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedAppointmentForReview && (
        <ReviewModal
          appointmentId={selectedAppointmentForReview.id}
          establishmentId={selectedAppointmentForReview.establishment_id}
          establishmentName={selectedAppointmentForReview.establishment?.name || 'Établissement'}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedAppointmentForReview(null)
          }}
          onSuccess={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              fetchAppointments(session.user.id)
            }
          }}
        />
      )}
    </div>
  )
}
