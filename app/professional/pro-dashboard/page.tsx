'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase/client'
import Link from 'next/link'
import { Calendar, Users, DollarSign, Settings, Plus, Clock, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import ProSidebar from '../../../components/layout/ProSidebar'
import SubscriptionBanner from '../../../components/SubscriptionBanner'

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
        .select('user_type, full_name, email, subscription_status, subscription_ends_at')
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

      // Vérifier le statut d'abonnement (sauf pour les admins)
      if (profileData.user_type === 'professional') {
        const status = profileData.subscription_status
        const endsAt = profileData.subscription_ends_at ? new Date(profileData.subscription_ends_at) : null
        const now = new Date()

        // Vérifier si l'essai/abonnement a expiré
        if (status === 'trial' || status === 'active') {
          if (endsAt && endsAt < now) {
            // Mettre à jour le statut en "expired"
            await supabase
              .from('profiles')
              .update({ subscription_status: 'expired' })
              .eq('id', session.user.id)
            
            console.log('⚠️ PRO-DASHBOARD - Abonnement expiré, redirection')
            router.push('/account-suspended')
            return
          }
        }

        // Bloquer l'accès si suspendu ou expiré
        if (status === 'suspended' || status === 'expired') {
          console.log('🚫 PRO-DASHBOARD - Compte suspendu/expiré, redirection')
          router.push('/account-suspended')
          return
        }

        // Bloquer si en attente (pending) - jamais activé
        if (status === 'pending' || !status) {
          console.log('⏳ PRO-DASHBOARD - Compte en attente d\'activation')
          // On laisse passer mais avec la bannière d'avertissement
        }
      }

      const { data: establishments, error: establishmentError } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const establishmentData = establishments?.[0] || null
      console.log('🔍 PRO-DASHBOARD - Établissement:', establishmentData)

      if (establishmentError) {
        console.log('❌ PRO-DASHBOARD - Erreur établissement:', establishmentError)
      }

      if (!establishmentData) {
        console.log('🔍 PRO-DASHBOARD - Pas d\'établissement, redirection vers setup')
        router.push('/professionals/signup')
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
      const now = new Date()
      const currentMonth = now.toISOString().slice(0, 7) // Format: YYYY-MM
      const startOfMonth = `${currentMonth}-01`
      
      // Calculer le premier jour du mois suivant
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const endOfMonth = nextMonth.toISOString().slice(0, 10) // Format: YYYY-MM-DD
      
      // D'abord, chercher les RDV du mois par date de rendez-vous
      const { data: monthAppointmentsByDate } = await supabase
        .from('appointments')
        .select(`
          *,
          services (price)
        `)
        .eq('establishment_id', establishmentData.id)
        .gte('appointment_date', startOfMonth)
        .lt('appointment_date', endOfMonth)
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
        .gte('created_at', `${startOfMonth}T00:00:00Z`)
        .lt('created_at', `${endOfMonth}T00:00:00Z`)

      // Calculer le chiffre d'affaires du mois via les transactions
      const { data: monthTransactions } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('establishment_id', establishmentData.id)
        .eq('payment_status', 'paid')
        .gte('created_at', `${startOfMonth}T00:00:00Z`)
        .lt('created_at', `${endOfMonth}T00:00:00Z`)

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
        début: startOfMonth,
        fin: endOfMonth,
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
        .gte('appointment_date', startOfMonth)
        .lt('appointment_date', endOfMonth)

      console.log('🔍 TOUS les RDV du mois (DEBUG):', allAppointmentsDebug)

      // RDV annulés du mois
      const { data: cancelledAppointments } = await supabase
        .from('appointments')
        .select('id, status, appointment_date, guest_name')
        .eq('establishment_id', establishmentData.id)
        .gte('appointment_date', startOfMonth)
        .lt('appointment_date', endOfMonth)
        .eq('status', 'cancelled')

      console.log('❌ RDV annulés trouvés:', cancelledAppointments)
      console.log('🚨 Requête annulés:', {
        établissement: establishmentData.id,
        début: startOfMonth,
        fin: endOfMonth,
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
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <ProSidebar>
      <div className="p-8">
        {/* Bannière d'abonnement */}
        <SubscriptionBanner />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord mensuel</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {profile?.full_name || 'Professionnel'}! Voici un aperçu de votre activité ce mois-ci.
          </p>
        </div>
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
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}DA</div>
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
                <Plus className="w-5 h-5 mr-2 text-nude-600" />
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
                <Calendar className="w-5 h-5 mr-2 text-nude-600" />
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
                <Settings className="w-5 h-5 mr-2 text-nude-600" />
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
                <MapPin className="w-5 h-5 mr-2 text-nude-600" />
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
