'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MapPin, Star, Clock, Calendar, Euro, User, Eye, EyeOff, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'

interface Prestation {
  service: {
    id: string
    name: string
    duration: number
    price: number
  }
  staff: {
    id: string
    first_name: string
    last_name: string
  }
}

interface BookingConfirmationStepProps {
  establishment: {
    id: string
    name: string
    address: string
    city: string
    average_rating?: number
    total_reviews?: number
  }
  prestations: Prestation[]
  selectedDate: Date
  selectedTime: string
  notes: string
  onBack: () => void
  onAddService?: () => void
  onRemovePrestation?: (index: number) => void
  onSuccess: (appointmentId: string) => void
}

export default function BookingConfirmationStep({
  establishment,
  prestations,
  selectedDate,
  selectedTime,
  notes,
  onBack,
  onAddService,
  onRemovePrestation,
  onSuccess
}: BookingConfirmationStepProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptCGU, setAcceptCGU] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formattedDate = format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
  
  // Calculer les totaux
  const totalDuration = prestations.reduce((sum, p) => sum + p.service.duration, 0)
  const totalPrice = prestations.reduce((sum, p) => sum + p.service.price, 0)

  const createAppointments = async (userId: string) => {
    const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
    const appointmentDate = localDate.toISOString().split('T')[0]

    let currentStartMinutes = parseInt(selectedTime.split(':')[0]) * 60 + parseInt(selectedTime.split(':')[1])
    const createdAppointments = []

    // Créer un rendez-vous pour chaque prestation
    for (const prestation of prestations) {
      const startHour = Math.floor(currentStartMinutes / 60)
      const startMinute = currentStartMinutes % 60
      const endTotalMinutes = currentStartMinutes + prestation.service.duration
      const endHour = Math.floor(endTotalMinutes / 60) % 24
      const endMinute = endTotalMinutes % 60

      const formattedStartTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`
      const formattedEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`

      const appointmentData = {
        establishment_id: establishment.id,
        client_id: userId,
        staff_member_id: prestation.staff.id,
        service_id: prestation.service.id,
        appointment_date: appointmentDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        client_notes: notes,
        total_price: prestation.service.price || 0,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single()

      if (error) throw error
      createdAppointments.push(data)

      // Mettre à jour l'heure de début pour la prochaine prestation
      currentStartMinutes = endTotalMinutes
    }

    // Retourner le premier rendez-vous créé (pour la redirection)
    return createdAppointments[0]
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.user) {
        // Créer le rendez-vous
        const appointment = await createAppointments(data.user.id)
        onSuccess(appointment.id)
      }
    } catch (error: any) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Email ou mot de passe incorrect' 
        : error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!acceptCGU) {
      setError('Veuillez accepter les CGU pour continuer')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setLoading(false)
      return
    }

    try {
      // Créer le compte
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Attendre un peu pour laisser les triggers s'exécuter
        await new Promise(resolve => setTimeout(resolve, 500))

        // Créer ou mettre à jour le profil
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (existingProfile) {
          await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              phone: phone,
              user_type: 'client',
            })
            .eq('id', data.user.id)
        } else {
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              phone: phone,
              user_type: 'client',
            })
        }

        // Créer le rendez-vous
        const appointment = await createAppointments(data.user.id)
        onSuccess(appointment.id)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-nude-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
          {prestations.length > 1 ? 'Prestations sélectionnées' : 'Prestation sélectionnée'}
        </h3>
        
        <div className="space-y-3">
          {prestations.map((prestation, index) => (
            <div key={index} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium">{prestation.service.name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4" />
                  {prestation.service.duration} min
                  <span className="mx-1">•</span>
                  <span className="font-medium text-gray-900">{prestation.service.price} DA</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  avec {prestation.staff.first_name} {prestation.staff.last_name}
                </p>
              </div>
              {onRemovePrestation && (
                <button 
                  onClick={() => onRemovePrestation(index)}
                  className="text-nude-600 hover:text-nude-700 text-sm font-medium"
                >
                  Supprimer
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Résumé total si plusieurs prestations */}
        {prestations.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="font-medium text-gray-700">Total</span>
            <span className="font-bold">{totalDuration} min • {totalPrice} DA</span>
          </div>
        )}

        {/* Bouton ajouter une prestation */}
        {onAddService && (
          <button
            onClick={onAddService}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une prestation à la suite</span>
          </button>
        )}
      </div>

      {/* 2. Date et heure sélectionnées */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-nude-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
          Date et heure sélectionnées
        </h3>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-nude-600" />
            <span className="capitalize">{formattedDate}</span>
            <span className="mx-2">•</span>
            <span className="font-medium">à {selectedTime}</span>
          </div>
          <button 
            onClick={onBack}
            className="text-nude-600 hover:text-nude-700 text-sm font-medium"
          >
            Modifier
          </button>
        </div>
      </div>

      {/* 3. Identification */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-nude-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
          Identification
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {authMode === 'login' ? (
          /* Formulaire de connexion */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-sm">
              <Link href="/forgot-password" className="text-nude-600 hover:text-nude-700">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setAuthMode('signup')}
            >
              Créer mon compte
            </Button>
          </form>
        ) : (
          /* Formulaire d'inscription */
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm text-gray-600">
                    🇩🇿 +213
                  </span>
                  <Input
                    type="tel"
                    placeholder="Entrer votre numéro..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nom complet *</label>
              <Input
                type="text"
                placeholder="Votre nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="cgu"
                checked={acceptCGU}
                onChange={(e) => setAcceptCGU(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="cgu" className="text-sm text-gray-600">
                J'accepte les{' '}
                <Link href="/cgu" className="text-nude-600 hover:underline">CGU</Link>
                {' '}de Kalendo.
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700"
              disabled={loading}
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Vos informations sont traitées par Kalendo, consultez notre{' '}
              <Link href="/confidentialite" className="text-nude-600 hover:underline">
                politique de confidentialité
              </Link>.
            </p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setAuthMode('login')}
            >
              Se connecter
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
