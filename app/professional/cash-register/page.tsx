'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import ProSidebar from '../../../components/layout/ProSidebar'
import { Receipt, ArrowLeft, Check, X, DollarSign, Calendar, User, Scissors, Calculator, Filter, RefreshCw } from 'lucide-react'

interface Appointment {
  id: string
  guest_name?: string
  guest_phone?: string
  service_id: string
  staff_member_id: string
  appointment_date: string
  start_time: string
  total_price: number
  services?: { name: string; price: number }
  staff_members?: { first_name: string; last_name: string }
}

interface Transaction {
  id: string
  appointment_id: string
  amount: number
  payment_method: 'cash' | 'card' | 'mobile'
  payment_status: 'paid' | 'pending' | 'refunded'
  created_at: string
  appointments?: Appointment
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  specialties: string[]
  is_active: boolean
}

export default function CashRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('appointment')
  
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash'>('cash')
  const [amountPaid, setAmountPaid] = useState<string>('')
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)
  
  // États pour les filtres
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState<boolean>(false)

  const handleStaffChange = (value: string) => {
    console.log('👤 Staff filter changed:', value)
    setSelectedStaffId(value)
  }

  useEffect(() => {
    checkAuthAndLoadData()
  }, [appointmentId])

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
      console.log('🏢 ID de l établissement trouvé:', establishment.id)

      if (appointmentId) {
        await loadAppointment(appointmentId)
      }
      
      await loadStaffMembers(establishment.id)
      await loadTodayTransactions(establishment.id)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAppointment = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          staff_members (first_name, last_name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setAppointment(data)
      
      // Calculer le montant restant à payer
      const totalPrice = data.total_price || data.services?.price || 0
      const { paidAmount: paid, remainingAmount } = await calculatePaymentDetails(id, totalPrice)
      setAmountPaid(remainingAmount.toString())
      setPaidAmount(paid)
    } catch (error) {
      console.error('Erreur chargement RDV:', error)
    }
  }

  const calculatePaymentDetails = async (appointmentId: string, totalPrice: number) => {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('appointment_id', appointmentId)
        .eq('payment_status', 'paid')

      if (error) throw error

      const paidAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const remainingAmount = Math.max(0, totalPrice - paidAmount)
      
      return { paidAmount, remainingAmount }
    } catch (error) {
      console.error('Erreur calcul détails paiement:', error)
      return { paidAmount: 0, remainingAmount: totalPrice }
    }
  }

  const calculateRemainingAmount = async (appointmentId: string, totalPrice: number) => {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('appointment_id', appointmentId)
        .eq('payment_status', 'paid')

      if (error) throw error

      const paidAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      return Math.max(0, totalPrice - paidAmount)
    } catch (error) {
      console.error('Erreur calcul montant restant:', error)
      return totalPrice
    }
  }

  const loadStaffMembers = async (estId: string) => {
    try {
      console.log('🔍 Chargement des collaborateurs pour établissement:', estId)
      
      // D'abord, vérifier s'il y a des collaborateurs sans filtre
      const { data: allStaff, error: allError } = await supabase
        .from('staff_members')
        .select('*')
        .limit(10)

      console.log('🔍 Tous les collaborateurs (sans filtre):', allStaff?.length || 0)
      if (allError) console.error('❌ Erreur tous les collaborateurs:', allError)

      // Ensuite, charger avec les filtres
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('establishment_id', estId)
        .eq('is_active', true)
        .order('first_name', { ascending: true })

      if (error) {
        console.error('❌ Erreur base de données:', error)
        throw error
      }
      
      console.log('✅ Collaborateurs trouvés:', data?.length || 0)
      console.log('📋 Liste des collaborateurs:', data)
      
      // Si aucun collaborateur n'existe, en créer quelques-uns pour démonstration
      if ((!data || data.length === 0) && estId) {
        console.log('📝 Aucun collaborateur trouvé, création de collaborateurs de démonstration...')
        await createDemoStaffMembers(estId)
        
        // Recharger après création
        const { data: newData, error: newError } = await supabase
          .from('staff_members')
          .select('*')
          .eq('establishment_id', estId)
          .eq('is_active', true)
          .order('first_name', { ascending: true })
          
        if (!newError) {
          console.log('✅ Nouveaux collaborateurs créés:', newData?.length || 0)
          setStaffMembers(newData || [])
        }
      } else {
        setStaffMembers(data || [])
      }
    } catch (error) {
      console.error('❌ Erreur chargement personnel:', error)
    }
  }

  const createDemoStaffMembers = async (estId: string) => {
    try {
      const demoStaff = [
        {
          establishment_id: estId,
          first_name: 'Jean',
          last_name: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '0123456789',
          title: 'Coiffeur senior',
          specialties: ['Coupe', 'Coloration'],
          is_active: true,
          can_book_online: true
        },
        {
          establishment_id: estId,
          first_name: 'Marie',
          last_name: 'Martin',
          email: 'marie.martin@example.com',
          phone: '0234567890',
          title: 'Esthéticienne',
          specialties: ['Soins du visage', 'Manucure'],
          is_active: true,
          can_book_online: true
        },
        {
          establishment_id: estId,
          first_name: 'Pierre',
          last_name: 'Durand',
          email: 'pierre.durand@example.com',
          phone: '0345678901',
          title: 'Barbier',
          specialties: ['Barbe', 'Coupe homme'],
          is_active: true,
          can_book_online: true
        }
      ]

      for (const staff of demoStaff) {
        const { error } = await supabase
          .from('staff_members')
          .insert(staff)
        
        if (error) {
          console.error('❌ Erreur création collaborateur:', error)
        } else {
          console.log('✅ Collaborateur créé:', staff.first_name, staff.last_name)
        }
      }
    } catch (error) {
      console.error('❌ Erreur création collaborateurs de démo:', error)
    }
  }

  const loadTodayTransactions = async (estId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          appointments (
            guest_name,
            services (name),
            staff_members (first_name, last_name)
          )
        `)
        .eq('establishment_id', estId)
        .gte('created_at', today)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodayTransactions(data || [])
      setFilteredTransactions(data || [])
    } catch (error) {
      console.error('Erreur chargement transactions:', error)
    }
  }

  const loadFilteredTransactions = async () => {
    if (!establishmentId) return
    
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          appointments (
            guest_name,
            services (name),
            staff_members (first_name, last_name)
          )
        `)
        .eq('establishment_id', establishmentId)

      // Appliquer le filtre de date si défini
      if (startDate) {
        query = query.gte('created_at', startDate)
      } else {
        // Par défaut, utiliser aujourd'hui si aucune date de début n'est définie
        const today = new Date().toISOString().split('T')[0]
        query = query.gte('created_at', today)
      }

      if (endDate) {
        const endDateTime = new Date(endDate).toISOString().split('T')[0] + 'T23:59:59.999Z'
        query = query.lte('created_at', endDateTime)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      
      let transactions = data || []
      
      // Appliquer le filtre de collaborateur si différent de 'all'
      if (selectedStaffId !== 'all') {
        transactions = transactions.filter(t => 
          t.appointments?.staff_members?.first_name && 
          t.appointments?.staff_members?.last_name &&
          `${t.appointments.staff_members.first_name} ${t.appointments.staff_members.last_name}`.toLowerCase().includes(selectedStaffId.toLowerCase())
        )
      }

      setFilteredTransactions(transactions)
    } catch (error) {
      console.error('Erreur chargement transactions filtrées:', error)
    }
  }

  const processPayment = async () => {
    if (!appointment || !establishmentId) {
      console.error('Données manquantes:', { appointment, establishmentId })
      alert('Données manquantes. Veuillez réessayer.')
      return
    }
    
    setIsProcessing(true)
    try {
      console.log('💰 Tentative de paiement:', {
        appointment_id: appointment.id,
        establishment_id: establishmentId,
        amount: parseFloat(amountPaid),
        payment_method: paymentMethod
      })

      // Créer la transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          appointment_id: appointment.id,
          establishment_id: establishmentId,
          amount: parseFloat(amountPaid),
          payment_method: paymentMethod,
          payment_status: 'paid'
        })
        .select()
        .single()

      if (transactionError) {
        console.error('❌ Erreur transaction:', transactionError)
        throw transactionError
      }

      console.log('✅ Transaction créée:', transaction)

      // Mettre à jour le statut du rendez-vous
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed'
        })
        .eq('id', appointment.id)

      if (appointmentError) {
        console.error('❌ Erreur mise à jour RDV:', appointmentError)
        throw appointmentError
      }

      console.log('✅ RDV mis à jour')

      // Recharger les transactions
      await loadTodayTransactions(establishmentId)
      
      // Réinitialiser le formulaire
      setAppointment(null)
      setAmountPaid('')
      setPaymentMethod('cash')
      
      // Afficher un message de succès
      alert('Paiement enregistré avec succès !')
      
      // Rediriger vers la page des rendez-vous
      router.push('/professional/appointments')
    } catch (error: any) {
      console.error('❌ Erreur complète:', error)
      const errorMessage = error?.message || error?.details || 'Erreur inconnue'
      alert(`Erreur lors du paiement: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    return <DollarSign className="w-4 h-4" />
  }

  const getPaymentMethodLabel = (method: string) => {
    return 'Espèces'
  }

  const calculateTotal = () => {
    return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  }

  const calculateByMethod = (method: string) => {
    return filteredTransactions
      .filter(t => t.payment_method === method)
      .reduce((sum, transaction) => sum + transaction.amount, 0)
  }

  const resetFilters = () => {
    setSelectedStaffId('all')
    setStartDate('')
    setEndDate('')
    setShowFilters(false)
    loadTodayTransactions(establishmentId!)
  }

  useEffect(() => {
    loadFilteredTransactions()
  }, [selectedStaffId, startDate, endDate])

  if (loading) {
    return (
      <ProSidebar>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </ProSidebar>
    )
  }

  return (
    <ProSidebar>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/professional/appointments')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Calculator className="w-8 h-8 mr-3" />
                Caisse
              </h1>
              <p className="text-gray-600">Gestion des paiements</p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtres
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Masquer' : 'Afficher'} les filtres
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtre collaborateur - Version temporaire avec boutons radio */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Collaborateur
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="radio"
                        name="collaborateur"
                        value="all"
                        checked={selectedStaffId === 'all'}
                        onChange={(e) => {
                          console.log('📻 Radio change:', e.target.value)
                          handleStaffChange(e.target.value)
                        }}
                        className="text-purple-600"
                      />
                      <span className="text-sm">Tous les collaborateurs</span>
                    </label>
                    {staffMembers.map((member) => (
                      <label key={member.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="radio"
                          name="collaborateur"
                          value={`${member.first_name} ${member.last_name}`}
                          checked={selectedStaffId === `${member.first_name} ${member.last_name}`}
                          onChange={(e) => {
                            console.log('📻 Radio change:', e.target.value)
                            handleStaffChange(e.target.value)
                          }}
                          className="text-purple-600"
                        />
                        <span className="text-sm">{member.first_name} {member.last_name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtre date de début */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="JJ/MM/AAAA"
                  />
                </div>

                {/* Filtre date de fin */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="JJ/MM/AAAA"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Statistiques du jour */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {startDate || endDate ? 'Total filtré' : 'Total du jour'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {calculateTotal().toFixed(2)}€
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espèces</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {calculateByMethod('cash').toFixed(2)}€
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.payment_method === 'cash').length} paiements
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Nouveau paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {appointment ? (
                <>
                  {/* Détails du rendez-vous */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Détails du rendez-vous</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{appointment.guest_name || 'Client'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Scissors className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{appointment.services?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} à {appointment.start_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Récapitulatif du paiement */}
                  {paidAmount > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Récapitulatif du paiement</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Montant total:</span>
                          <span className="font-semibold">{(appointment?.total_price || appointment?.services?.price || 0).toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Déjà payé:</span>
                          <span className="font-semibold text-green-600">{paidAmount.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-200">
                          <span className="font-medium">Reste à payer:</span>
                          <span className="font-bold text-blue-600">{amountPaid}€</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Montant */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {paidAmount > 0 ? 'Montant restant à payer' : 'Montant à payer'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">€</span>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {paidAmount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {paidAmount.toFixed(2)}€ déjà payé(s)
                      </p>
                    )}
                  </div>

                  {/* Méthode de paiement */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Méthode de paiement</label>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="default"
                        disabled
                        className="flex flex-col items-center space-y-2 h-20 w-32"
                      >
                        <DollarSign className="w-6 h-6" />
                        <span className="text-sm">Espèces</span>
                      </Button>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={processPayment}
                      disabled={!amountPaid || parseFloat(amountPaid) <= 0 || isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Valider le paiement
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAppointment(null)
                        setAmountPaid('')
                        router.push('/professional/appointments')
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun rendez-vous sélectionné
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Sélectionnez un rendez-vous terminé pour enregistrer un paiement
                  </p>
                  <Button onClick={() => router.push('/professional/appointments')}>
                    Voir les rendez-vous
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  {startDate || endDate ? 'Transactions filtrées' : 'Transactions du jour'}
                </span>
                <span className="text-sm font-normal text-gray-500">
                  {startDate || endDate 
                    ? `${startDate || 'Début'} - ${endDate || "Aujourd'hui"}`
                    : new Date().toLocaleDateString('fr-FR')
                  }
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getPaymentMethodIcon(transaction.payment_method)}
                          <span className="font-medium">
                            {transaction.appointments?.guest_name || 'Client'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {transaction.appointments?.services?.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>
                            {transaction.appointments?.staff_members?.first_name} {transaction.appointments?.staff_members?.last_name}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(transaction.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {transaction.amount.toFixed(2)}€
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPaymentMethodLabel(transaction.payment_method)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {startDate || endDate ? 'Aucune transaction trouvée' : 'Aucune transaction aujourd\'hui'}
                  </h3>
                  <p className="text-gray-600">
                    {startDate || endDate 
                      ? 'Essayez d\'ajuster les filtres pour voir les transactions'
                      : 'Les paiements apparaîtront ici'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProSidebar>
  )
}
