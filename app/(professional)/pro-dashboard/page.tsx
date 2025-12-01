'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Users, DollarSign, TrendingUp, Settings, Plus, Clock, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProSidebar from '@/components/layout/ProSidebar'

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
    const checkAuth = async () => {
      try {
        console.log('🔍 PRO-DASHBOARD - Vérification authentification...')

        // Vérifier l'authentification
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          console.log('❌ PRO-DASHBOARD - Pas de session, redirection vers login')
          router.push('/professionals/login')
          return
        }

        // Vérifier le profil utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, full_name, email')
          .eq('id', session.user.id)
          .single()

        console.log('🔍 PRO-DASHBOARD - Profil:', profileData)
        console.log('🔍 PRO-DASHBOARD - Erreur profil:', profileError)

        if (profileError || !profileData) {
          console.log('❌ PRO-DASHBOARD - Erreur récupération profil:', profileError)
          router.push('/setup-profile')
          return
        }

        // Vérifier que c'est bien un professionnel
        console.log('🔍 PRO-DASHBOARD - user_type:', profileData.user_type)
        if (profileData.user_type !== 'professional' && profileData.user_type !== 'admin') {
          console.log('❌ PRO-DASHBOARD - Pas un compte professionnel, type:', profileData.user_type)
          router.push('/login')
          return
        }

        // Vérifier si l'établissement existe
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

        // Récupérer les statistiques
        const today = new Date().toISOString().split('T')[0]

        // Rendez-vous aujourd'hui
        const { data: todayAppointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('establishment_id', establishmentData.id)
          .eq('appointment_date', today)
          .in('status', ['confirmed', 'pending'])

        // Total des rendez-vous
        const { data: totalAppointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('establishment_id', establishmentData.id)
          .in('status', ['confirmed', 'completed'])

        // Total des clients uniques
        const { data: uniqueClients } = await supabase
          .from('appointments')
          .select('client_id')
          .eq('establishment_id', establishmentData.id)
          .in('status', ['completed'])

        // Calculer le revenu total
        const totalRevenue = totalAppointments?.reduce((sum, apt) => {
          return sum + (apt.service?.price || 0)
        }, 0) || 0

        setStats({
          totalAppointments: totalAppointments?.length || 0,
          todayAppointments: todayAppointments?.length || 0,
          totalRevenue: totalRevenue,
          totalClients: new Set(uniqueClients?.map(a => a.client_id)).size || 0
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

    checkAuth()
  }, [router])

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
    <div className="min-h-screen bg-gray-50 flex">
      <ProSidebar currentPage="dashboard" />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {profile?.full_name || 'Professionnel'} 👋
          </h1>
          <p className="text-gray-600">
            Bienvenue dans votre tableau de bord professionnel
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendez-vous aujourd&apos;hui</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total rendez-vous</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Depuis l&apos;ouverture
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Clients uniques
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue}€</div>
              <p className="text-xs text-muted-foreground">
                Total généré
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
              <Link href="/professional/appointments/new">
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

        {/* Establishment Info */}
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
      </main>
    </div>
  )
}
