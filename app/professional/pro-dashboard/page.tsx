'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'
import { Calendar, Users, DollarSign, Settings, Plus, Clock, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import ProSidebar from '../../../components/layout/ProSidebar'

export default function ProDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [establishment, setEstablishment] = useState<any>(null)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    totalClients: 0
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔍 PRO-DASHBOARD - Vérification authentification...')
      
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.log('❌ PRO-DASHBOARD - Pas de session, redirection vers login')
        router.push('/professionals/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, full_name, email')
        .eq('id', session.user.id)
        .single()

      console.log('🔍 PRO-DASHBOARD - Profil:', profileData)

      if (profileError || !profileData) {
        console.log('❌ PRO-DASHBOARD - Erreur récupération profil:', profileError)
        router.push('/setup-profile')
        return
      }

      console.log('🔍 PRO-DASHBOARD - user_type:', profileData.user_type)
      if (profileData.user_type !== 'professional' && profileData.user_type !== 'admin') {
        console.log('❌ PRO-DASHBOARD - Pas un compte professionnel, type:', profileData.user_type)
        router.push('/login')
        return
      }

      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .maybeSingle()

      console.log('🔍 PRO-DASHBOARD - Établissement:', establishmentData)

      if (establishmentError) {
        console.log('❌ PRO-DASHBOARD - Erreur établissement:', establishmentError)
      }

      if (!establishmentData) {
        console.log('🔍 PRO-DASHBOARD - Pas d\'établissement, redirection vers setup')
        router.push('/professional/setup')
        return
      }

      const today = new Date().toISOString().split('T')[0]
      
      console.log('📅 Date d\'aujourd\'uhi recherchée:', today)
      
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('establishment_id', establishmentData.id)
        .eq('appointment_date', today)
        .in('status', ['confirmed', 'pending', 'completed', 'paid']) // Inclure les RDV terminés/payés du jour

      console.log('📅 RDV du jour trouvés:', todayAppointments)

      // DEBUG: Voir TOUS les RDV d'aujourd'hui (tous statuts)
      const { data: allTodayAppointments } = await supabase
        .from('appointments')
        .select('id, status, appointment_date, guest_name, start_time')
        .eq('establishment_id', establishmentData.id)
        .eq('appointment_date', today)

      console.log('🔍 TOUS les RDV d\'aujourd\'hui (DEBUG):', allTodayAppointments)

      // Statistiques du mois en cours uniquement
      const currentMonth = new Date().toISOString().slice(0, 7) // Format: YYYY-MM
      const currentYear = new Date().getFullYear()
      const currentMonthNum = new Date().getMonth() + 1
      const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate()
      
      // D'abord, chercher les RDV du mois par date de rendez-vous
      const { data: monthAppointmentsByDate } = await supabase
        .from('appointments')
        .select(`
          *,
          services (price)
        `)
        .eq('establishment_id', establishmentData.id)
        .gte('appointment_date', `${currentMonth}-01`)
        .lt('appointment_date', `${currentMonth}-${String(daysInMonth + 1).padStart(2, '0')}`)
        .in('status', ['completed', 'paid']) // RDV terminés OU payés

      // Ensuite, chercher les RDV payés ce mois-ci via les transactions (peu importe la date du RDV)
      const { data: paidAppointmentsThisMonth } = await supabase
        .from('transactions')
        .select(`
          appointment_id,
          amount,
          created_at,
          appointments!inner(
            id,
            status,
            appointment_date,
            guest_name,
            services (price)
          )
        `)
        .eq('establishment_id', establishmentData.id)
        .eq('payment_status', 'paid')
        .gte('created_at', `${currentMonth}-01T00:00:00Z`)
        .lt('created_at', `${currentMonth}-${String(daysInMonth).padStart(2, '0')}T23:59:59Z`)

      // Calculer le chiffre d'affaires du mois via les transactions
      const { data: monthTransactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('establishment_id', establishmentData.id)
        .eq('payment_status', 'paid')
        .gte('created_at', `${currentMonth}-01T00:00:00Z`)
        .lt('created_at', `${currentMonth}-${String(daysInMonth).padStart(2, '0')}T23:59:59Z`)

      // Filtrer les transactions du mois en cours
      const monthRevenue = monthTransactions?.reduce((sum, t) => {
        const transactionMonth = new Date(t.created_at).toISOString().slice(0, 7)
        if (transactionMonth === currentMonth) {
          return sum + t.amount
        }
        return sum
      }, 0) || 0

      console.log('🔍 RDV du mois par date:', monthAppointmentsByDate)
      console.log('💰 RDV payés ce mois-ci (via transactions):', paidAppointmentsThisMonth)
      console.log('💳 Transactions du mois (détail):', monthTransactions)
      console.log('📅 Période recherchée:', {
        début: `${currentMonth}-01`,
        fin: `${currentMonth}-${String(daysInMonth).padStart(2, '0')}`,
        joursDansMois: daysInMonth,
        moisActuel: currentMonth
      })

      // Combiner les deux : RDV du mois terminés + RDV payés ce mois-ci
      const allPaidCompletedRDV = [
        ...(monthAppointmentsByDate || []),
        ...(paidAppointmentsThisMonth?.map(t => t.appointments) || [])
      ]

      // Éliminer les doublons par ID
      const uniqueRDV = allPaidCompletedRDV.filter((rdv, index, self) => 
        index === self.findIndex((r) => r.id === rdv.id)
      )

      console.log('🎯 RDV uniques terminés/payés du mois:', uniqueRDV)

      // DEBUG: Voir TOUS les RDV du mois pour comprendre
      const { data: allAppointmentsDebug } = await supabase
        .from('appointments')
        .select('id, status, appointment_date, guest_name, created_at')
        .eq('establishment_id', establishmentData.id)
        .gte('appointment_date', `${currentMonth}-01`)
        .lt('appointment_date', `${currentMonth}-${String(daysInMonth).padStart(2, '0')}`)

      console.log('🔍 TOUS les RDV du mois (DEBUG):', allAppointmentsDebug)

      // RDV annulés du mois
      const { data: cancelledAppointments } = await supabase
        .from('appointments')
        .select('id, status, appointment_date, guest_name')
        .eq('establishment_id', establishmentData.id)
        .gte('appointment_date', `${currentMonth}-01`)
        .lt('appointment_date', `${currentMonth}-${String(daysInMonth).padStart(2, '0')}`)
        .eq('status', 'cancelled')

      console.log('❌ RDV annulés trouvés:', cancelledAppointments)
      console.log('🚨 Requête annulés:', {
        établissement: establishmentData.id,
        début: `${currentMonth}-01`,
        fin: `${currentMonth}-${String(daysInMonth).padStart(2, '0')}`,
        statut: 'cancelled'
      })

      setStats({
        totalAppointments: uniqueRDV?.length || 0, // RDV terminés/payés du mois (via date ou paiement)
        todayAppointments: todayAppointments?.length || 0,
        totalRevenue: monthRevenue, // CA du mois
        totalClients: cancelledAppointments?.length || 0 // RDV annulés du mois
      })

      console.log('📊 Statistiques finales du mois:', {
        rdvTerminésPayés: uniqueRDV?.length || 0,
        rdvDuJour: todayAppointments?.length || 0,
        chiffreAffaires: monthRevenue,
        rdvAnnulés: cancelledAppointments?.length || 0,
        détailsRDV: uniqueRDV?.map(r => ({ id: r.id, nom: r.guest_name, statut: r.status, date: r.appointment_date }))
      })

      setProfile(profileData)
      setEstablishment(establishmentData)

    } catch (error) {
      console.error('❌ PRO-DASHBOARD - Erreur:', error)
      router.push('/professionals/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <ProSidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord mensuel</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {profile?.full_name || 'Professionnel'}! Voici un aperçu de votre activité ce mois-ci.
          </p>
        </div>
        <p className="text-gray-600">
          Bienvenue dans votre tableau de bord professionnel
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendez-vous aujourd'hui</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayAppointments > 0 ? 'Rendez-vous prévus' : 'Aucun rendez-vous'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">RDV terminés & payés</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">RDV annulés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Annulations ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
              <p className="text-xs text-muted-foreground">
                Chiffre d'affaires mensuel
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2 text-purple-600" />
                Nouveau rendez-vous
              </CardTitle>
              <CardDescription>
                Créer un nouveau rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/professional/appointments">
                <Button className="w-full">
                  Créer un rendez-vous
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Voir le calendrier
              </CardTitle>
              <CardDescription>
                Consulter tous vos rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/professional/appointments">
                <Button variant="outline" className="w-full">
                  Voir le calendrier
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-600" />
                Paramètres
              </CardTitle>
              <CardDescription>
                Gérer votre établissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/professional/settings">
                <Button variant="outline" className="w-full">
                  Paramètres
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {establishment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                {establishment.name}
              </CardTitle>
              <CardDescription>
                {establishment.address}, {establishment.city}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{establishment.rating || '4.5'}</span>
                  <span className="text-sm text-gray-500">
                    ({establishment.review_count || '0'} avis)
                  </span>
                </div>
                <Link href="/professional/settings">
                  <Button variant="ghost" size="sm">
                    Modifier
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProSidebar>
  )
}
