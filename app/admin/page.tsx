'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  Users, Building, Calendar, TrendingUp, Search, Filter,
  MoreVertical, Check, X, Clock, AlertTriangle, Trash2,
  Play, Pause, Eye, ChevronDown, RefreshCw, LogOut,
  UserCheck, UserX, DollarSign, Shield
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  phone: string
  user_type: 'client' | 'professional' | 'admin'
  subscription_status: 'pending' | 'trial' | 'active' | 'suspended' | 'expired'
  subscription_ends_at: string | null
  trial_ends_at: string | null
  created_at: string
  establishment?: {
    id: string
    name: string
    city: string
    is_active: boolean
  }
}

interface Stats {
  total_clients: number
  total_professionals: number
  pending_pros: number
  trial_pros: number
  active_pros: number
  suspended_pros: number
  expired_pros: number
  total_establishments: number
  active_establishments: number
}

const PLAN_OPTIONS = [
  { value: 'trial', label: 'Essai gratuit (7 jours)', duration: 7, price: 0, isTrial: true },
  { value: '1_month', label: '1 mois', duration: 30, price: 5000, isTrial: false },
  { value: '3_months', label: '3 mois', duration: 90, price: 12000, isTrial: false },
  { value: '6_months', label: '6 mois', duration: 180, price: 20000, isTrial: false },
  { value: '12_months', label: '12 mois', duration: 365, price: 35000, isTrial: false },
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'ccp', label: 'CCP' },
  { value: 'baridimob', label: 'BaridiMob' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'client' | 'professional'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState<'activate' | 'suspend' | 'delete' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Formulaire d'activation
  const [activationForm, setActivationForm] = useState({
    plan: '1_month',
    amount: 5000,
    paymentMethod: 'cash',
    paymentReference: '',
    notes: ''
  })

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single()

        if (profile?.user_type !== 'admin') {
          router.push('/')
          return
        }

        setIsAdmin(true)
        fetchData()
      } catch (error) {
        console.error('Erreur vérification admin:', error)
        router.push('/')
      }
    }

    checkAdmin()
  }, [router])

  // Charger les données
  const fetchData = async () => {
    setLoading(true)
    console.log('🔄 Chargement des données...')
    try {
      // Récupérer les utilisateurs avec leurs établissements (sans cache)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, phone, user_type,
          subscription_status, subscription_ends_at, trial_ends_at, created_at
        `)
        .order('created_at', { ascending: false })
        .throwOnError()

      if (usersError) throw usersError

      // Récupérer les établissements
      const { data: establishments } = await supabase
        .from('establishments')
        .select('id, name, city, is_active, owner_id')

      // Associer les établissements aux utilisateurs
      const usersWithEstablishments = usersData?.map(user => ({
        ...user,
        establishment: establishments?.find(e => e.owner_id === user.id)
      })) || []

      // Log détaillé pour déboguer
      usersWithEstablishments.forEach(u => {
        if (u.user_type === 'professional') {
          console.log(`👤 ${u.email} → statut: "${u.subscription_status}" (type: ${typeof u.subscription_status})`)
        }
      })

      setUsers(usersWithEstablishments)

      // Calculer les stats
      const statsData: Stats = {
        total_clients: usersData?.filter(u => u.user_type === 'client').length || 0,
        total_professionals: usersData?.filter(u => u.user_type === 'professional').length || 0,
        pending_pros: usersData?.filter(u => u.user_type === 'professional' && u.subscription_status === 'pending').length || 0,
        trial_pros: usersData?.filter(u => u.user_type === 'professional' && u.subscription_status === 'trial').length || 0,
        active_pros: usersData?.filter(u => u.user_type === 'professional' && u.subscription_status === 'active').length || 0,
        suspended_pros: usersData?.filter(u => u.user_type === 'professional' && u.subscription_status === 'suspended').length || 0,
        expired_pros: usersData?.filter(u => u.user_type === 'professional' && u.subscription_status === 'expired').length || 0,
        total_establishments: establishments?.length || 0,
        active_establishments: establishments?.filter(e => e.is_active).length || 0,
      }
      setStats(statsData)

    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Activer un abonnement
  const handleActivateSubscription = async () => {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const plan = PLAN_OPTIONS.find(p => p.value === activationForm.plan)
      const endsAt = new Date()
      endsAt.setDate(endsAt.getDate() + (plan?.duration || 30))

      const newStatus = activationForm.plan === 'trial' ? 'trial' : 'active'
      console.log('Activation:', { userId: selectedUser.id, newStatus, endsAt: endsAt.toISOString() })

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: newStatus,
          subscription_ends_at: endsAt.toISOString(),
          trial_ends_at: activationForm.plan === 'trial' ? endsAt.toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)

      if (profileError) {
        console.error('Erreur mise à jour profil:', profileError)
        throw profileError
      }

      console.log('✅ Profil mis à jour avec succès')

      // Essayer de créer l'abonnement (table optionnelle)
      try {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedUser.id,
            plan_type: activationForm.plan,
            amount: activationForm.amount,
            currency: 'DZD',
            status: 'active',
            starts_at: new Date().toISOString(),
            ends_at: endsAt.toISOString(),
            payment_method: activationForm.paymentMethod,
            payment_reference: activationForm.paymentReference,
            notes: activationForm.notes,
            created_by: session?.user.id
          })
        console.log('✅ Abonnement créé')
      } catch (subError) {
        console.warn('Table subscriptions non disponible:', subError)
      }

      // Activer l'établissement
      if (selectedUser.establishment) {
        await supabase
          .from('establishments')
          .update({ is_active: true })
          .eq('owner_id', selectedUser.id)
        console.log('✅ Établissement activé')
      }

      // Essayer de logger l'action (table optionnelle)
      try {
        await supabase.from('admin_logs').insert({
          admin_id: session?.user.id,
          action: 'activate_subscription',
          target_user_id: selectedUser.id,
          target_type: 'subscription',
          details: {
            plan_type: activationForm.plan,
            amount: activationForm.amount,
            payment_method: activationForm.paymentMethod
          }
        })
        console.log('✅ Action loggée')
      } catch (logError) {
        console.warn('Table admin_logs non disponible:', logError)
      }

      // Fermer le modal et rafraîchir
      setShowModal(null)
      setSelectedUser(null)
      
      // Forcer le rafraîchissement
      await fetchData()
      
      alert('✅ Abonnement activé avec succès !')
    } catch (error) {
      console.error('Erreur activation:', error)
      alert('❌ Erreur lors de l\'activation: ' + (error as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  // Suspendre un utilisateur
  const handleSuspendUser = async () => {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)

      // Désactiver l'établissement
      await supabase
        .from('establishments')
        .update({ is_active: false })
        .eq('owner_id', selectedUser.id)

      // Logger
      await supabase.from('admin_logs').insert({
        admin_id: session?.user.id,
        action: 'suspend_user',
        target_user_id: selectedUser.id,
        target_type: 'user'
      })

      setShowModal(null)
      setSelectedUser(null)
      fetchData()
    } catch (error) {
      console.error('Erreur suspension:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // Supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🗑️ Suppression utilisateur:', selectedUser.email)

      // 1. Supprimer les rendez-vous liés à l'établissement
      if (selectedUser.establishment) {
        const { error: aptError } = await supabase
          .from('appointments')
          .delete()
          .eq('establishment_id', selectedUser.establishment.id)
        
        if (aptError) console.warn('Erreur suppression RDV:', aptError)
        else console.log('✅ RDV supprimés')

        // 2. Supprimer les services
        const { error: svcError } = await supabase
          .from('services')
          .delete()
          .eq('establishment_id', selectedUser.establishment.id)
        
        if (svcError) console.warn('Erreur suppression services:', svcError)
        else console.log('✅ Services supprimés')

        // 3. Supprimer les transactions
        const { error: txError } = await supabase
          .from('transactions')
          .delete()
          .eq('establishment_id', selectedUser.establishment.id)
        
        if (txError) console.warn('Erreur suppression transactions:', txError)
        else console.log('✅ Transactions supprimées')

        // 4. Supprimer l'établissement
        const { error: estError } = await supabase
          .from('establishments')
          .delete()
          .eq('id', selectedUser.establishment.id)
        
        if (estError) {
          console.error('Erreur suppression établissement:', estError)
          throw estError
        }
        console.log('✅ Établissement supprimé')
      }

      // 5. Supprimer les abonnements
      try {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', selectedUser.id)
        console.log('✅ Abonnements supprimés')
      } catch (e) {
        console.warn('Table subscriptions non disponible')
      }

      // 6. Supprimer les logs admin liés à cet utilisateur
      try {
        await supabase
          .from('admin_logs')
          .delete()
          .eq('target_user_id', selectedUser.id)
        console.log('✅ Admin logs supprimés')
      } catch (e) {
        console.warn('Table admin_logs non disponible')
      }

      // 7. Supprimer le profil
      const { error: profileError, data: deleteResult } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id)
        .select()

      console.log('🗑️ Résultat suppression profil:', deleteResult, 'Erreur:', profileError)

      if (profileError) {
        console.error('Erreur suppression profil:', profileError)
        throw profileError
      }

      // Vérifier si le profil a vraiment été supprimé
      const { data: checkProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', selectedUser.id)
        .maybeSingle()

      if (checkProfile) {
        console.error('❌ Le profil existe toujours après suppression!')
        throw new Error('La suppression a échoué - vérifiez les permissions RLS dans Supabase')
      }

      console.log('✅ Profil supprimé et vérifié')

      // Note: On ne logge pas la suppression car l'utilisateur n'existe plus
      // et la foreign key bloquerait l'insertion

      // Fermer le modal et mettre à jour la liste localement
      const deletedUserId = selectedUser.id
      setShowModal(null)
      setSelectedUser(null)
      
      // Retirer l'utilisateur de la liste immédiatement
      setUsers(prev => prev.filter(u => u.id !== deletedUserId))
      
      alert('✅ Utilisateur supprimé avec succès !')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression: ' + (error as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.establishment?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || user.user_type === filterType
    const matchesStatus = filterStatus === 'all' || user.subscription_status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Obtenir le badge de statut
  const getStatusBadge = (status: string | null | undefined) => {
    const normalizedStatus = status || 'pending'
    const badges: Record<string, { color: string, icon: any, label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'En attente' },
      trial: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Essai' },
      active: { color: 'bg-green-100 text-green-700', icon: Check, label: 'Actif' },
      suspended: { color: 'bg-red-100 text-red-700', icon: Pause, label: 'Suspendu' },
      expired: { color: 'bg-gray-100 text-gray-700', icon: AlertTriangle, label: 'Expiré' },
    }
    const badge = badges[normalizedStatus] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Kalendo</h1>
                <p className="text-xs text-gray-500">Gestion des utilisateurs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-nude-600 hover:bg-nude-50 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_clients || 0}</p>
                <p className="text-xs text-gray-500">Clients</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-nude-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-nude-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.total_professionals || 0}</p>
                <p className="text-xs text-gray-500">Professionnels</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pending_pros || 0}</p>
                <p className="text-xs text-gray-500">En attente</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.active_pros || 0}</p>
                <p className="text-xs text-gray-500">Actifs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.suspended_pros || 0}</p>
                <p className="text-xs text-gray-500">Suspendus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone ou salon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-nude-300 focus:ring-2 focus:ring-nude-100"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-nude-300"
            >
              <option value="all">Tous les types</option>
              <option value="client">Clients</option>
              <option value="professional">Professionnels</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-nude-300"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="trial">Essai</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Établissement</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiration</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Inscrit le</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'Sans nom'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.user_type === 'professional' 
                          ? 'bg-nude-100 text-nude-700' 
                          : user.user_type === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.user_type === 'professional' ? 'Pro' : user.user_type === 'admin' ? 'Admin' : 'Client'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.establishment ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.establishment.name}</p>
                          <p className="text-xs text-gray-500">{user.establishment.city}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.user_type === 'professional' ? getStatusBadge(user.subscription_status) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.subscription_ends_at ? (
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(user.subscription_ends_at).toLocaleDateString('fr-FR')}
                          </p>
                          {new Date(user.subscription_ends_at) < new Date() && (
                            <p className="text-xs text-red-500">Expiré</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {user.user_type === 'professional' && (
                        <div className="flex items-center justify-end gap-2">
                          {/* Activer */}
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowModal('activate')
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activer/Renouveler"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          
                          {/* Suspendre */}
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowModal('suspend')
                            }}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Suspendre"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                          
                          {/* Supprimer */}
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowModal('delete')
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Activation */}
      {showModal === 'activate' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">Activer l'abonnement</h2>
            <p className="text-gray-600 mb-4">
              <strong>{selectedUser.full_name}</strong> • {selectedUser.email}
            </p>

            {/* Statut actuel */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">
                Statut actuel : {getStatusBadge(selectedUser.subscription_status)}
              </p>
            </div>

            <div className="space-y-4">
              {/* Choix du type d'activation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'activation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActivationForm({ ...activationForm, plan: 'trial', amount: 0 })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      activationForm.plan === 'trial'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-blue-600">🎁 Essai gratuit</div>
                    <div className="text-xs text-gray-500">7 jours gratuits</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const plan = PLAN_OPTIONS.find(p => p.value === '1_month')
                      setActivationForm({ ...activationForm, plan: '1_month', amount: plan?.price || 5000 })
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      activationForm.plan !== 'trial'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-green-600">💳 Abonnement payant</div>
                    <div className="text-xs text-gray-500">Activer directement</div>
                  </button>
                </div>
              </div>

              {/* Si plan payant, afficher les options */}
              {activationForm.plan !== 'trial' && (
                <>
                  {/* Durée */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durée de l'abonnement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLAN_OPTIONS.filter(p => !p.isTrial).map(plan => (
                        <button
                          key={plan.value}
                          type="button"
                          onClick={() => setActivationForm({ ...activationForm, plan: plan.value, amount: plan.price })}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            activationForm.plan === plan.value
                              ? 'border-nude-500 bg-nude-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">{plan.label}</div>
                          <div className="text-sm text-nude-600 font-bold">{plan.price.toLocaleString()} DA</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Montant personnalisé */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant reçu (DA) <span className="text-gray-400 font-normal">- modifiable</span>
                    </label>
                    <input
                      type="number"
                      value={activationForm.amount}
                      onChange={(e) => setActivationForm({ ...activationForm, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-nude-300"
                    />
                  </div>

                  {/* Méthode de paiement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map(method => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setActivationForm({ ...activationForm, paymentMethod: method.value })}
                          className={`p-2 rounded-lg border-2 text-sm transition-all ${
                            activationForm.paymentMethod === method.value
                              ? 'border-nude-500 bg-nude-50 text-nude-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Référence */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Référence paiement (optionnel)</label>
                    <input
                      type="text"
                      value={activationForm.paymentReference}
                      onChange={(e) => setActivationForm({ ...activationForm, paymentReference: e.target.value })}
                      placeholder="N° transaction, reçu, etc."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-nude-300"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                <textarea
                  value={activationForm.notes}
                  onChange={(e) => setActivationForm({ ...activationForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Remarques, détails..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-nude-300"
                />
              </div>
            </div>

            {/* Résumé */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan :</span>
                <span className="font-medium">
                  {PLAN_OPTIONS.find(p => p.value === activationForm.plan)?.label}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Statut après activation :</span>
                <span className={`font-medium ${activationForm.plan === 'trial' ? 'text-blue-600' : 'text-green-600'}`}>
                  {activationForm.plan === 'trial' ? 'Essai' : 'Actif'}
                </span>
              </div>
              {activationForm.plan !== 'trial' && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Montant :</span>
                  <span className="font-bold text-nude-600">{activationForm.amount.toLocaleString()} DA</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleActivateSubscription}
                disabled={actionLoading}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium disabled:opacity-50 ${
                  activationForm.plan === 'trial'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'Activation...' : activationForm.plan === 'trial' ? '🎁 Activer l\'essai' : '✓ Activer l\'abonnement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suspension */}
      {showModal === 'suspend' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold">Suspendre l'utilisateur ?</h2>
              <p className="text-gray-600 mt-2">
                <strong>{selectedUser.full_name}</strong> ne pourra plus accéder à son dashboard.
                Son établissement sera masqué des recherches.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSuspendUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {actionLoading ? 'Suspension...' : 'Suspendre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showModal === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-600">Supprimer définitivement ?</h2>
              <p className="text-gray-600 mt-2">
                Cette action est <strong>irréversible</strong>. Toutes les données de{' '}
                <strong>{selectedUser.full_name}</strong> seront supprimées.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
