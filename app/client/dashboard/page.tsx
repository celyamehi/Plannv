'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { getFullName } from '@/lib/utils/profile' // Plus nécessaire avec profiles unifiée

// Vérifier si on est côté client
const isClient = typeof window !== 'undefined'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [visitedSalonsCount, setVisitedSalonsCount] = useState(0)
  const [thisMonthCount, setThisMonthCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isClient) {
      checkAuth()
    }

    return () => setMounted(false)
  }, [isClient])

  const checkAuth = async () => {
    try {
      if (!isClient) return

      console.log('🔍 DASHBOARD - Vérification authentification...')
      console.log('🔍 DASHBOARD - URL actuelle:', window.location.href)

      // Vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession()

      console.log('🔍 DASHBOARD - Session:', session ? 'trouvée' : 'non trouvée')

      if (!session) {
        console.log('❌ DASHBOARD - Pas de session, redirection vers login')
        console.log('🔍 DASHBOARD - Redirection vers /login depuis:', window.location.pathname)
        router.push('/login')
        return
      }

      // Récupérer le profil utilisateur depuis la table profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, full_name, email')
        .eq('id', session.user.id)
        .single()

      console.log('🔍 DASHBOARD - Profil:', profileData)

      if (profileError || !profileData) {
        console.log('❌ DASHBOARD - Erreur récupération profil:', profileError)
        console.log('🔍 DASHBOARD - Redirection vers /setup-profile')
        router.push('/setup-profile')
        return
      }

      // Si l'utilisateur est un professionnel, rediriger vers le dashboard pro
      if (profileData.user_type === 'professional' || profileData.user_type === 'admin') {
        console.log('🔄 DASHBOARD - Utilisateur professionnel, redirection vers dashboard pro')
        router.push('/professional/pro-dashboard')
        return
      }

      // Le profil est déjà récupéré, on le stocke
      console.log('✅ DASHBOARD - Client confirmé')

      setProfile({
        ...profileData,
        email: session.user.email
      })

      // Récupérer les rendez-vous à venir (uniquement les non annulés)
      const today = new Date().toISOString().split('T')[0]
      const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

      console.log('🔍 DASHBOARD - Fetching appointments for:', session.user.id)
      console.log('🔍 DASHBOARD - Date reference:', today)

      const { data: appointmentsData, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          establishment:establishments(name, address, city, slug),
          service:services(name, duration, price),
          staff_member:staff_members(first_name, last_name)
        `)
        .eq('client_id', session.user.id)
        .neq('status', 'cancelled') // Exclure les rendez-vous annulés
        .gte('appointment_date', today) // Date >= aujourd'hui
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (fetchError) {
        console.error('❌ DASHBOARD - Fetch error:', fetchError)
      } else {
        console.log('✅ DASHBOARD - Raw appointments found:', appointmentsData?.length)
        console.log('✅ DASHBOARD - Raw data:', appointmentsData)
      }

      // Filtrer côté client pour être sûr (exclure les RDV d'aujourd'hui déjà passés)
      const validAppointments = (appointmentsData || []).filter(apt => {
        if (apt.appointment_date > today) return true
        if (apt.appointment_date === today) {
          return apt.start_time >= currentTime
        }
        return false
      })

      console.log('✅ DASHBOARD - Valid appointments after filter:', validAppointments.length)
      setUpcomingAppointments(validAppointments.slice(0, 5))

      // Récupérer le nombre de favoris
      const { count: favCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', session.user.id)

      setFavoritesCount(favCount || 0)

      // Récupérer le nombre de salons visités (établissements uniques avec rendez-vous terminés)
      const { data: completedAppointments } = await supabase
        .from('appointments')
        .select('establishment_id')
        .eq('client_id', session.user.id)
        .eq('status', 'completed')

      const uniqueSalons = new Set(completedAppointments?.map(apt => apt.establishment_id) || [])
      setVisitedSalonsCount(uniqueSalons.size)

      // Récupérer le nombre de rendez-vous ce mois-ci (tous statuts sauf annulé)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

      const { count: monthCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', session.user.id)
        .neq('status', 'cancelled')
        .gte('appointment_date', startOfMonth)
        .lte('appointment_date', endOfMonth)

      setThisMonthCount(monthCount || 0)
    } catch (error) {
      console.error('❌ DASHBOARD - Erreur:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Afficher un écran de chargement si on est en cours de chargement ou non monté
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement de votre espace personnel...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const fullName = profile.full_name || 'Utilisateur'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue {fullName} 👋
          </h1>
          <p className="text-gray-600">
            Voici votre espace personnel pour gérer vos rendez-vous beauté
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rendez-vous à venir</p>
                  <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-nude-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ce mois-ci</p>
                  <p className="text-3xl font-bold">
                    {thisMonthCount}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-nude-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Favoris</p>
                  <p className="text-3xl font-bold">{favoritesCount}</p>
                </div>
                <Star className="w-8 h-8 text-nude-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salons visités</p>
                  <p className="text-3xl font-bold">{visitedSalonsCount}</p>
                </div>
                <MapPin className="w-8 h-8 text-nude-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Vos prochains rendez-vous</CardTitle>
            <CardDescription>
              Ne manquez aucun de vos rendez-vous beauté
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun rendez-vous à venir</p>
                <p className="text-sm text-gray-500 mt-2">
                  Réservez votre premier rendez-vous dès maintenant !
                </p>
                <Link href="/search" className="inline-block mt-4">
                  <Button className="bg-gradient-to-r from-nude-600 to-warm-600 hover:from-nude-700 hover:to-warm-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Réserver un rendez-vous
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <p className="font-medium">
                          {new Date(appointment.appointment_date).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-gray-600">{appointment.start_time}</p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.service?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.establishment?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.service?.price}DA</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/search">
                <Button className="w-full bg-gradient-to-r from-nude-600 to-warm-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Nouveau rendez-vous
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/client/appointments" className="text-sm font-medium text-nude-600 hover:text-nude-700">
                  Voir tous les rendez-vous
                </Link>
                <Link href="/client/favorites">
                  <Button className="w-full" variant="outline">
                    Mes favoris
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-nude-50 rounded-lg">
                  <p className="text-sm font-medium text-nude-800">Découvrez les salons près de chez vous</p>
                  <p className="text-xs text-nude-700 mt-1">Trouvez les meilleurs professionnels de la beauté</p>
                </div>
                <Link href="/search" className="block">
                  <Button variant="outline" className="w-full">
                    Explorer les salons
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
