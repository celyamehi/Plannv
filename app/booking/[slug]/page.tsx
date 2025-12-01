'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { BookingCalendar } from '@/components/booking/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Check } from 'lucide-react'

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  specialties?: string[] | null
}

export default function BookingPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')

  const [establishment, setEstablishment] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(serviceId)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [step, setStep] = useState(1)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
    
    // Vérifier si on est en mode édition (appointmentId dans l'URL)
    const appointmentId = searchParams.get('appointmentId')
    if (appointmentId) {
      fetchAppointment(appointmentId)
    }
  }, [params.slug, searchParams])

  const fetchData = async () => {
    try {
      // Récupérer l'établissement
      const { data: estData } = await supabase
        .from('establishments')
        .select('*')
        .eq('slug', params.slug)
        .single()

      if (estData) {
        setEstablishment(estData)

        // Récupérer les services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('establishment_id', estData.id)
          .eq('is_active', true)

        setServices(servicesData || [])

        // Récupérer les collaborateurs
        const { data: staffData } = await supabase
          .from('staff_members')
          .select('*')
          .eq('establishment_id', estData.id)
          .eq('is_active', true)

        setStaff(
          (staffData || []).map((member) => ({
            ...member,
            specialties: Array.isArray(member.specialties)
              ? member.specialties
              : member.specialties
              ? [member.specialties]
              : []
          }))
        )
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSelectedStaff(null)
    setSelectedDate(null)
    setSelectedTime(null)
  }, [selectedService])

  const eligibleStaff = useMemo(() => {
    if (!selectedService) return []
    return staff.filter((member) =>
      Array.isArray(member.specialties) && member.specialties.includes(selectedService)
    )
  }, [staff, selectedService])

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const fetchAppointment = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (error) throw error

      if (data) {
        setEditingAppointmentId(appointmentId)
        setSelectedService(data.service_id)
        setNotes(data.client_notes || '')
        setSelectedDate(new Date(data.appointment_date))
        
        // Trouver le membre du staff correspondant
        const staffMember = staff.find(s => s.id === data.staff_member_id)
        if (staffMember) {
          setSelectedStaff(staffMember)
        }
        
        // Passer à l'étape 2 si tout est chargé
        setStep(2)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du rendez-vous:', error)
      alert('Impossible de charger le rendez-vous à modifier')
    }
  }

  const handleBooking = async () => {
    if (!selectedService || !selectedStaff?.id || !selectedDate || !selectedTime) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setBooking(true)

    try {
      // Vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=/booking/' + params.slug)
        return
      }

      // Préparer les données du rendez-vous
      const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      const appointmentDate = localDate.toISOString().split('T')[0]

      const [startHour, startMinute] = selectedTime.split(':').map(Number)
      const duration = selectedServiceData?.duration || 0
      const endTotalMinutes = startHour * 60 + startMinute + duration
      const endHour = Math.floor(endTotalMinutes / 60) % 24
      const endMinute = endTotalMinutes % 60
      const formattedStartTime = `${startHour.toString().padStart(2, '0')}:${startMinute
        .toString()
        .padStart(2, '0')}:00`
      const formattedEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute
        .toString()
        .padStart(2, '0')}:00`

      const appointmentData = {
        establishment_id: establishment.id,
        client_id: session.user.id,
        staff_member_id: selectedStaff.id,
        service_id: selectedService,
        appointment_date: appointmentDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        client_notes: notes,
        total_price: selectedServiceData?.price || 0,
      }

      let result
      
      if (editingAppointmentId) {
        // Mise à jour d'un rendez-vous existant
        const { data, error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingAppointmentId)
          .select()
          .single()
          
        if (error) throw error
        result = data
      } else {
        // Création d'un nouveau rendez-vous
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            ...appointmentData,
            status: 'pending'
          })
          .select()
          .single()
          
        if (error) throw error
        result = data
      }

      // Rediriger vers la confirmation
      router.push(`/booking/confirmation/${result.id}`)
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('Erreur lors de la réservation: ' + error.message)
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const selectedServiceData = services.find(s => s.id === selectedService)
  const galleryImages = Array.isArray(establishment?.gallery) ? establishment?.gallery : []
  const heroImage = establishment?.cover_image_url || galleryImages[0] || establishment?.logo_url

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/establishments/${params.slug}`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'établissement
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Réserver un rendez-vous</h1>
          <div className="flex items-center gap-4 mb-8">
            {establishment?.logo_url && (
              <div className="w-14 h-14 rounded-xl overflow-hidden border">
                <img
                  src={establishment.logo_url}
                  alt={`Logo ${establishment.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-gray-600">{establishment?.name}</p>
              {establishment?.city && (
                <p className="text-sm text-gray-500">{establishment.city}</p>
              )}
            </div>
          </div>

          {heroImage && (
            <div className="mb-10 rounded-2xl overflow-hidden h-60">
              <img
                src={heroImage}
                alt={`Photo ${establishment?.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > s ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>1. Choisissez un service</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedService === service.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {service.duration} min
                            </p>
                          </div>
                          <span className="text-lg font-bold text-purple-600">
                            {service.price}€
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedService}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Continuer
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Staff & Date Selection */}
              {step === 2 && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Choisissez un collaborateur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {eligibleStaff.length === 0 ? (
                        <div className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-gray-500">
                          Aucun collaborateur ne peut réaliser cette prestation pour le moment.
                        </div>
                      ) : (
                        eligibleStaff.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => setSelectedStaff(member)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedStaff?.id === member.id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {member.first_name} {member.last_name}
                                </h4>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {selectedStaff && selectedServiceData && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sélectionnez une date et un créneau</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BookingCalendar
                          staffMemberId={selectedStaff.id}
                          serviceDuration={selectedServiceData.duration}
                          onSlotSelect={handleSlotSelect}
                        />
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!selectedStaff || !selectedDate || !selectedTime}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Continuer
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>3. Confirmer votre réservation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Notes (optionnel)
                      </label>
                      <Textarea
                        placeholder="Informations complémentaires..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        onClick={() => setStep(2)}
                        variant="outline"
                        className="flex-1"
                      >
                        Retour
                      </Button>
                      <Button 
                        onClick={handleBooking} 
                        disabled={!selectedDate || !selectedTime || booking}
                        className="w-full py-6 text-lg"
                      >
                        {booking ? 'Traitement...' : editingAppointmentId ? 'Mettre à jour le rendez-vous' : 'Confirmer la réservation'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Établissement</p>
                    <p className="font-semibold">{establishment?.name}</p>
                  </div>

                  {selectedServiceData && (
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-semibold">{selectedServiceData.name}</p>
                      <p className="text-sm text-gray-500">{selectedServiceData.duration} min</p>
                    </div>
                  )}

                  {selectedStaff && (
                    <div>
                      <p className="text-sm text-gray-600">Collaborateur</p>
                      <p className="font-semibold">
                        {selectedStaff.first_name} {selectedStaff.last_name}
                      </p>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div>
                      <p className="text-sm text-gray-600">Date et heure</p>
                      <p className="font-semibold">
                        {selectedDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{selectedTime}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {selectedServiceData?.price || 0}€
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
