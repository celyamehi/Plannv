'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MapPin, Star, Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  category?: string
  description?: string
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
}

interface SelectedPrestation {
  service: Service
  staff: StaffMember
}

interface MultiServiceBookingProps {
  establishment: {
    id: string
    name: string
    address: string
    city: string
    average_rating?: number
    total_reviews?: number
  }
  services: Service[]
  staff: StaffMember[]
  onConfirm: (prestations: SelectedPrestation[], date: Date, time: string) => void
}

export default function MultiServiceBooking({
  establishment,
  services,
  staff,
  onConfirm
}: MultiServiceBookingProps) {
  const [selectedPrestations, setSelectedPrestations] = useState<SelectedPrestation[]>([])
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [availableSlots, setAvailableSlots] = useState<{ [key: string]: string[] }>({})

  // Grouper les services par catégorie
  const servicesByCategory = useMemo(() => {
    const grouped: { [key: string]: Service[] } = {}
    services.forEach(service => {
      const category = service.category || 'Autres'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(service)
    })
    return grouped
  }, [services])

  // Calculer la durée totale
  const totalDuration = useMemo(() => {
    return selectedPrestations.reduce((sum, p) => sum + p.service.duration, 0)
  }, [selectedPrestations])

  // Calculer le prix total
  const totalPrice = useMemo(() => {
    return selectedPrestations.reduce((sum, p) => sum + p.service.price, 0)
  }, [selectedPrestations])

  // Générer les jours de la semaine
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 6; i++) {
      days.push(addDays(weekStart, i))
    }
    return days
  }, [weekStart])

  // Générer les créneaux horaires (simulé pour l'instant)
  useEffect(() => {
    if (selectedPrestations.length === 0) return

    const slots: { [key: string]: string[] } = {}
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      const dayOfWeek = day.getDay()
      
      // Simuler des créneaux disponibles (à remplacer par les vraies données)
      if (dayOfWeek !== 0) { // Pas le dimanche
        const daySlots: string[] = []
        const startHour = dayOfWeek === 6 ? 9 : 10 // Samedi commence plus tôt
        const endHour = dayOfWeek === 6 ? 18 : 20
        
        for (let hour = startHour; hour < endHour; hour++) {
          daySlots.push(`${hour.toString().padStart(2, '0')}:00`)
          if (hour < endHour - 1 || dayOfWeek === 6) {
            daySlots.push(`${hour.toString().padStart(2, '0')}:30`)
          }
        }
        slots[dateKey] = daySlots
      }
    })
    setAvailableSlots(slots)
  }, [weekDays, selectedPrestations])

  const addPrestation = (service: Service) => {
    // Utiliser le premier staff disponible par défaut
    const defaultStaff = staff[0]
    if (defaultStaff) {
      setSelectedPrestations([...selectedPrestations, { service, staff: defaultStaff }])
    }
    setShowServiceSelector(false)
  }

  const removePrestation = (index: number) => {
    setSelectedPrestations(selectedPrestations.filter((_, i) => i !== index))
  }

  const handleTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const handleConfirm = () => {
    if (selectedDate && selectedTime && selectedPrestations.length > 0) {
      onConfirm(selectedPrestations, selectedDate, selectedTime)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête établissement */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{establishment.name}</h2>
        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
          <MapPin className="w-4 h-4" />
          <span>{establishment.address}, {establishment.city}</span>
          {establishment.average_rating && (
            <>
              <span className="mx-2">•</span>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{establishment.average_rating.toFixed(1)} ({establishment.total_reviews} avis)</span>
            </>
          )}
        </div>
      </div>

      {/* 1. Prestations sélectionnées */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          1. {selectedPrestations.length > 1 ? 'Prestations sélectionnées' : 'Prestation sélectionnée'}
        </h3>

        {selectedPrestations.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            Aucune prestation sélectionnée. Cliquez sur le bouton ci-dessous pour ajouter une prestation.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedPrestations.map((prestation, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start"
              >
                <div>
                  <p className="font-medium">{prestation.service.name}</p>
                  <p className="text-sm text-gray-500">
                    {prestation.service.duration}min • {prestation.service.price} DA • avec {prestation.staff.first_name}
                  </p>
                </div>
                <button
                  onClick={() => removePrestation(index)}
                  className="text-nude-600 hover:text-nude-700 text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bouton ajouter une prestation */}
        <button
          onClick={() => setShowServiceSelector(true)}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une prestation à la suite</span>
        </button>
      </div>

      {/* Modal de sélection de service */}
      {showServiceSelector && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Choix de la prestation à ajouter</h4>
            <button
              onClick={() => setShowServiceSelector(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <div key={category}>
                <h5 className="text-sm font-semibold text-orange-600 mb-3 uppercase">
                  {category}
                </h5>
                {categoryServices[0]?.description && (
                  <p className="text-xs text-gray-500 mb-3">{categoryServices[0].description}</p>
                )}
                <div className="space-y-2">
                  {categoryServices.map(service => (
                    <div 
                      key={service.id}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="text-sm">{service.name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{service.duration}min</span>
                        <span className="text-sm font-medium">{service.price} DA</span>
                        <Button
                          size="sm"
                          onClick={() => addPrestation(service)}
                          className="bg-nude-600 hover:bg-nude-700"
                        >
                          Choisir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Choix de la date & heure */}
      {selectedPrestations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">2. Choix de la date & heure</h3>

          {/* Navigation semaine */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {weekDays.map(day => (
                <div
                  key={day.toISOString()}
                  className={`text-center px-4 py-2 rounded-lg ${
                    selectedDate && isSameDay(day, selectedDate)
                      ? 'bg-nude-100 text-nude-700'
                      : ''
                  }`}
                >
                  <p className="text-xs text-gray-500 capitalize">
                    {format(day, 'EEEE', { locale: fr })}
                  </p>
                  <p className="text-sm font-medium">
                    {format(day, 'd MMM', { locale: fr })}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Grille des créneaux */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-2 min-w-[600px]">
              {weekDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const slots = availableSlots[dateKey] || []
                
                return (
                  <div key={dateKey} className="space-y-1">
                    {slots.map(time => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate) && selectedTime === time
                      
                      return (
                        <button
                          key={`${dateKey}-${time}`}
                          onClick={() => handleTimeSelect(day, time)}
                          className={`w-full py-2 text-sm rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-nude-600 text-white'
                              : 'hover:bg-nude-50 text-nude-600'
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Résumé et bouton confirmer */}
      {selectedPrestations.length > 0 && selectedDate && selectedTime && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-8">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">
                {selectedPrestations.length} prestation{selectedPrestations.length > 1 ? 's' : ''} • {totalDuration} min
              </p>
              <p className="text-lg font-bold">{totalPrice} DA</p>
            </div>
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700 px-8"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
