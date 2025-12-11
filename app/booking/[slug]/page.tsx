'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { BookingCalendar } from '@/components/booking/calendar'
import BookingConfirmationStep from '@/components/booking/BookingConfirmationStep'
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
  const [showAuthStep, setShowAuthStep] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  
  // État pour les prestations multiples
  const [selectedPrestations, setSelectedPrestations] = useState<Array<{
    service: Service
    staff: StaffMember
  }>>([])

  useEffect(() => {
    fetchData()
    
    // Vérifier si on est en mode édition (appointmentId dans l'URL)
    const appointmentId = searchParams.get('appointmentId')
    if (appointmentId) {
      fetchAppointment(appointmentId)
    }
  }, [params.slug, searchParams])

  // Restaurer les données de réservation depuis localStorage après connexion et créer le RDV automatiquement
  useEffect(() => {
    const restoreAndCreateBooking = async () => {
      const pendingBookingStr = localStorage.getItem('pendingBooking')
      if (pendingBookingStr) {
        try {
          const pendingBooking = JSON.parse(pendingBookingStr)
          
          // Vérifier que c'est bien pour cet établissement
          if (pendingBooking.slug === params.slug) {
            console.log('Restauration de la réservation en attente:', pendingBooking)
            
            // Vérifier si l'utilisateur est maintenant connecté
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
              // L'utilisateur est connecté, créer le rendez-vous automatiquement
              console.log('Utilisateur connecté, création automatique du RDV...')
              
              // Supprimer les données du localStorage immédiatement pour éviter les doublons
              localStorage.removeItem('pendingBooking')
              
              // Trouver le service pour obtenir la durée
              const serviceData = services.find(s => s.id === pendingBooking.serviceId)
              if (!serviceData) {
                console.error('Service non trouvé')
                return
              }
              
              // Préparer les données du rendez-vous
              const bookingDate = new Date(pendingBooking.date)
              const localDate = new Date(bookingDate.getTime() - bookingDate.getTimezoneOffset() * 60000)
              const appointmentDate = localDate.toISOString().split('T')[0]

              const [startHour, startMinute] = pendingBooking.time.split(':').map(Number)
              const duration = serviceData.duration || 0
              const endTotalMinutes = startHour * 60 + startMinute + duration
              const endHour = Math.floor(endTotalMinutes / 60) % 24
              const endMinute = endTotalMinutes % 60
              const formattedStartTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`
              const formattedEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`

              const appointmentData = {
                establishment_id: pendingBooking.establishmentId,
                client_id: session.user.id,
                staff_member_id: pendingBooking.staffId,
                service_id: pendingBooking.serviceId,
                appointment_date: appointmentDate,
                start_time: formattedStartTime,
                end_time: formattedEndTime,
                client_notes: pendingBooking.notes || '',
                total_price: serviceData.price || 0,
                status: 'pending'
              }

              // Créer le rendez-vous
              const { data: result, error } = await supabase
                .from('appointments')
                .insert(appointmentData)
                .select()
                .single()

              if (error) {
                console.error('Erreur création RDV:', error)
                alert('Erreur lors de la création du rendez-vous: ' + error.message)
                return
              }

              console.log('RDV créé avec succès:', result)
              
              // Rediriger vers la page de confirmation
              router.push(`/booking/confirmation/${result.id}`)
            } else {
              // L'utilisateur n'est pas connecté, juste restaurer les données
              if (pendingBooking.serviceId) setSelectedService(pendingBooking.serviceId)
              if (pendingBooking.date) setSelectedDate(new Date(pendingBooking.date))
              if (pendingBooking.time) setSelectedTime(pendingBooking.time)
              if (pendingBooking.notes) setNotes(pendingBooking.notes)
              
              if (pendingBooking.staffId && staff.length > 0) {
                const staffMember = staff.find(s => s.id === pendingBooking.staffId)
                if (staffMember) {
                  setSelectedStaff(staffMember)
                  setStep(2)
                }
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors de la restauration de la réservation:', error)
          localStorage.removeItem('pendingBooking')
        }
      }
    }

    // Attendre que les données soient chargées
    if (!loading && staff.length > 0 && services.length > 0) {
      restoreAndCreateBooking()
    }
  }, [loading, staff, services, params.slug, router])

  const fetchData = async () => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

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

    // Ajouter la prestation actuelle à la liste
    const serviceData = services.find(s => s.id === selectedService)
    if (serviceData && selectedStaff) {
      const newPrestation = { service: serviceData, staff: selectedStaff }
      // Toujours ajouter à la liste existante
      setSelectedPrestations(prev => [...prev, newPrestation])
    }

    // Vérifier l'authentification
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Afficher l'étape d'authentification intégrée
      setShowAuthStep(true)
      return
    }

    setBooking(true)

    try {
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
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const selectedServiceData = services.find(s => s.id === selectedService)
  const galleryImages = Array.isArray(establishment?.gallery) ? establishment?.gallery : []
  const heroImage = establishment?.cover_image_url || galleryImages[0] || establishment?.logo_url

  // Utiliser directement les prestations sélectionnées
  const currentPrestations = selectedPrestations

  // Si on affiche l'étape d'authentification
  if (showAuthStep && currentPrestations.length > 0 && selectedDate && selectedTime) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <button 
              onClick={() => setShowAuthStep(false)} 
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à la sélection
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <BookingConfirmationStep
            establishment={{
              id: establishment.id,
              name: establishment.name,
              address: establishment.address,
              city: establishment.city,
              average_rating: establishment.average_rating,
              total_reviews: establishment.total_reviews
            }}
            prestations={currentPrestations}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            notes={notes}
            onBack={() => setShowAuthStep(false)}
            onAddService={() => {
              // Sauvegarder toutes les prestations actuelles dans l'état
              setSelectedPrestations([...currentPrestations])
              // Revenir à l'étape de sélection de service (sans toucher à la date)
              setShowAuthStep(false)
              setStep(1)
              // Réinitialiser seulement le créneau (la durée totale va changer)
              setSelectedTime(null)
              // Réinitialiser les sélections de service/staff pour la nouvelle prestation
              setSelectedService(null)
              setSelectedStaff(null)
            }}
            onRemovePrestation={(index) => {
              const newPrestations = [...currentPrestations]
              newPrestations.splice(index, 1)
              setSelectedPrestations(newPrestations)
              if (newPrestations.length === 0) {
                setShowAuthStep(false)
                setStep(1)
              }
            }}
            onSuccess={(appointmentId) => {
              router.push(`/booking/confirmation/${appointmentId}`)
            }}
          />
        </main>
      </div>
    )
  }

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
                      ? 'bg-gradient-to-r from-nude-600 to-warm-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > s ? 'bg-gradient-to-r from-nude-600 to-warm-600' : 'bg-gray-200'
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
                <>
                  {/* Afficher les prestations déjà sélectionnées */}
                  {selectedPrestations.length > 0 && (
                    <Card className="bg-nude-50 border-nude-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Prestations déjà sélectionnées</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedPrestations.map((prestation, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{prestation.service.name} avec {prestation.staff.first_name}</span>
                            <span className="text-gray-600">{prestation.service.duration} min • {prestation.service.price} DA</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-nude-200 flex justify-between font-medium">
                          <span>Sous-total</span>
                          <span>
                            {selectedPrestations.reduce((sum, p) => sum + p.service.duration, 0)} min • {selectedPrestations.reduce((sum, p) => sum + p.service.price, 0)} DA
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {selectedPrestations.length > 0 ? 'Ajouter une prestation' : '1. Choisissez un service'}
                      </CardTitle>
                    </CardHeader>
                  <CardContent className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedService === service.id
                            ? 'border-nude-600 bg-nude-50'
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
                          <span className="text-lg font-bold text-nude-600">
                            {service.price}DA
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedService}
                      className="w-full bg-gradient-to-r from-nude-600 to-warm-600"
                    >
                      Continuer
                    </Button>
                  </CardContent>
                </Card>
                </>
              )}

              {/* Step 2: Staff & Date Selection */}
              {step === 2 && (
                <>
                  {/* Afficher les prestations déjà sélectionnées */}
                  {selectedPrestations.length > 0 && (
                    <Card className="mb-4 bg-nude-50 border-nude-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Prestations déjà sélectionnées</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedPrestations.map((prestation, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{prestation.service.name} avec {prestation.staff.first_name}</span>
                            <span className="text-gray-600">{prestation.service.duration} min • {prestation.service.price} DA</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-nude-200 flex justify-between font-medium">
                          <span>Sous-total</span>
                          <span>
                            {selectedPrestations.reduce((sum, p) => sum + p.service.duration, 0)} min • {selectedPrestations.reduce((sum, p) => sum + p.service.price, 0)} DA
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Prestation en cours de sélection */}
                  {selectedServiceData && (
                    <Card className="mb-4 border-green-200 bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-green-700">
                          {selectedPrestations.length > 0 ? 'Nouvelle prestation à ajouter' : 'Prestation sélectionnée'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{selectedServiceData.name}</span>
                          <span className="text-gray-600">{selectedServiceData.duration} min • {selectedServiceData.price} DA</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
                                ? 'border-nude-600 bg-nude-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-nude-600 to-warm-600 rounded-full flex items-center justify-center text-white font-bold">
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
                          serviceDuration={
                            // Durée totale = prestations existantes + prestation actuelle
                            selectedPrestations.reduce((sum, p) => sum + p.service.duration, 0) + selectedServiceData.duration
                          }
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
                      className="flex-1 bg-gradient-to-r from-nude-600 to-warm-600"
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
                      <span className="text-2xl font-bold text-nude-600">
                        {selectedServiceData?.price || 0}DA
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
