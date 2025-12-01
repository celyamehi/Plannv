'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Calendar, Clock, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

interface PageProps {
  params: {
    id: string
  }
}

export default function ConfirmationPage({ params }: PageProps) {
  const router = useRouter()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // Vérifier l'authentification
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        // Récupérer la réservation
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            establishment:establishments(name, address, city, phone),
            service:services(name, duration, price),
            staff_member:staff_members(first_name, last_name)
          `)
          .eq('id', params.id)
          .eq('client_id', session.user.id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Rendez-vous non trouvé')
        
        setAppointment(data)
      } catch (err) {
        console.error('Erreur:', err)
        setError('Impossible de charger les détails du rendez-vous')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement de votre réservation...</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Impossible de charger les détails du rendez-vous'}
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Réservation confirmée !</h1>
          <p className="text-gray-600">
            Votre rendez-vous a été enregistré avec succès
          </p>
        </div>

        {/* Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Détails de votre rendez-vous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Establishment */}
            <div>
              <h3 className="font-semibold text-lg mb-2">{appointment.establishment.name}</h3>
              <div className="flex items-start space-x-2 text-gray-600">
                <MapPin className="w-5 h-5 mt-0.5" />
                <div>
                  <p>{appointment.establishment.address}</p>
                  <p>{appointment.establishment.city}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 grid md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Date</span>
                </div>
                <p className="text-lg font-semibold">
                  {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Heure</span>
                </div>
                <p className="text-lg font-semibold">{appointment.start_time.slice(0, 5)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {/* Service */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Service</p>
                <p className="font-semibold">{appointment.service.name}</p>
                <p className="text-sm text-gray-500">{appointment.service.duration} minutes</p>
              </div>

              {/* Staff Member */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Avec</span>
                </div>
                <p className="font-semibold">
                  {appointment.staff_member.first_name} {appointment.staff_member.last_name}
                </p>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {appointment.service.price}€
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">📞 Confirmation requise</h3>
            <p className="text-sm text-gray-700">
              Vous recevrez un appel la veille du rendez-vous pour confirmer votre présence.
              Si nous ne parvenons pas à vous joindre, le rendez-vous sera automatiquement annulé.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/client/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Voir mes rendez-vous
            </Button>
          </Link>
          <Link href="/search" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              Réserver un autre rendez-vous
            </Button>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Besoin d'aide ? Contactez l'établissement au{' '}
            <a
              href={`tel:${appointment.establishment.phone}`}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {appointment.establishment.phone}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
