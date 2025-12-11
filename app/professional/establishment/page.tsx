'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import ProSidebar from '../../../components/layout/ProSidebar'
import { Calendar, DollarSign, Clock, TrendingUp, Building, Image as ImageIcon, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Establishment {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  gallery: string[]
}

interface Appointment {
  id: string
  appointment_date: string
  status: string
  total_price?: number
  services?: { price: number }
  guest_name?: string
  client_id?: string
}

interface Transaction {
  id: string
  amount: number
  payment_status: string
  created_at: string
}

export default function EstablishmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalRevenue: 0,
    appointmentsByStatus: { confirmed: 0, pending: 0, completed: 0, cancelled: 0 },
    monthlyGrowth: 0
  })
  const [establishment, setEstablishment] = useState<Establishment | null>(null)

  useEffect(() => {
    checkAuthAndLoadStats()
  }, [])

  const checkAuthAndLoadStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('🔐 Aucune session trouvée')
        return
      }

      console.log('👤 Session utilisateur:', session.user.id)

      // D'abord, vérifier la structure de la table profiles
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)

      if (allProfilesError) {
        console.error('❌ Erreur recherche profils:', allProfilesError)
        throw allProfilesError
      }

      console.log('🔍 Structure du profil utilisateur:', allProfiles)

      // Chercher l'établissement directement via owner_id (comme dans le dashboard)
      const { data: establishmentData, error: establishmentError } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .maybeSingle()

      if (establishmentError) {
        console.error('❌ Erreur établissement:', establishmentError)
        throw establishmentError
      }

      console.log('🏢 Établissement trouvé:', establishmentData)

      if (establishmentData?.id) {
        console.log('🏢 ID établissement trouvé:', establishmentData.id)
        setEstablishment({
          ...establishmentData,
          gallery: establishmentData.gallery || []
        })
        await loadAllTimeStats(establishmentData.id)
      } else {
        console.log('⚠️ Aucun établissement associé à cet utilisateur')
      }
    } catch (error) {
      console.error('❌ Erreur complète:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllTimeStats = async (estId: string) => {
    try {
      console.log('🏢 Chargement stats pour établissement:', estId)
      
      // Charger tous les rendez-vous depuis l'ouverture
      const { data: appointments, error: aptError } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          status,
          total_price,
          services (price),
          guest_name,
          client_id
        `)
        .eq('establishment_id', estId)
        .order('appointment_date', { ascending: false })

      if (aptError) throw aptError

      console.log('📅 RDV trouvés (établissement):', appointments?.length || 0)

      // Charger toutes les transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('id, amount, payment_status, created_at')
        .eq('establishment_id', estId)
        .eq('payment_status', 'paid')

      if (transError) throw transError

      console.log('💰 Transactions trouvées (établissement):', transactions?.length || 0)

      // DEBUG: Afficher les données brutes
      console.log('📋 RDV bruts (établissement):', appointments)
      console.log('💳 Transactions brutes (établissement):', transactions)

      // Calculer les statistiques
      const totalAppointments = appointments?.length || 0

      // Chiffre d'affaires total
      const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0

      // Répartition par statut
      const appointmentsByStatus = appointments?.reduce((acc, apt) => {
        acc[apt.status as keyof typeof acc]++
        return acc
      }, { confirmed: 0, pending: 0, completed: 0, cancelled: 0 }) || { confirmed: 0, pending: 0, completed: 0, cancelled: 0 }

      // Croissance mensuelle (comparaison avec le mois précédent)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const currentMonthAppointments = appointments?.filter(apt => {
        const date = new Date(apt.appointment_date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }).length || 0

      const lastMonthAppointments = appointments?.filter(apt => {
        const date = new Date(apt.appointment_date)
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
      }).length || 0

      const monthlyGrowth = lastMonthAppointments > 0 
        ? ((currentMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100 
        : 0

      setStats({
        totalAppointments,
        totalRevenue,
        appointmentsByStatus,
        monthlyGrowth
      })

      console.log('📊 Statistiques globales chargées:', {
        totalAppointments,
        totalRevenue,
        monthlyGrowth
      })

    } catch (error) {
      console.error('Erreur chargement statistiques:', error)
    }
  }

  if (loading) {
    return (
      <ProSidebar>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </ProSidebar>
    )
  }

  if (!establishment) {
    return (
      <ProSidebar>
        <div className="p-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Aucun établissement trouvé</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez d'abord créer un établissement pour accéder aux statistiques.
            </p>
            <Button onClick={() => router.push('/professional/onboarding')}>
              Créer un établissement
            </Button>
          </div>
        </div>
      </ProSidebar>
    )
  }

  return (
    <ProSidebar>
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            {establishment.logo_url ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border">
                <Image
                  src={establishment.logo_url}
                  alt={`Logo de ${establishment.name}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Building className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{establishment.name}</h1>
              <p className="text-muted-foreground">
                {establishment.city} • {establishment.postal_code}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/professional/establishment/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </Button>
        </div>

        {establishment.gallery && establishment.gallery.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {establishment.gallery.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={image}
                    alt={`Photo de l'établissement ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Statistiques de l'établissement</h2>
          <p className="text-muted-foreground">Vue d'ensemble complète depuis l'ouverture</p>
        </div>

        {/* Cartes principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total rendez-vous</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">Depuis l'ouverture</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}DA</div>
              <p className="text-xs text-muted-foreground">Total encaissé</p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par statut */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Répartition des rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Confirmés</span>
                  <span className="text-sm font-bold text-green-600">{stats.appointmentsByStatus.confirmed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">En attente</span>
                  <span className="text-sm font-bold text-yellow-600">{stats.appointmentsByStatus.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Terminés</span>
                  <span className="text-sm font-bold text-blue-600">{stats.appointmentsByStatus.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Annulés</span>
                  <span className="text-sm font-bold text-red-600">{stats.appointmentsByStatus.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Croissance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Croissance mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${(stats.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(stats.monthlyGrowth || 0) >= 0 ? '+' : ''}{(stats.monthlyGrowth || 0).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {(stats.monthlyGrowth || 0) >= 0 ? 'Augmentation' : 'Baisse'} par rapport au mois dernier
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carte récapitulative */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Résumé de l'établissement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-nude-600">{stats.totalAppointments || 0}</div>
                <p className="text-sm text-gray-600">RDV totaux</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{(stats.totalRevenue || 0).toFixed(0)}DA</div>
                <p className="text-sm text-gray-600">CA total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProSidebar>
  )
}
