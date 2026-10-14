'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import ProSidebar from '../../../components/layout/ProSidebar'
import {
  Calendar,
  Clock,
  Users,
  Filter,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  PhoneOff,
  Check,
  Scissors,
  User,
  DollarSign,
  Eye,
  Settings,
  Search,
  LayoutGrid,
  CalendarDays,
  Columns
} from 'lucide-react'

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
  profiles?: { full_name: string; phone: string }
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  specialties: string[]
  color?: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
  category: string
}

interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface StaffTimeOff {
  start_date: string
  end_date: string
}

interface TimeSlot {
  time: string
  staffAppointments: { [staffId: string]: Appointment | null }
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const ensureStaffAvailability = async (
  staffId: string,
  date: string,
  startTime: string,
  endTime: string
) => {
  const targetDate = new Date(`${date}T00:00:00`)
  const dayOfWeek = targetDate.getDay()

  const { data: availabilityData, error: availabilityError } = await supabase
    .from('availability_slots')
    .select('day_of_week, start_time, end_time, is_active')
    .eq('staff_member_id', staffId)
    .eq('day_of_week', dayOfWeek)

  if (availabilityError) {
    console.error('Erreur récupération disponibilités:', availabilityError)
    throw new Error("Impossible de vérifier les disponibilités du collaborateur.")
  }

  const activeSlots = (availabilityData || []).filter(
    (slot: AvailabilitySlot) => slot.is_active
  )

  if (activeSlots.length === 0) {
    throw new Error("Ce collaborateur n'est pas disponible ce jour-là.")
  }

  const { data: timeOffData, error: timeOffError } = await supabase
    .from('time_off')
    .select('start_date, end_date')
    .eq('staff_member_id', staffId)

  if (timeOffError) {
    console.error('Erreur récupération absences:', timeOffError)
    throw new Error("Impossible de vérifier les journées bloquées du collaborateur.")
  }

  const isBlocked = (timeOffData || []).some((timeOff: StaffTimeOff) => {
    return date >= timeOff.start_date && date <= timeOff.end_date
  })

  if (isBlocked) {
    throw new Error('Cette date est bloquée pour ce collaborateur.')
  }

  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  const fitsInAvailability = activeSlots.some((slot: AvailabilitySlot) => {
    const slotStart = timeToMinutes(slot.start_time.substring(0, 5))
    const slotEnd = timeToMinutes(slot.end_time.substring(0, 5))
    return startMinutes >= slotStart && endMinutes <= slotEnd
  })

  if (!fitsInAvailability) {
    throw new Error("L'horaire choisi est en dehors des disponibilités du collaborateur.")
  }
}

function ProAppointmentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewParam = searchParams?.get('view')

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterStaff, setFilterStaff] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'planning'>('calendar')
  const [mobileTab, setMobileTab] = useState<'timeline' | 'kanban'>('timeline')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const [hideEmptyHours, setHideEmptyHours] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)

  useEffect(() => {
    if (viewParam === 'planning') {
      setViewMode('planning')
      setMobileTab('timeline')
    }
  }, [viewParam])

  const [newAppointmentData, setNewAppointmentData] = useState({
    client_name: '',
    client_phone: '',
    service_id: '',
    staff_member_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '',
    client_notes: ''
  })

  const [paymentOption, setPaymentOption] = useState<'none' | 'full' | 'half' | 'custom'>('none')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [filteredServicesByCategory, setFilteredServicesByCategory] = useState<{ [category: string]: Service[] }>({})
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])

  const colors = ['bg-nude-500', 'bg-blue-500', 'bg-green-500', 'bg-warm-500', 'bg-yellow-500', 'bg-red-500']

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    if (establishmentId) {
      loadAppointments()
    }
  }, [selectedDate, filterStatus, filterStaff, establishmentId])

  useEffect(() => {
    if (appointments.length > 0 && staffMembers.length > 0) {
      generateTimeSlots(appointments, staffMembers)
    }
  }, [appointments, staffMembers])

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

      const { data: servicesData } = await supabase
        .from('services')
        .select('id, name, duration, price, category')
        .eq('establishment_id', establishment.id)
        .eq('is_active', true)
        .order('category', { ascending: true })

      setAllServices(servicesData || [])
      setFilteredServices(servicesData || [])

      const { data: staffData } = await supabase
        .from('staff_members')
        .select('id, first_name, last_name, specialties')
        .eq('establishment_id', establishment.id)
        .eq('is_active', true)

      const parsedStaff = (staffData || []).map((member, index) => ({
        ...member,
        specialties: Array.isArray(member.specialties) ? member.specialties : [],
        color: colors[index % colors.length]
      }))

      setStaffMembers(parsedStaff)
      setFilteredStaff(parsedStaff)

      await loadAppointments()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    if (!establishmentId) {
      console.log('Pas d\'establishmentId')
      return
    }

    console.log('Chargement RDV pour:', { establishmentId, selectedDate, filterStatus })

    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          services (name, duration, price),
          staff_members (first_name, last_name)
        `)
        .eq('establishment_id', establishmentId)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (selectedDate) {
        query = query.eq('appointment_date', selectedDate)
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      if (filterStaff !== 'all') {
        query = query.eq('staff_member_id', filterStaff)
      }

      const { data, error } = await query
      if (error) {
        console.error('Erreur chargement RDV:', error)
        throw error
      }
      console.log('✅ RDV chargés:', data)
      console.log('Nombre de RDV:', data?.length || 0)
      setAppointments(data || [])
    } catch (error) {
      console.error('❌ Erreur:', error)
    }
  }

  const generateTimeSlots = (appointments: Appointment[], staff: StaffMember[]) => {
    console.log('🕐 Génération des créneaux pour', appointments.length, 'RDV')
    if (appointments.length > 0) {
      console.log('Premier RDV start_time:', appointments[0].start_time, 'Type:', typeof appointments[0].start_time)
    }

    const slots: TimeSlot[] = []
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // Créneaux de 15 minutes
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const staffAppointments: { [staffId: string]: Appointment | null } = {}

        staff.forEach(member => {
          // Vérifier si le créneau est disponible pour ce collaborateur
          const isTimeSlotAvailable = isTimeSlotAvailableForStaff(
            time,
            member.id,
            appointments,
            allServices
          )

          if (!isTimeSlotAvailable) {
            // Si le créneau n'est pas disponible, trouver le RDV qui cause le conflit
            const conflictingAppointment = appointments.find(apt => {
              return apt.staff_member_id === member.id && isTimeInAppointment(time, apt, allServices)
            })
            staffAppointments[member.id] = conflictingAppointment || null
          } else {
            staffAppointments[member.id] = null
          }
        })
        slots.push({ time, staffAppointments })
      }
    }
    console.log('✅ Créneaux générés:', slots.length)
    setTimeSlots(slots)
  }

  const isTimeSlotAvailableForStaff = (
    time: string,
    staffId: string,
    appointments: Appointment[],
    services: Service[]
  ) => {
    const conflictingAppointment = appointments.find(apt => {
      return apt.staff_member_id === staffId && isTimeInAppointment(time, apt, services)
    })
    return !conflictingAppointment
  }

  const isTimeInAppointment = (time: string, appointment: Appointment, services: Service[]) => {
    const service = services.find(s => s.id === appointment.service_id)
    const duration = service?.duration || 30

    const timeMinutes = timeToMinutes(time)
    const startMinutes = timeToMinutes(appointment.start_time)
    const endMinutes = startMinutes + duration

    return timeMinutes >= startMinutes && timeMinutes < endMinutes
  }

  const getAvailableTimeSlots = () => {
    if (!newAppointmentData.staff_member_id || !newAppointmentData.appointment_date) {
      return []
    }

    const staffAppointments = appointments.filter(apt =>
      apt.staff_member_id === newAppointmentData.staff_member_id &&
      apt.appointment_date === newAppointmentData.appointment_date &&
      ['pending', 'confirmed', 'partial_paid', 'paid'].includes(apt.status)
    )

    const availableSlots: string[] = []

    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // Créneaux de 15 minutes
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

        const isAvailable = !staffAppointments.some(apt =>
          isTimeInAppointment(time, apt, allServices)
        )

        if (isAvailable) {
          availableSlots.push(time)
        }
      }
    }

    return availableSlots
  }

  const handleServiceChangeInModal = (serviceId: string) => {
    setNewAppointmentData({ ...newAppointmentData, service_id: serviceId, staff_member_id: '' })
    if (!serviceId) {
      setFilteredStaff(staffMembers)
      return
    }
    const availableStaff = staffMembers.filter(staff => staff.specialties.includes(serviceId))
    setFilteredStaff(availableStaff)
  }

  const handleStaffChangeInModal = (staffId: string) => {
    setNewAppointmentData({ ...newAppointmentData, staff_member_id: staffId })
  }

  const checkTimeConflict = async (staffId: string, date: string, startTime: string, endTime: string) => {
    try {
      // Récupérer tous les rendez-vous du collaborateur pour cette date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('staff_member_id', staffId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed', 'partial_paid', 'paid'])

      if (error) throw error

      if (!existingAppointments || existingAppointments.length === 0) {
        return false // Pas de conflit
      }

      // Convertir les heures en minutes pour faciliter la comparaison
      const newStart = timeToMinutes(startTime)
      const newEnd = timeToMinutes(endTime)

      console.log('🔍 Vérification des conflits:', {
        newStart,
        newEnd,
        existingAppointments: existingAppointments.length
      })

      // Vérifier chaque rendez-vous existant
      for (const apt of existingAppointments) {
        const existingStart = timeToMinutes(apt.start_time)
        const existingEnd = timeToMinutes(apt.end_time)

        console.log('📅 Comparaison avec RDV existant:', {
          existing: { start: existingStart, end: existingEnd },
          new: { start: newStart, end: newEnd }
        })

        // Vérifier s'il y a chevauchement
        if (
          (newStart < existingEnd && newEnd > existingStart) ||
          (newStart === existingStart) ||
          (newEnd === existingEnd)
        ) {
          console.log('❌ Conflit détecté!')
          return true // Conflit trouvé
        }
      }

      console.log('✅ Aucun conflit')
      return false // Pas de conflit
    } catch (error) {
      console.error('Erreur vérification conflit:', error)
      return false // En cas d'erreur, permettre la création (à améliorer)
    }
  }

  const openEditMode = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsEditMode(true)

    // Pré-remplir le formulaire avec les données du RDV
    setNewAppointmentData({
      client_name: appointment.guest_name || '',
      client_phone: appointment.guest_phone || '',
      service_id: appointment.service_id,
      staff_member_id: appointment.staff_member_id,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      client_notes: appointment.client_notes || ''
    })

    setShowNewAppointmentModal(true)
  }

  const resetForm = () => {
    setNewAppointmentData({
      client_name: '',
      client_phone: '',
      service_id: '',
      staff_member_id: '',
      appointment_date: selectedDate,
      start_time: '',
      client_notes: ''
    })
    setPaymentOption('none')
    setCustomAmount('')
    setIsEditMode(false)
    setEditingAppointment(null)
    setShowNewAppointmentModal(false)
  }

  const handleCreateAppointment = async () => {
    if (!establishmentId) return

    setIsProcessingPayment(true)
    try {
      // Calculer end_time
      const service = allServices.find(s => s.id === newAppointmentData.service_id)
      const startTime = newAppointmentData.start_time

      // Validation du format de l'heure
      if (!startTime || !startTime.includes(':')) {
        throw new Error('Heure invalide')
      }

      const [hours, minutes] = startTime.split(':').map(Number)

      // Vérifier que les nombres sont valides
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Format d\'heure invalide')
      }

      const endMinutes = minutes + (service?.duration || 30)
      const endHours = hours + Math.floor(endMinutes / 60)
      const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`

      console.log('🕐 Heures calculées:', { startTime, endTime, serviceDuration: service?.duration })

      await ensureStaffAvailability(
        newAppointmentData.staff_member_id,
        newAppointmentData.appointment_date,
        startTime,
        endTime
      )

      // En mode édition, vérifier les conflits en excluant le RDV actuel
      if (!isEditMode) {
        const hasConflict = await checkTimeConflict(
          newAppointmentData.staff_member_id,
          newAppointmentData.appointment_date,
          startTime,
          endTime
        )

        if (hasConflict) {
          throw new Error('Ce créneau horaire est déjà pris pour ce collaborateur. Veuillez choisir une autre heure.')
        }
      }

      if (isEditMode && editingAppointment) {
        // Mode édition : mettre à jour le RDV existant
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            guest_name: newAppointmentData.client_name,
            guest_phone: newAppointmentData.client_phone,
            service_id: newAppointmentData.service_id,
            staff_member_id: newAppointmentData.staff_member_id,
            appointment_date: newAppointmentData.appointment_date,
            start_time: newAppointmentData.start_time,
            end_time: endTime,
            client_notes: newAppointmentData.client_notes,
            total_price: service?.price || 0 // Mettre à jour le prix avec le service actuel
          })
          .eq('id', editingAppointment.id)

        if (updateError) throw updateError

        // Message de succès géré à la fin
      }

      if (!isEditMode) {
        // Mode création (code existant)
        const totalPrice = service?.price || 0
        let appointmentStatus = 'pending'

        // Créer le RDV avec les infos du client invité
        const { data: appointment, error: appointmentError } = await supabase.from('appointments').insert({
          establishment_id: establishmentId,
          client_id: null, // Client invité, pas de compte
          guest_name: newAppointmentData.client_name,
          guest_phone: newAppointmentData.client_phone,
          service_id: newAppointmentData.service_id,
          staff_member_id: newAppointmentData.staff_member_id,
          appointment_date: newAppointmentData.appointment_date,
          start_time: newAppointmentData.start_time,
          end_time: endTime,
          client_notes: newAppointmentData.client_notes,
          status: appointmentStatus,
          total_price: totalPrice // Ajouter le prix total
        }).select().single()

        if (appointmentError) throw appointmentError

        // Si paiement immédiat, créer la transaction
        if (paymentOption !== 'none' && appointment) {
          let paymentAmount = 0
          if (paymentOption === 'full') {
            paymentAmount = totalPrice
            appointmentStatus = 'paid'
          } else if (paymentOption === 'half') {
            paymentAmount = totalPrice / 2
            appointmentStatus = 'partial_paid'
          } else if (paymentOption === 'custom') {
            paymentAmount = parseFloat(customAmount) || 0
            if (paymentAmount > 0) {
              appointmentStatus = paymentAmount >= totalPrice ? 'paid' : 'partial_paid'
            }
          }

          // Validation du montant personnalisé
          if (paymentOption === 'custom' && (paymentAmount <= 0 || paymentAmount > totalPrice)) {
            throw new Error('Montant personnalisé invalide')
          }

          // Créer la transaction
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              appointment_id: appointment.id,
              establishment_id: establishmentId,
              amount: paymentAmount,
              payment_method: 'cash',
              payment_status: 'paid'
            })

          if (transactionError) throw transactionError

          // Mettre à jour le statut du RDV
          if (paymentOption !== 'none' && paymentAmount > 0) {
            await supabase
              .from('appointments')
              .update({ status: appointmentStatus })
              .eq('id', appointment.id)
          }
        }
      }

      // Réinitialiser le formulaire et recharger
      resetForm()
      await loadAppointments()

      // Message de succès
      if (isEditMode) {
        alert('Rendez-vous modifié avec succès !')
      } else if (paymentOption === 'full') {
        alert('Rendez-vous créé et paiement enregistré avec succès !')
      } else if (paymentOption === 'half') {
        alert(`Rendez-vous créé ! Acompte de ${(totalPrice / 2).toFixed(2)}DA enregistré. Reste à payer : ${(totalPrice / 2).toFixed(2)}DA`)
      } else if (paymentOption === 'custom') {
        const customPaid = parseFloat(customAmount) || 0
        const remaining = Math.max(0, totalPrice - customPaid)
        if (remaining > 0) {
          alert(`Rendez-vous créé ! Acompte de ${customPaid.toFixed(2)}DA enregistré. Reste à payer : ${remaining.toFixed(2)}DA`)
        } else {
          alert('Rendez-vous créé et paiement complet enregistré avec succès !')
        }
      } else {
        alert('Rendez-vous créé avec succès !')
      }
    } catch (error) {
      console.error('Erreur création/modification RDV:', error)
      const message =
        error instanceof Error
          ? error.message
          : error && typeof error === 'object' && 'message' in error
            ? String((error as { message?: unknown }).message)
            : null
      alert(message || 'Erreur lors de la création/modification du rendez-vous. Veuillez réessayer.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
      if (error) throw error
      loadAppointments()
    } catch (error) {
      console.error('Erreur:', error)
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Supprimer ce rendez-vous ?')) return
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id)
      if (error) throw error
      loadAppointments()
      setShowAppointmentDetails(false)
    } catch (error) {
      console.error('Erreur:', error)
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'calling': return 'bg-nude-100 text-nude-700'
      case 'call_confirmed': return 'bg-green-100 text-green-700'
      case 'call_no_response': return 'bg-orange-100 text-orange-700'
      case 'call_cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      confirmed: 'Confirmé',
      pending: 'En attente',
      cancelled: 'Annulé',
      completed: 'Terminé',
      calling: 'En appel',
      call_confirmed: 'Appel confirmé',
      call_no_response: 'Pas de réponse',
      call_cancelled: 'Appel annulé'
    }
    return labels[status as keyof typeof labels] || status
  };

  const getClientName = (appointment: Appointment) => {
    return appointment.guest_name || appointment.profiles?.full_name || 'Client'
  };

  const servicesByCategory = allServices.reduce((acc, service) => {
    const cat = service.category || 'Autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  const selectedService = allServices.find(s => s.id === newAppointmentData.service_id)

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus !== 'all' && apt.status !== filterStatus) return false
    if (filterStaff !== 'all' && apt.staff_member_id !== filterStaff) return false
    return true
  })

  const handlePrevDay = () => {
    const base = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
    base.setDate(base.getDate() - 1)
    const yyyy = base.getFullYear()
    const mm = String(base.getMonth() + 1).padStart(2, '0')
    const dd = String(base.getDate()).padStart(2, '0')
    setSelectedDate(`${yyyy}-${mm}-${dd}`)
  }

  const handleNextDay = () => {
    const base = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
    base.setDate(base.getDate() + 1)
    const yyyy = base.getFullYear()
    const mm = String(base.getMonth() + 1).padStart(2, '0')
    const dd = String(base.getDate()).padStart(2, '0')
    setSelectedDate(`${yyyy}-${mm}-${dd}`)
  }

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }

  const formatFrenchDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr + 'T00:00:00')
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const formatAptTimeRange = (apt: Appointment) => {
    const start = apt.start_time ? apt.start_time.slice(0, 5) : ''
    if (apt.end_time) {
      return `${start} - ${apt.end_time.slice(0, 5)}`
    }
    if (apt.services?.duration && start) {
      const [h, m] = start.split(':').map(Number)
      const totalMin = h * 60 + m + apt.services.duration
      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0')
      const endM = String(totalMin % 60).padStart(2, '0')
      return `${start} - ${endH}:${endM}`
    }
    return start
  }

  const getTimelineHours = () => {
    const defaultHours = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ]
    const hourSet = new Set(defaultHours)
    filteredAppointments.forEach(apt => {
      if (apt.start_time) {
        const hour = apt.start_time.split(':')[0].padStart(2, '0') + ':00'
        hourSet.add(hour)
      }
    })
    return Array.from(hourSet).sort()
  }

  const getAppointmentsForHour = (hourStr: string) => {
    const targetHour = parseInt(hourStr.split(':')[0], 10)
    return filteredAppointments.filter((apt) => {
      if (!apt.start_time) return false
      const aptHour = parseInt(apt.start_time.split(':')[0], 10)
      if (aptHour !== targetHour) return false

      if (mobileSearchQuery.trim()) {
        const q = mobileSearchQuery.toLowerCase()
        const clientName = getClientName(apt).toLowerCase()
        const serviceName = (apt.services?.name || '').toLowerCase()
        const staffName = `${apt.staff_members?.first_name || ''} ${apt.staff_members?.last_name || ''}`.toLowerCase()
        return clientName.includes(q) || serviceName.includes(q) || staffName.includes(q)
      }
      return true
    })
  }

  const kanbanColumns = [
    {
      id: 'pending',
      title: 'En attente',
      color: 'bg-amber-500',
      badgeBg: 'bg-amber-100 text-amber-800',
      items: filteredAppointments.filter(a => a.status === 'pending' || a.status === 'calling')
    },
    {
      id: 'confirmed',
      title: 'Confirmés',
      color: 'bg-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      items: filteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'call_confirmed')
    },
    {
      id: 'completed',
      title: 'Terminés',
      color: 'bg-blue-500',
      badgeBg: 'bg-blue-100 text-blue-800',
      items: filteredAppointments.filter(a => a.status === 'completed')
    },
    {
      id: 'cancelled',
      title: 'Annulés',
      color: 'bg-rose-500',
      badgeBg: 'bg-rose-100 text-rose-800',
      items: filteredAppointments.filter(a => a.status === 'cancelled' || a.status === 'call_cancelled' || a.status === 'call_no_response')
    }
  ]

  return (
    <ProSidebar>
      {/* ============================================================ */}
      {/* VUE MOBILE SMARTPHONE (EXACTEMENT COMME LA CAPTURE D'ÉCRAN) */}
      {/* ============================================================ */}
      <div className="block lg:hidden min-h-screen bg-gradient-to-b from-[#f8f7ff] via-white to-[#faf9ff] pb-24">
        {/* 1. Mobile Header: Planning + Eye + Settings */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6253ec] to-[#4c3ec8] text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <CalendarDays className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 ml-3 tracking-tight">Planning</h1>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setHideEmptyHours(!hideEmptyHours)}
              title={hideEmptyHours ? 'Afficher tous les créneaux' : 'Masquer les créneaux vides'}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                hideEmptyHours ? 'bg-[#5b50e6] text-white shadow-sm' : 'bg-[#efeefd] text-[#5b50e6] hover:bg-purple-100'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <Link
              href="/professional/settings"
              title="Paramètres"
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 2. Date Navigation Row */}
        <div className="px-4 py-1.5 flex items-center">
          <button
            onClick={handlePrevDay}
            title="Jour précédent"
            className="w-8 h-8 rounded-full bg-gray-100/90 text-gray-600 flex items-center justify-center active:scale-90 transition-transform shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex-1 mx-2 bg-[#f4f2fe] border border-[#e2dffc] rounded-full py-2 px-3 flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-[#5b50e6] shrink-0" />
            <span className="text-[12px] font-semibold text-[#3b32a4] truncate capitalize">
              {formatFrenchDate(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            />
          </div>

          <button
            onClick={handleNextDay}
            title="Jour suivant"
            className="w-8 h-8 rounded-full bg-gray-100/90 text-gray-600 flex items-center justify-center active:scale-90 transition-transform shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            title="Aujourd'hui"
            className="relative ml-2 bg-[#5b50e6] hover:bg-[#4d42d8] active:scale-95 text-white font-medium text-xs px-3.5 py-2 rounded-2xl shadow-sm shrink-0 transition-all flex items-center"
          >
            Aujourd&apos;hui
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>

        {/* 3. Switcher Tabs: Timeline vs Kanban */}
        <div className="px-4 py-2">
          <div className="bg-[#f0f0f4] p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setMobileTab('timeline')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                mobileTab === 'timeline'
                  ? 'bg-[#5b50e6] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setMobileTab('kanban')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                mobileTab === 'kanban'
                  ? 'bg-[#5b50e6] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* 4. Staff Filter + Search Row */}
        <div className="px-4 py-2">
          <div className="flex items-center">
            <div className="relative flex-1 bg-white border border-gray-200/90 rounded-2xl px-3.5 py-2.5 flex items-center justify-between shadow-xs">
              <span className="absolute -top-2 left-3 px-1.5 bg-white text-[10px] text-gray-400 font-medium tracking-tight">
                Employé
              </span>
              <div className="flex items-center space-x-2 min-w-0">
                <Users className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {filterStaff === 'all'
                    ? 'Tous les employés'
                    : (() => {
                        const s = staffMembers.find((m) => m.id === filterStaff)
                        return s ? `${s.first_name} ${s.last_name || ''}` : 'Tous les employés'
                      })()}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              >
                <option value="all">Tous les employés</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              title="Rechercher un rendez-vous"
              className={`w-11 h-11 rounded-full border border-gray-200/90 bg-white flex items-center justify-center shadow-xs shrink-0 ml-2 transition-colors ${
                mobileSearchOpen || mobileSearchQuery ? 'text-[#5b50e6] border-[#5b50e6]' : 'text-gray-500'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search bar if opened */}
          {mobileSearchOpen && (
            <div className="mt-2 relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="Rechercher par client, service, employé..."
                className="w-full text-xs pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b50e6]"
              />
              {mobileSearchQuery && (
                <button
                  onClick={() => setMobileSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5. Main Content: Timeline vs Kanban */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-3 border-[#5b50e6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Chargement du planning...</p>
          </div>
        ) : mobileTab === 'timeline' ? (
          /* ================= VERTICAL TIMELINE STREAM ================= */
          <div className="px-4 pt-3 pb-8 space-y-5">
            {getTimelineHours().map((hourStr) => {
              const hourApts = getAppointmentsForHour(hourStr)
              if (hideEmptyHours && hourApts.length === 0) return null

              return (
                <div key={hourStr} className="space-y-1.5">
                  {/* Hour Label + Count Badge */}
                  <div className="flex items-center space-x-2 pl-1">
                    <span className="text-xs font-bold text-gray-800 tracking-tight">{hourStr}</span>
                    {hourApts.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#5b50e6] text-white text-[10px] font-bold flex items-center justify-center">
                        {hourApts.length}
                      </span>
                    )}
                  </div>

                  {/* Vertical Line + Content */}
                  <div className="relative pl-6">
                    {/* Vertical tracking line */}
                    <div className="absolute left-2.5 top-0 bottom-0 w-[1.5px] bg-gray-200/90 -translate-x-1/2" />

                    {/* Node Dot on the line */}
                    {hourApts.length > 0 ? (
                      <div className="absolute left-2.5 top-3 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#5b50e6] ring-4 ring-indigo-100 z-10" />
                    ) : (
                      <div className="absolute left-2.5 top-2.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-gray-200 ring-2 ring-white z-10" />
                    )}

                    {/* Hour Content */}
                    <div className="ml-1">
                      {hourApts.length === 0 ? (
                        <p className="py-1 text-xs italic text-gray-400 font-normal">
                          Aucun rendez-vous
                        </p>
                      ) : (
                        <div className="space-y-3 pb-2">
                          {hourApts.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => {
                                setSelectedAppointment(apt)
                                setShowAppointmentDetails(true)
                              }}
                              className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/90 active:scale-[0.99] transition-all cursor-pointer relative"
                            >
                              {/* Top row: Time range badge + status dot */}
                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    apt.status === 'confirmed' ||
                                    apt.status === 'call_confirmed' ||
                                    apt.status === 'completed'
                                      ? 'bg-[#e6f8ee] text-[#1e824c]'
                                      : apt.status === 'pending' || apt.status === 'calling'
                                      ? 'bg-[#ffebe8] text-[#d94f38]'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {formatAptTimeRange(apt)}
                                </span>
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    apt.status === 'confirmed' ||
                                    apt.status === 'call_confirmed' ||
                                    apt.status === 'completed'
                                      ? 'bg-emerald-500'
                                      : apt.status === 'pending' || apt.status === 'calling'
                                      ? 'bg-rose-500'
                                      : 'bg-gray-400'
                                  }`}
                                />
                              </div>

                              {/* Service Name */}
                              <h4 className="font-bold text-gray-900 text-base mt-2.5 tracking-tight">
                                {apt.services?.name || 'Prestation'}
                              </h4>

                              {/* Staff Name */}
                              <p className="text-xs text-gray-500 mt-0.5">
                                {apt.staff_members
                                  ? `${apt.staff_members.first_name} ${apt.staff_members.last_name || ''}`
                                  : 'Non assigné'}
                              </p>

                              {/* Bottom row: Client + Duration */}
                              <div className="flex items-center justify-between text-xs text-gray-600 mt-3 pt-2.5 border-t border-gray-50">
                                <div className="flex items-center space-x-1.5">
                                  <User
                                    className={`w-3.5 h-3.5 ${
                                      apt.status === 'confirmed' || apt.status === 'call_confirmed'
                                        ? 'text-emerald-600'
                                        : 'text-[#8b5cf6]'
                                    }`}
                                  />
                                  <span
                                    className={`font-semibold ${
                                      apt.status === 'confirmed' || apt.status === 'call_confirmed'
                                        ? 'text-emerald-700'
                                        : 'text-[#8b5cf6]'
                                    }`}
                                  >
                                    {getClientName(apt)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-gray-400 font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{apt.services?.duration || 60}min</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ================= KANBAN VIEW (MOBILE) ================= */
          <div className="px-4 pt-3 pb-8">
            <div className="space-y-4">
              {kanbanColumns.map((col) => (
                <div key={col.id} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <span className="font-bold text-xs text-gray-800">{col.title}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                      {col.items.length}
                    </span>
                  </div>

                  {col.items.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2 text-center">Aucun rendez-vous</p>
                  ) : (
                    <div className="space-y-2.5">
                      {col.items.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => {
                            setSelectedAppointment(apt)
                            setShowAppointmentDetails(true)
                          }}
                          className="p-3 bg-gray-50/70 hover:bg-gray-50 border border-gray-100 rounded-xl cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-[#5b50e6]">{formatAptTimeRange(apt)}</span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {apt.staff_members?.first_name || ''}
                            </span>
                          </div>
                          <div className="font-semibold text-gray-900 text-xs mb-1">
                            {apt.services?.name}
                          </div>
                          <div className="text-[11px] text-gray-600 flex items-center justify-between">
                            <span>{getClientName(apt)}</span>
                            <span>{apt.services?.price ? `${apt.services.price} DA` : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Floating Action Button (FAB) Mobile */}
        <div className="fixed bottom-20 right-4 z-30 lg:hidden">
          <button
            onClick={() => {
              setShowNewAppointmentModal(true)
              setNewAppointmentData({
                client_name: '',
                client_phone: '',
                service_id: '',
                staff_member_id: '',
                appointment_date: selectedDate || new Date().toISOString().split('T')[0],
                start_time: '',
                client_notes: ''
              })
              setFilteredServices(allServices)
              setFilteredStaff(staffMembers)
            }}
            className="relative bg-[#5b50e6] hover:bg-[#4d42d8] active:scale-95 text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="font-semibold text-[13px]">Nouveau RDV</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute -bottom-0.5 left-1/2 -translate-x-1/2" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* VUE DESKTOP (ORDINATEUR) */}
      {/* ============================================================ */}
      <div className="hidden lg:block p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Rendez-vous</h1>
            <p className="text-gray-600">Gérez votre planning</p>
          </div>
          <Button onClick={() => {
            setShowNewAppointmentModal(true)
            setNewAppointmentData({ client_name: '', client_phone: '', service_id: '', staff_member_id: '', appointment_date: selectedDate, start_time: '', client_notes: '' })
            setFilteredServices(allServices)
            setFilteredStaff(staffMembers)
          }} className="bg-gradient-to-r from-nude-600 to-warm-600">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rendez-vous
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Button variant={viewMode === 'calendar' ? 'default' : 'outline'} onClick={() => setViewMode('calendar')} size="sm">
              <Calendar className="w-4 h-4 mr-2" />Calendrier
            </Button>
            <Button variant={viewMode === 'planning' ? 'default' : 'outline'} onClick={() => setViewMode('planning')} size="sm">
              <Clock className="w-4 h-4 mr-2" />Planning
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1 border rounded-md text-sm">
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmés</option>
              <option value="completed">Terminés</option>
              <option value="cancelled">Annulés</option>
              <option value="calling">En appel</option>
              <option value="call_confirmed">Appel confirmé</option>
              <option value="call_no_response">Pas de réponse</option>
              <option value="call_cancelled">Appel annulé</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)} className="px-3 py-1 border rounded-md text-sm">
              <option value="all">Tous les collaborateurs</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name}
                </option>
              ))}
            </select>
          </div>

          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-1 border rounded-md text-sm" />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        ) : (
          <>
            {viewMode === 'calendar' && (
              <Card>
                <CardHeader>
                  <CardTitle>Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR')}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{filteredAppointments.length} rendez-vous</p>
                </CardHeader>
                <CardContent>
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun rendez-vous pour cette date</p>
                      <p className="text-sm text-gray-500 mt-2">Date sélectionnée : {selectedDate}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map((apt) => (
                        <div key={apt.id} className="p-4 border rounded-lg hover:border-nude-300 cursor-pointer" onClick={() => { setSelectedAppointment(apt); setShowAppointmentDetails(true) }}>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                            <span className="text-sm text-gray-500"><Clock className="w-4 h-4 inline mr-1" />{apt.start_time}</span>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div><p className="text-xs text-gray-500">Client</p><p className="font-semibold">{getClientName(apt)}</p></div>
                            <div><p className="text-xs text-gray-500">Service</p><p className="font-semibold">{apt.services?.name}</p></div>
                            <div><p className="text-xs text-gray-500">Collaborateur</p><p className="font-semibold">{apt.staff_members?.first_name} {apt.staff_members?.last_name}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {viewMode === 'planning' && (
              <Card>
                <CardHeader><CardTitle>Planning du {new Date(selectedDate).toLocaleDateString('fr-FR')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-gray-50">Heure</th>
                          {(filterStaff === 'all' ? staffMembers : staffMembers.filter(s => s.id === filterStaff)).map((staff) => (
                            <th key={staff.id} className="border p-2 bg-gray-50 min-w-[200px]">
                              <div className={`inline-block px-3 py-1 rounded-full text-white text-sm ${staff.color}`}>
                                {staff.first_name} {staff.last_name}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((slot) => (
                          <tr key={slot.time}>
                            <td className="border p-2 text-sm font-medium">{slot.time}</td>
                            {(filterStaff === 'all' ? staffMembers : staffMembers.filter(s => s.id === filterStaff)).map((staff) => {
                              const apt = slot.staffAppointments[staff.id]
                              return (
                                <td key={staff.id} className="border p-1">
                                  {apt ? (
                                    <div className={`p-2 rounded text-white text-xs cursor-pointer ${staff.color}`} onClick={() => { setSelectedAppointment(apt); setShowAppointmentDetails(true) }}>
                                      <div className="font-semibold">{getClientName(apt)}</div>
                                      <div className="opacity-90">{apt.services?.name}</div>
                                    </div>
                                  ) : <div className="h-12"></div>}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

        {showAppointmentDetails && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Détails</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAppointmentDetails(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>{getStatusLabel(selectedAppointment.status)}</span>
                <div><p className="text-sm text-gray-500">Client</p><p className="font-semibold text-lg">{getClientName(selectedAppointment)}</p>{selectedAppointment.guest_phone && <p className="text-sm text-gray-600">{selectedAppointment.guest_phone}</p>}</div>
                <div><p className="text-sm text-gray-500">Service</p><p className="font-semibold">{selectedAppointment.services?.name}</p></div>
                <div><p className="text-sm text-gray-500">Collaborateur</p><p className="font-semibold">{selectedAppointment.staff_members?.first_name} {selectedAppointment.staff_members?.last_name}</p></div>
                <div><p className="text-sm text-gray-500">Date</p><p className="font-semibold">{new Date(selectedAppointment.appointment_date).toLocaleDateString('fr-FR')} à {selectedAppointment.start_time}</p></div>
                <div className="flex space-x-2 pt-4">
                  {/* Boutons d'appel */}
                  {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                    <Button
                      onClick={() => {
                        // Lancer un appel téléphonique
                        if (selectedAppointment.guest_phone) {
                          window.open(`tel:${selectedAppointment.guest_phone}`, '_self');
                          updateAppointmentStatus(selectedAppointment.id, 'calling');
                        } else {
                          alert('Numéro de téléphone non disponible');
                        }
                      }}
                      className="flex-1 bg-nude-600"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Appeler
                    </Button>
                  )}

                  {/* Boutons de statut d'appel */}
                  {selectedAppointment.status === 'calling' && (
                    <>
                      <Button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'call_confirmed')} className="flex-1 bg-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Confirmé
                      </Button>
                      <Button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'call_no_response')} variant="outline" className="text-orange-600">
                        <PhoneOff className="w-4 h-4 mr-2" />
                        Pas de réponse
                      </Button>
                      <Button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'call_cancelled')} variant="outline" className="text-red-600">
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                    </>
                  )}

                  {/* Boutons standards */}
                  {selectedAppointment.status === 'pending' && <Button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'confirmed')} className="flex-1 bg-green-600">Confirmer</Button>}
                  {selectedAppointment.status === 'confirmed' && <Button onClick={() => router.push(`/professional/cash-register?appointment=${selectedAppointment.id}`)} className="flex-1 bg-blue-600">Terminer & Payer</Button>}
                  {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'call_confirmed') && (
                    <Button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'cancelled')} variant="outline" className="text-orange-600">Annuler</Button>
                  )}
                  {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'call_confirmed') && (
                    <Button onClick={() => openEditMode(selectedAppointment)} variant="outline" className="text-blue-600">Modifier</Button>
                  )}
                  {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed' || selectedAppointment.status === 'call_confirmed') && (
                    <Button onClick={() => updateAppointmentStatus(selectedAppointment.id, 'no_show')} variant="outline" className="text-gray-600">Absent</Button>
                  )}
                  <Button onClick={() => deleteAppointment(selectedAppointment.id)} variant="outline" className="text-red-600">Supprimer</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNewAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">{isEditMode ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</h2>
                <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-5 h-5" /></Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-2">Nom *</label><input type="text" value={newAppointmentData.client_name} onChange={(e) => setNewAppointmentData({ ...newAppointmentData, client_name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Marie Dupont" /></div>
                  <div><label className="block text-sm font-medium mb-2">Téléphone *</label><input type="tel" value={newAppointmentData.client_phone} onChange={(e) => setNewAppointmentData({ ...newAppointmentData, client_phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="06 12 34 56 78" /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Service *</label>
                  {Object.keys(servicesByCategory).length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">Aucun service disponible</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {Object.entries(servicesByCategory).map(([category, services]) => (
                        <div key={category}>
                          <h3 className="font-semibold mb-2 text-nude-700">{category}</h3>
                          <div className="grid md:grid-cols-2 gap-2">
                            {services.map((service) => (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => handleServiceChangeInModal(service.id)}
                                className={`p-3 border-2 rounded-lg text-left ${newAppointmentData.service_id === service.id ? 'border-nude-600 bg-nude-50' : 'border-gray-200'}`}
                              >
                                <div className="font-medium text-sm">{service.name}</div>
                                <div className="text-xs text-gray-500">{service.duration} min • {service.price}DA</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Collaborateur *</label>
                  {newAppointmentData.service_id ? (
                    filteredStaff.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">Aucun collaborateur disponible pour ce service</p>
                      </div>
                    ) : (
                      <select
                        value={newAppointmentData.staff_member_id}
                        onChange={(e) => handleStaffChangeInModal(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Sélectionner un collaborateur</option>
                        {filteredStaff.map((staff) => <option key={staff.id} value={staff.id}>{staff.first_name} {staff.last_name}</option>)}
                      </select>
                    )
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">Veuillez sélectionner un service pour voir les collaborateurs disponibles</p>
                    </div>
                  )}
                  {newAppointmentData.service_id && filteredStaff.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {filteredStaff.length} collaborateur(s) disponible(s) pour ce service
                    </p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      value={newAppointmentData.appointment_date}
                      onChange={(e) => setNewAppointmentData({ ...newAppointmentData, appointment_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Heure *</label>
                    <input
                      type="time"
                      value={newAppointmentData.start_time}
                      onChange={(e) => setNewAppointmentData({ ...newAppointmentData, start_time: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      step="900" // Permet les quarts d'heure (15 minutes)
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Choisissez n'importe quelle heure (ex: 10h15, 10h45)
                    </p>
                  </div>
                </div>
                {selectedService && (
                  <div className="p-4 bg-nude-50 border border-nude-200 rounded-lg">
                    <p className="text-sm font-medium mb-2">Détails</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-600">Durée:</span> <span className="font-semibold">{selectedService.duration} min</span></div>
                      <div><span className="text-gray-600">Prix:</span> <span className="font-semibold">{selectedService.price}DA</span></div>
                    </div>
                  </div>
                )}
                <div><label className="block text-sm font-medium mb-2">Notes</label><textarea value={newAppointmentData.client_notes} onChange={(e) => setNewAppointmentData({ ...newAppointmentData, client_notes: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows={3} /></div>

                {/* Section Paiement */}
                {selectedService && (
                  <div className="border-t pt-6">
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold">Paiement</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Prix total: <span className="font-bold text-lg">{selectedService.price}DA</span></p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Option de paiement</label>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <button
                            type="button"
                            onClick={() => setPaymentOption('none')}
                            className={`p-3 border-2 rounded-lg text-center ${paymentOption === 'none' ? 'border-nude-600 bg-nude-50' : 'border-gray-200'}`}
                          >
                            <div className="font-medium text-sm">Aucun</div>
                            <div className="text-xs text-gray-500">Payer plus tard</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentOption('custom')}
                            className={`p-3 border-2 rounded-lg text-center ${paymentOption === 'custom' ? 'border-nude-600 bg-nude-50' : 'border-gray-200'}`}
                          >
                            <div className="font-medium text-sm">Personnalisé</div>
                            <div className="text-xs text-gray-500">Saisir le montant</div>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentOption('half')}
                            className={`p-3 border-2 rounded-lg text-center ${paymentOption === 'half' ? 'border-nude-600 bg-nude-50' : 'border-gray-200'}`}
                          >
                            <div className="font-medium text-sm">Acompte 50%</div>
                            <div className="text-xs text-gray-500">{(selectedService.price / 2).toFixed(2)}DA</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentOption('full')}
                            className={`p-3 border-2 rounded-lg text-center ${paymentOption === 'full' ? 'border-nude-600 bg-nude-50' : 'border-gray-200'}`}
                          >
                            <div className="font-medium text-sm">Payer tout</div>
                            <div className="text-xs text-gray-500">{selectedService.price}DA</div>
                          </button>
                        </div>
                      </div>
                      {paymentOption === 'custom' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Montant à payer maintenant</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">DA</span>
                            <input
                              type="number"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nude-500"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              max={selectedService.price}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum : {selectedService.price}DA
                          </p>
                        </div>
                      )}
                      {paymentOption !== 'none' && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            {paymentOption === 'half'
                              ? `Acompte de ${(selectedService.price / 2).toFixed(2)}DA sera enregistré. Reste à payer : ${(selectedService.price / 2).toFixed(2)}DA à la fin du rendez-vous.`
                              : paymentOption === 'full'
                                ? `Paiement complet de ${selectedService.price}DA sera enregistré.`
                                : paymentOption === 'custom' && customAmount
                                  ? (() => {
                                    const paid = parseFloat(customAmount) || 0
                                    const remaining = Math.max(0, selectedService.price - paid)
                                    return paid >= selectedService.price
                                      ? `Paiement complet de ${paid.toFixed(2)}DA sera enregistré.`
                                      : `Acompte de ${paid.toFixed(2)}DA sera enregistré. Reste à payer : ${remaining.toFixed(2)}DA à la fin du rendez-vous.`
                                  })()
                                  : 'Veuillez saisir un montant'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    onClick={handleCreateAppointment}
                    className="bg-gradient-to-r from-nude-600 to-warm-600 flex-1"
                    disabled={!newAppointmentData.service_id || !newAppointmentData.staff_member_id || isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : null}
                    {paymentOption === 'full' ? 'Créer et Payer' : paymentOption === 'half' ? 'Créer et Acompte' : paymentOption === 'custom' ? 'Créer et Acompte' : 'Créer'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>Annuler</Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </ProSidebar>
  )
}

export default function ProAppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-[#5b50e6] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProAppointmentsContent />
    </Suspense>
  )
}
