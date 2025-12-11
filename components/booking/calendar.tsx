'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react'
import { format, isSameDay, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

interface TimeSlot {
  time: string
  available: boolean
}

interface BookingCalendarProps {
  staffMemberId: string
  serviceDuration: number
  onSlotSelect: (date: Date, time: string) => void
}

export function BookingCalendar({ staffMemberId, serviceDuration, onSlotSelect }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)

  const today = useMemo(() => startOfDay(new Date()), [])

  const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(':').map((part) => parseInt(part, 10))
    return hour * 60 + minute
  }

  const minutesToTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const fetchAvailableSlots = async (date: Date) => {
    if (!staffMemberId) {
      setAvailableSlots([])
      return
    }

    setLoadingSlots(true)
    setSlotsError(null)

    try {
      const dateStr = format(date, 'yyyy-MM-dd')

      const dayOfWeek = date.getDay()

      const { data: availabilities, error: availabilityError } = await supabase
        .from('availability_slots')
        .select('start_time, end_time')
        .eq('staff_member_id', staffMemberId)
        .eq('is_active', true)
        .eq('day_of_week', dayOfWeek)

      if (availabilityError) throw availabilityError

      if (!availabilities || availabilities.length === 0) {
        setAvailableSlots([])
        return
      }

      const { data: timeOffData, error: timeOffError } = await supabase
        .from('time_off')
        .select('start_date, end_date')
        .eq('staff_member_id', staffMemberId)

      if (timeOffError) throw timeOffError

      const isOnLeave = timeOffData?.some((leave) => {
        return dateStr >= leave.start_date && dateStr <= leave.end_date
      })

      if (isOnLeave) {
        setAvailableSlots([])
        return
      }

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          start_time,
          end_time,
          status,
          service:services(duration)
        `)
        .eq('staff_member_id', staffMemberId)
        .eq('appointment_date', dateStr)
        .in('status', ['pending', 'confirmed'])

      if (appointmentsError) throw appointmentsError

      const slots: TimeSlot[] = []
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      availabilities.forEach(({ start_time, end_time }) => {
        const startMinutes = timeToMinutes(start_time.substring(0, 5))
        const endMinutes = timeToMinutes(end_time.substring(0, 5))

        for (let minute = startMinutes; minute <= endMinutes - serviceDuration; minute += 15) {
          if (isSameDay(date, now) && minute < currentMinutes) {
            continue
          }

          const slotEnd = minute + serviceDuration
          const hasConflict = (appointmentsData || []).some((apt) => {
            const aptStart = timeToMinutes(apt.start_time.substring(0, 5))
            const aptEnd = (() => {
              if (apt.end_time) {
                return timeToMinutes(apt.end_time.substring(0, 5))
              }

              const relatedDuration = (() => {
                const raw = (apt as { service?: { duration?: number } }).service?.duration
                if (typeof raw === 'number' && !Number.isNaN(raw)) {
                  return raw
                }
                return serviceDuration
              })()

              return aptStart + relatedDuration
            })()
            return minute < aptEnd && slotEnd > aptStart
          })

          slots.push({
            time: minutesToTime(minute),
            available: !hasConflict
          })
        }
      })

      setAvailableSlots(slots)
    } catch (error) {
      console.error('Erreur chargement créneaux:', error)
      setSlotsError('Impossible de charger les créneaux disponibles. Réessayez plus tard.')
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      onSlotSelect(selectedDate, time)
    }
  }

  useEffect(() => {
    if (selectedDate && staffMemberId) {
      fetchAvailableSlots(selectedDate)
    } else {
      setAvailableSlots([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, staffMemberId, serviceDuration])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Choisissez une date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const normalized = startOfDay(date)
              return normalized < today
            }}
            locale={fr}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Choisissez un créneau
          </CardTitle>
          {selectedDate && (
            <p className="text-sm text-gray-600">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <div className="text-center py-12 text-gray-500">
              Sélectionnez d&apos;abord une date
            </div>
          ) : loadingSlots ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              Chargement des créneaux...
            </div>
          ) : slotsError ? (
            <div className="text-center py-12 text-destructive text-sm">
              {slotsError}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun créneau disponible pour cette date
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                  className={`${selectedTime === slot.time
                      ? 'bg-gradient-to-r from-nude-600 to-warm-600'
                      : ''
                    } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
