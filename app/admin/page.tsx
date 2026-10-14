'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
  Users, Building, Calendar, TrendingUp, Search, Filter,
  Check, X, Clock, AlertTriangle, Trash2,
  Play, Pause, Eye, ChevronDown, RefreshCw, LogOut,
  UserCheck, UserX, DollarSign, Shield, Receipt, History,
  CreditCard, FileText, CheckCircle2, Activity, ArrowRight,
  RotateCcw, AlertCircle, Sparkles, Phone, Mail, MapPin,
  Info
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

interface SubscriptionRecord {
  id: string
  user_id: string
  plan_type: string
  amount: number
  currency: string
  status: string
  starts_at: string
  ends_at: string
  payment_method: string | null
  payment_reference: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  user?: User
}

interface AdminLogRecord {
  id: string
  admin_id: string
  action: string
  target_user_id: string | null
  target_type: string | null
  details: any
  created_at: string
  target_user?: User
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
  { value: 'trial', label: 'Essai gratuit (30 jours)', duration: 30, price: 0, isTrial: true },
  { value: '1_month', label: '1 mois', duration: 30, price: 1500, isTrial: false },
  { value: '3_months', label: '3 mois', duration: 90, price: 4500, isTrial: false },
  { value: '6_months', label: '6 mois', duration: 180, price: 9000, isTrial: false },
  { value: '12_months', label: '12 mois', duration: 365, price: 15000, isTrial: false },
]

const PAYMENT_METHODS = [
  { value: 'baridimob', label: 'BaridiMob', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'ccp', label: 'CCP', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'cash', label: 'Espèces', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'bank_transfer', label: 'Virement bancaire', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
]

const SUSPEND_REASONS = [
  'Défaut de paiement / échéance dépassée',
  'Demande du propriétaire (fermeture temporaire)',
  'Non-respect des conditions d\'utilisation (CGU)',
  'Coordonnées ou informations incomplètes',
  'Autre motif administratif'
]

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Navigation par onglets
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'logs'>('users')

  // Données principales
  const [users, setUsers] = useState<User[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [adminLogs, setAdminLogs] = useState<AdminLogRecord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  // Filtres onglet Utilisateurs
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'client' | 'professional'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Filtres onglet Abonnements / Paiements
  const [subSearch, setSubSearch] = useState('')
  const [subMethodFilter, setSubMethodFilter] = useState('all')
  const [subPlanFilter, setSubPlanFilter] = useState('all')

  // Filtres onglet Logs
  const [logSearch, setLogSearch] = useState('')
  const [logActionFilter, setLogActionFilter] = useState('all')

  // Modals et actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState<'activate' | 'suspend' | 'delete' | 'reactivate' | null>(null)
  const [historyModalUser, setHistoryModalUser] = useState<User | null>(null)
  const [historyModalTab, setHistoryModalTab] = useState<'payments' | 'logs'>('payments')
  const [suspendReason, setSuspendReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  // Formulaire d'activation
  const [activationForm, setActivationForm] = useState({
    plan: '1_month',
    amount: 1500,
    paymentMethod: 'baridimob',
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

  // Charger toutes les données
  const fetchData = async () => {
    setLoading(true)
    console.log('🔄 Chargement des données admin...')
    try {
      // 1. Récupérer les profils
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id, email, full_name, phone, user_type,
          subscription_status, subscription_ends_at, trial_ends_at, created_at
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // 2. Récupérer les établissements
      const { data: establishments } = await supabase
        .from('establishments')
        .select('id, name, city, is_active, owner_id')

      // Associer les établissements aux utilisateurs
      const usersWithEstablishments: User[] = usersData?.map(user => ({
        ...user,
        establishment: establishments?.find(e => e.owner_id === user.id)
      })) || []

      setUsers(usersWithEstablishments)

      // 3. Récupérer l'historique des abonnements / paiements
      try {
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false })

        if (!subsError && subsData) {
          const enrichedSubs: SubscriptionRecord[] = subsData.map(sub => ({
            ...sub,
            user: usersWithEstablishments.find(u => u.id === sub.user_id)
          }))
          setSubscriptions(enrichedSubs)
        }
      } catch (subErr) {
        console.warn('Note: Table subscriptions non disponible ou vide:', subErr)
      }

      // 4. Récupérer les logs d'activité admin
      try {
        const { data: logsData, error: logsError } = await supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })

        if (!logsError && logsData) {
          const enrichedLogs: AdminLogRecord[] = logsData.map(log => ({
            ...log,
            target_user: usersWithEstablishments.find(u => u.id === log.target_user_id)
          }))
          setAdminLogs(enrichedLogs)
        }
      } catch (logErr) {
        console.warn('Note: Table admin_logs non disponible ou vide:', logErr)
      }

      // 5. Calculer les statistiques globales
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

  // Activer ou renouveler un abonnement
  const handleActivateSubscription = async () => {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const plan = PLAN_OPTIONS.find(p => p.value === activationForm.plan)
      const endsAt = new Date()
      endsAt.setDate(endsAt.getDate() + (plan?.duration || 30))

      const newStatus = activationForm.plan === 'trial' ? 'trial' : 'active'
      console.log('Activation abonnement:', { userId: selectedUser.id, newStatus, endsAt: endsAt.toISOString() })

      // 1. Mettre à jour le profil
      const { data: updatedProfiles, error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: newStatus,
          subscription_ends_at: endsAt.toISOString(),
          trial_ends_at: activationForm.plan === 'trial' ? endsAt.toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)
        .select()

      if (profileError) {
        console.error('Erreur mise à jour profil:', profileError)
        throw profileError
      }

      if (!updatedProfiles || updatedProfiles.length === 0) {
        throw new Error(
          "La modification a été bloquée par la sécurité Supabase (RLS). Veuillez exécuter le script database/fix_admin_subscription_rls.sql dans l'éditeur SQL de Supabase."
        )
      }

      // 2. Activer l'établissement
      if (selectedUser.establishment) {
        await supabase
          .from('establishments')
          .update({ is_active: true })
          .eq('owner_id', selectedUser.id)
      }

      // 3. Enregistrer dans l'historique des paiements (table subscriptions)
      try {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: selectedUser.id,
            plan_type: activationForm.plan,
            amount: activationForm.plan === 'trial' ? 0 : activationForm.amount,
            currency: 'DZD',
            status: 'active',
            starts_at: new Date().toISOString(),
            ends_at: endsAt.toISOString(),
            payment_method: activationForm.plan === 'trial' ? 'gratuit' : activationForm.paymentMethod,
            payment_reference: activationForm.paymentReference.trim() || null,
            notes: activationForm.notes.trim() || null,
            created_by: session?.user.id
          })
      } catch (subErr) {
        console.warn('Insertion table subscriptions non effectuée:', subErr)
      }

      // 4. Enregistrer dans le journal d'activité (table admin_logs)
      try {
        await supabase.from('admin_logs').insert({
          admin_id: session?.user.id,
          action: 'activate_subscription',
          target_user_id: selectedUser.id,
          target_type: 'subscription',
          details: {
            plan_type: activationForm.plan,
            plan_label: plan?.label,
            amount: activationForm.plan === 'trial' ? 0 : activationForm.amount,
            payment_method: activationForm.plan === 'trial' ? 'gratuit' : activationForm.paymentMethod,
            payment_reference: activationForm.paymentReference.trim() || null,
            notes: activationForm.notes.trim() || null,
            salon_name: selectedUser.establishment?.name || 'Sans salon',
            user_email: selectedUser.email,
            user_name: selectedUser.full_name,
            ends_at: endsAt.toISOString()
          }
        })
      } catch (logErr) {
        console.warn('Insertion table admin_logs non effectuée:', logErr)
      }

      // Fermer le modal et rafraîchir
      setShowModal(null)
      setSelectedUser(null)
      await fetchData()
      
      alert(
        activationForm.plan === 'trial'
          ? '🎁 Essai gratuit de 30 jours activé avec succès !'
          : `✅ Abonnement payant (${plan?.label}) activé et enregistré dans l'historique !`
      )
    } catch (error) {
      console.error('Erreur activation:', error)
      alert('❌ Erreur lors de l\'activation: ' + (error as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  // Suspendre un utilisateur avec motif obligatoire ou recommandé
  const handleSuspendUser = async () => {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const reasonToLog = suspendReason.trim() || 'Aucun motif renseigné'

      // 1. Mettre le statut à suspended
      const { data: updated, error: suspError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)
        .select()

      if (suspError) throw suspError
      if (!updated || updated.length === 0) {
        throw new Error(
          "La modification a été bloquée par la sécurité Supabase (RLS). Veuillez exécuter le script database/fix_admin_subscription_rls.sql dans Supabase."
        )
      }

      // 2. Désactiver l'établissement du salon
      if (selectedUser.establishment) {
        await supabase
          .from('establishments')
          .update({ is_active: false })
          .eq('owner_id', selectedUser.id)
      }

      // 3. Logger l'action dans admin_logs avec le motif
      try {
        await supabase.from('admin_logs').insert({
          admin_id: session?.user.id,
          action: 'suspend_user',
          target_user_id: selectedUser.id,
          target_type: 'user',
          details: {
            reason: reasonToLog,
            salon_name: selectedUser.establishment?.name || 'Sans salon',
            user_email: selectedUser.email,
            user_name: selectedUser.full_name,
            previous_status: selectedUser.subscription_status,
            suspended_at: new Date().toISOString()
          }
        })
      } catch (logErr) {
        console.warn('Insertion table admin_logs non effectuée:', logErr)
      }

      // Mettre à jour l'abonnement en cours si besoin
      try {
        await supabase
          .from('subscriptions')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('user_id', selectedUser.id)
          .eq('status', 'active')
      } catch (e) {
        // Table optionnelle
      }

      setShowModal(null)
      setSelectedUser(null)
      setSuspendReason('')
      await fetchData()
      alert('⚠️ Salon / Utilisateur mis en suspension avec succès.')
    } catch (error) {
      console.error('Erreur suspension:', error)
      alert('❌ Erreur lors de la suspension: ' + (error as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  // Lever la suspension / Réactiver un salon
  const handleReactivateUser = async (userToReactivate: User) => {
    setActionLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Vérifier si l'abonnement est encore dans sa période de validité
      const hasValidDate = userToReactivate.subscription_ends_at && new Date(userToReactivate.subscription_ends_at) > new Date()
      const newStatus = hasValidDate ? 'active' : 'expired'

      // 1. Mettre à jour le statut du profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userToReactivate.id)

      if (profileError) throw profileError

      // 2. Réactiver l'établissement si la période est encore valide
      if (userToReactivate.establishment) {
        await supabase
          .from('establishments')
          .update({ is_active: hasValidDate })
          .eq('owner_id', userToReactivate.id)
      }

      // 3. Logger l'action dans admin_logs
      try {
        await supabase.from('admin_logs').insert({
          admin_id: session?.user.id,
          action: 'reactivate_user',
          target_user_id: userToReactivate.id,
          target_type: 'user',
          details: {
            reason: 'Levée de suspension par l\'administrateur',
            restored_status: newStatus,
            salon_name: userToReactivate.establishment?.name || 'Sans salon',
            user_email: userToReactivate.email,
            user_name: userToReactivate.full_name
          }
        })
      } catch (logErr) {
        console.warn('Log reactivate_user failed:', logErr)
      }

      setShowModal(null)
      setSelectedUser(null)
      await fetchData()
      
      if (hasValidDate) {
        alert('✅ Suspension levée ! Le salon est à nouveau actif et visible en ligne.')
      } else {
        alert('✅ Suspension levée ! L\'abonnement étant arrivé à échéance, vous pouvez maintenant cliquer sur Activer pour le renouveler.')
      }
    } catch (error) {
      console.error('Erreur réactivation:', error)
      alert('❌ Erreur: ' + (error as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  // Supprimer définitivement un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setActionLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🗑️ Suppression utilisateur:', selectedUser.email)

      // 1. Supprimer les rendez-vous liés à l'établissement
      if (selectedUser.establishment) {
        await supabase
          .from('appointments')
          .delete()
          .eq('establishment_id', selectedUser.establishment.id)
        
        await supabase
          .from('services')
          .delete()
          .eq('establishment_id', selectedUser.establishment.id)
        
        await supabase
          .from('transactions')
          .delete()
          .eq('establishment_id', selectedUser.establishment.id)
        
        await supabase
          .from('establishments')
          .delete()
          .eq('id', selectedUser.establishment.id)
      }

      // 2. Supprimer les abonnements
      try {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', selectedUser.id)
      } catch (e) {
        // Table optionnelle
      }

      // 3. Logger la suppression
      try {
        await supabase.from('admin_logs').insert({
          admin_id: session?.user.id,
          action: 'delete_user',
          target_user_id: null,
          target_type: 'user',
          details: {
            deleted_user_id: selectedUser.id,
            salon_name: selectedUser.establishment?.name || 'Sans salon',
            user_email: selectedUser.email,
            user_name: selectedUser.full_name
          }
        })
      } catch (e) {
        // Table optionnelle
      }

      // 4. Supprimer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id)

      if (profileError) throw profileError

      const deletedUserId = selectedUser.id
      setShowModal(null)
      setSelectedUser(null)
      setUsers(prev => prev.filter(u => u.id !== deletedUserId))
      
      alert('✅ Utilisateur et toutes ses données supprimés avec succès !')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression: ' + (error as Error).message)
    } finally {
      setActionLoading(false)
    }
  }

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Badges d'état
  const getStatusBadge = (status: string | null | undefined) => {
    const normalizedStatus = status || 'pending'
    const badges: Record<string, { color: string, icon: any, label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: Clock, label: 'En attente' },
      trial: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: Clock, label: 'Essai gratuit' },
      active: { color: 'bg-green-100 text-green-800 border border-green-200', icon: Check, label: 'Actif' },
      suspended: { color: 'bg-red-100 text-red-800 border border-red-200', icon: Pause, label: 'Suspendu' },
      expired: { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: AlertTriangle, label: 'Expiré' },
    }
    const badge = badges[normalizedStatus] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    )
  }

  // Badges de méthode de paiement
  const getPaymentMethodBadge = (method: string | null | undefined) => {
    if (!method) return <span className="text-gray-400 text-xs">—</span>
    if (method === 'gratuit') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          🎁 Gratuit
        </span>
      )
    }
    const found = PAYMENT_METHODS.find(m => m.value === method)
    if (found) {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${found.badgeColor}`}>
          <CreditCard className="w-3 h-3" />
          {found.label}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {method}
      </span>
    )
  }

  // Badges de formule
  const getPlanBadge = (planType: string | null | undefined) => {
    if (!planType) return <span className="text-gray-400 text-xs">—</span>
    if (planType === 'trial') {
      return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">🎁 Essai 30j</span>
    }
    const plan = PLAN_OPTIONS.find(p => p.value === planType)
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-nude-50 text-nude-700 border border-nude-200">
        {plan?.label || planType}
      </span>
    )
  }

  // Badges des actions admin
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'activate_subscription':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            Activation / Renouvellement
          </span>
        )
      case 'suspend_user':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <Pause className="w-3.5 h-3.5 text-red-600" />
            Mise en suspension
          </span>
        )
      case 'reactivate_user':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            Levée de suspension
          </span>
        )
      case 'delete_user':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
            <Trash2 className="w-3.5 h-3.5 text-gray-600" />
            Suppression
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <Activity className="w-3.5 h-3.5 text-gray-500" />
            {action}
          </span>
        )
    }
  }

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.includes(q) ||
        user.establishment?.name?.toLowerCase().includes(q) ||
        user.establishment?.city?.toLowerCase().includes(q)

      const matchesType = filterType === 'all' || user.user_type === filterType
      const matchesStatus = filterStatus === 'all' || user.subscription_status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [users, searchQuery, filterType, filterStatus])

  // Filtrage des paiements / abonnements
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const q = subSearch.toLowerCase()
      const matchesSearch = 
        !q ||
        sub.user?.full_name?.toLowerCase().includes(q) ||
        sub.user?.email?.toLowerCase().includes(q) ||
        sub.user?.establishment?.name?.toLowerCase().includes(q) ||
        sub.payment_reference?.toLowerCase().includes(q) ||
        sub.notes?.toLowerCase().includes(q)

      const matchesMethod = subMethodFilter === 'all' || sub.payment_method === subMethodFilter
      const matchesPlan = subPlanFilter === 'all' || sub.plan_type === subPlanFilter

      return matchesSearch && matchesMethod && matchesPlan
    })
  }, [subscriptions, subSearch, subMethodFilter, subPlanFilter])

  // Filtrage des logs
  const filteredLogs = useMemo(() => {
    return adminLogs.filter(log => {
      const q = logSearch.toLowerCase()
      const detailsStr = JSON.stringify(log.details || {}).toLowerCase()
      const matchesSearch = 
        !q ||
        log.target_user?.full_name?.toLowerCase().includes(q) ||
        log.target_user?.email?.toLowerCase().includes(q) ||
        log.target_user?.establishment?.name?.toLowerCase().includes(q) ||
        detailsStr.includes(q)

      const matchesAction = logActionFilter === 'all' || log.action === logActionFilter

      return matchesSearch && matchesAction
    })
  }, [adminLogs, logSearch, logActionFilter])

  // Statistiques financières calculées
  const financialStats = useMemo(() => {
    const totalRevenue = subscriptions
      .filter(s => s.plan_type !== 'trial')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

    const paidCount = subscriptions.filter(s => s.plan_type !== 'trial').length
    const trialCount = subscriptions.filter(s => s.plan_type === 'trial').length
    const baridimobCount = subscriptions.filter(s => s.payment_method === 'baridimob').length
    const ccpCount = subscriptions.filter(s => s.payment_method === 'ccp').length
    const cashCount = subscriptions.filter(s => s.payment_method === 'cash').length

    return { totalRevenue, paidCount, trialCount, baridimobCount, ccpCount, cashCount }
  }, [subscriptions])

  // Logs stats
  const logStats = useMemo(() => {
    const total = adminLogs.length
    const activations = adminLogs.filter(l => l.action === 'activate_subscription').length
    const suspensions = adminLogs.filter(l => l.action === 'suspend_user').length
    const reactivations = adminLogs.filter(l => l.action === 'reactivate_user').length
    return { total, activations, suspensions, reactivations }
  }, [adminLogs])

  // Historique filtré pour le modal salon
  const salonHistory = useMemo(() => {
    if (!historyModalUser) return { subs: [], logs: [] }
    const subs = subscriptions.filter(s => s.user_id === historyModalUser.id)
    const logs = adminLogs.filter(l => l.target_user_id === historyModalUser.id)
    return { subs, logs }
  }, [historyModalUser, subscriptions, adminLogs])

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement du panneau d'administration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Admin Kalendo</h1>
                <p className="text-xs text-gray-500 font-medium">Gestion Salons • Abonnements • Journal d'Audit</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={fetchData}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-nude-700 hover:bg-nude-50 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm"
                title="Actualiser les données"
              >
                <RefreshCw className="w-4 h-4 text-nude-600" />
                <span className="hidden sm:inline font-medium">Actualiser</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation principale par onglets */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6 bg-white rounded-xl shadow-sm px-2 pt-2 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-nude-600 text-nude-700 bg-nude-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilisateurs & Salons</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Historique des Paiements</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {subscriptions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-800 bg-blue-50/40 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Journal d'activité (Logs)</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
              {adminLogs.length}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* ONGLET 1 : UTILISATEURS & SALONS                               */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div>
            {/* Stats Cards Utilisateurs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.total_clients || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Clients inscrits</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-nude-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-nude-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.total_professionals || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Professionnels (Salons)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-700">{stats?.pending_pros || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">En attente d'activation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">{stats?.active_pros || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Salons actifs payants</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-red-700">{stats?.suspended_pros || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Salons suspendus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtres de recherche */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email, téléphone ou nom de salon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 focus:ring-2 focus:ring-nude-100"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 bg-white"
                  >
                    <option value="all">Tous les types</option>
                    <option value="client">Clients</option>
                    <option value="professional">Professionnels</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 bg-white"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="trial">Essai (30j)</option>
                    <option value="active">Actif</option>
                    <option value="suspended">Suspendu</option>
                    <option value="expired">Expiré</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tableau des utilisateurs & Salons */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Utilisateur / Contact</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Établissement</th>
                      <th className="px-4 py-3">Statut actuel</th>
                      <th className="px-4 py-3">Fin abonnement</th>
                      <th className="px-4 py-3">Inscrit le</th>
                      <th className="px-4 py-3 text-right">Actions rapides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{user.full_name || 'Sans nom'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {user.phone && <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            user.user_type === 'professional' 
                              ? 'bg-nude-100 text-nude-800 border border-nude-200' 
                              : user.user_type === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.user_type === 'professional' ? 'Pro' : user.user_type === 'admin' ? 'Admin' : 'Client'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.establishment ? (
                            <div>
                              <p className="font-medium text-gray-900 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-nude-600" />
                                {user.establishment.name}
                              </p>
                              <p className="text-xs text-gray-500">{user.establishment.city}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Aucun salon</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.user_type === 'professional' ? getStatusBadge(user.subscription_status) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.subscription_ends_at ? (
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {new Date(user.subscription_ends_at).toLocaleDateString('fr-FR')}
                              </p>
                              {new Date(user.subscription_ends_at) < new Date() && (
                                <p className="text-xs text-red-500 font-semibold">Expiré</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {user.user_type === 'professional' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Bouton Fiche Historique */}
                              <button
                                onClick={() => {
                                  setHistoryModalUser(user)
                                  setHistoryModalTab('payments')
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-nude-700 bg-nude-50 hover:bg-nude-100 border border-nude-200 rounded-lg transition-colors"
                                title="Voir l'historique complet des paiements et actions de ce salon"
                              >
                                <History className="w-3.5 h-3.5 text-nude-600" />
                                <span>Historique</span>
                              </button>

                              {/* Si suspendu : bouton lever la suspension */}
                              {user.subscription_status === 'suspended' ? (
                                <button
                                  onClick={() => handleReactivateUser(user)}
                                  disabled={actionLoading}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                                  title="Lever la suspension et réactiver"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Réactiver</span>
                                </button>
                              ) : (
                                <>
                                  {/* Bouton Activer / Renouveler */}
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setActivationForm({
                                        plan: '1_month',
                                        amount: 1500,
                                        paymentMethod: 'baridimob',
                                        paymentReference: '',
                                        notes: ''
                                      })
                                      setShowModal('activate')
                                    }}
                                    className="p-1.5 text-green-700 hover:bg-green-50 border border-transparent hover:border-green-200 rounded-lg transition-colors"
                                    title="Activer ou renouveler l'abonnement"
                                  >
                                    <Play className="w-4 h-4 fill-green-600 text-green-600" />
                                  </button>

                                  {/* Bouton Suspendre */}
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user)
                                      setSuspendReason('')
                                      setShowModal('suspend')
                                    }}
                                    className="p-1.5 text-yellow-700 hover:bg-yellow-50 border border-transparent hover:border-yellow-200 rounded-lg transition-colors"
                                    title="Mettre en suspension"
                                  >
                                    <Pause className="w-4 h-4 fill-yellow-600 text-yellow-600" />
                                  </button>
                                </>
                              )}

                              {/* Bouton Supprimer */}
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowModal('delete')
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowModal('delete')
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer ce client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun utilisateur ne correspond à votre recherche</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ONGLET 2 : HISTORIQUE DES PAIEMENTS & ABONNEMENTS              */}
        {/* ============================================================== */}
        {activeTab === 'subscriptions' && (
          <div>
            {/* KPI Financiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">Total des encaissements</p>
                    <p className="text-2xl sm:text-3xl font-extrabold mt-1">
                      {financialStats.totalRevenue.toLocaleString()} <span className="text-lg font-medium">DA</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-emerald-100 mt-2 font-medium">
                  {financialStats.paidCount} paiement(s) payant(s) enregistré(s)
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Abonnements payants</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{financialStats.paidCount}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">1 mois (1 500 DA) ou packs multi-mois</p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Essais 30j accordés</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{financialStats.trialCount}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Périodes d'essai gratuites activées</p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Canaux de paiement</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-800 font-semibold">BaridiMob:</span>
                    <span className="font-bold text-gray-900">{financialStats.baridimobCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-semibold">CCP:</span>
                    <span className="font-bold text-gray-900">{financialStats.ccpCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-semibold">Espèces:</span>
                    <span className="font-bold text-gray-900">{financialStats.cashCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtres abonnements */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par salon, email, référence transaction ou notes..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 focus:ring-2 focus:ring-nude-100"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={subMethodFilter}
                    onChange={(e) => setSubMethodFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 bg-white"
                  >
                    <option value="all">Tous les paiements</option>
                    <option value="baridimob">BaridiMob</option>
                    <option value="ccp">CCP</option>
                    <option value="cash">Espèces</option>
                    <option value="bank_transfer">Virement</option>
                    <option value="gratuit">Essai Gratuit</option>
                  </select>

                  <select
                    value={subPlanFilter}
                    onChange={(e) => setSubPlanFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 bg-white"
                  >
                    <option value="all">Toutes les formules</option>
                    <option value="1_month">1 mois (1 500 DA)</option>
                    <option value="3_months">3 mois (4 500 DA)</option>
                    <option value="6_months">6 mois (9 000 DA)</option>
                    <option value="12_months">12 mois (15 000 DA)</option>
                    <option value="trial">Essai gratuit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tableau Historique des Paiements */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Date paiement</th>
                      <th className="px-4 py-3">Salon & Propriétaire</th>
                      <th className="px-4 py-3">Formule</th>
                      <th className="px-4 py-3">Montant encaissé</th>
                      <th className="px-4 py-3">Mode de paiement</th>
                      <th className="px-4 py-3">Réf / Reçu</th>
                      <th className="px-4 py-3">Période de validité</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Fiche Salon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                          {new Date(sub.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-900">
                              {sub.user?.establishment?.name || 'Salon sans nom'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {sub.user?.full_name} • {sub.user?.email}
                            </p>
                            {sub.user?.phone && (
                              <p className="text-xs text-gray-400 mt-0.5">{sub.user.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getPlanBadge(sub.plan_type)}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-emerald-700">
                          {Number(sub.amount) > 0 ? (
                            <span>{Number(sub.amount).toLocaleString()} DA</span>
                          ) : (
                            <span className="text-blue-600 font-semibold">0 DA (Gratuit)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getPaymentMethodBadge(sub.payment_method)}
                        </td>
                        <td className="px-4 py-3">
                          {sub.payment_reference ? (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-mono font-medium">
                              {sub.payment_reference}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <span>Du {new Date(sub.starts_at).toLocaleDateString('fr-FR')}</span>
                          <span className="block text-gray-400">Au {new Date(sub.ends_at).toLocaleDateString('fr-FR')}</span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {sub.user && (
                            <button
                              onClick={() => {
                                setHistoryModalUser(sub.user!)
                                setHistoryModalTab('payments')
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-nude-700 bg-nude-50 hover:bg-nude-100 rounded-lg transition-colors border border-nude-200"
                            >
                              <Eye className="w-3.5 h-3.5 text-nude-600" />
                              <span>Fiche</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSubscriptions.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun paiement trouvé</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Les activations et renouvellements effectués apparaîtront automatiquement ici.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ONGLET 3 : JOURNAL D'ACTIVITÉ & AUDIT (LOGS)                    */}
        {/* ============================================================== */}
        {activeTab === 'logs' && (
          <div>
            {/* KPI Logs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{logStats.total}</p>
                    <p className="text-xs text-gray-500 font-medium">Actions enregistrées</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{logStats.activations}</p>
                    <p className="text-xs text-gray-500 font-medium">Activations / Renouvellements</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Pause className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-700">{logStats.suspensions}</p>
                    <p className="text-xs text-gray-500 font-medium">Mises en suspension</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-700">{logStats.reactivations}</p>
                    <p className="text-xs text-gray-500 font-medium">Levées de suspension</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtres logs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par utilisateur, salon, motif ou action..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 focus:ring-2 focus:ring-nude-100"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={logActionFilter}
                    onChange={(e) => setLogActionFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400 bg-white"
                  >
                    <option value="all">Toutes les actions</option>
                    <option value="activate_subscription">Activations / Renouvellements</option>
                    <option value="suspend_user">Mises en suspension</option>
                    <option value="reactivate_user">Levées de suspension</option>
                    <option value="delete_user">Suppressions</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tableau journal d'activité */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Date & Heure</th>
                      <th className="px-4 py-3">Action effectuée</th>
                      <th className="px-4 py-3">Salon / Utilisateur ciblé</th>
                      <th className="px-4 py-3">Détails & Motif</th>
                      <th className="px-4 py-3 text-right">Fiche Salon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredLogs.map((log) => {
                      const details = log.details || {}
                      const salonName = details.salon_name || log.target_user?.establishment?.name
                      const userEmail = details.user_email || log.target_user?.email
                      const userName = details.user_name || log.target_user?.full_name

                      return (
                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap font-medium">
                            {new Date(log.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            {getActionBadge(log.action)}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              {salonName && (
                                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                  <Building className="w-3.5 h-3.5 text-nude-600" />
                                  {salonName}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {userName ? `${userName} • ` : ''}{userEmail || '—'}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {log.action === 'activate_subscription' && (
                              <div className="text-xs space-y-0.5">
                                <span className="font-semibold text-gray-800">
                                  {details.plan_label || details.plan_type || 'Abonnement'}
                                </span>
                                {details.amount !== undefined && (
                                  <span className="text-emerald-700 font-bold ml-1.5">
                                    • {Number(details.amount).toLocaleString()} DA
                                  </span>
                                )}
                                {details.payment_method && (
                                  <span className="text-gray-500 ml-1.5">
                                    via {details.payment_method}
                                  </span>
                                )}
                                {details.payment_reference && (
                                  <span className="text-gray-400 font-mono ml-1.5">
                                    (Réf: {details.payment_reference})
                                  </span>
                                )}
                                {details.notes && (
                                  <p className="text-gray-500 italic mt-0.5">Note: "{details.notes}"</p>
                                )}
                              </div>
                            )}

                            {log.action === 'suspend_user' && (
                              <div className="text-xs">
                                <span className="font-semibold text-red-700">Motif de suspension :</span>{' '}
                                <span className="text-gray-700 font-medium">
                                  {details.reason || 'Non spécifié'}
                                </span>
                              </div>
                            )}

                            {log.action === 'reactivate_user' && (
                              <div className="text-xs">
                                <span className="font-semibold text-blue-700">Rétablissement :</span>{' '}
                                <span className="text-gray-700">
                                  {details.reason || 'Levée de la suspension'}
                                </span>
                              </div>
                            )}

                            {log.action === 'delete_user' && (
                              <div className="text-xs text-gray-500">
                                Suppression définitive de l'utilisateur et de son salon
                              </div>
                            )}

                            {!['activate_subscription', 'suspend_user', 'reactivate_user', 'delete_user'].includes(log.action) && (
                              <div className="text-xs text-gray-600 font-mono">
                                {JSON.stringify(details)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {log.target_user && (
                              <button
                                onClick={() => {
                                  setHistoryModalUser(log.target_user!)
                                  setHistoryModalTab('logs')
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-nude-700 bg-nude-50 hover:bg-nude-100 rounded-lg transition-colors border border-nude-200"
                              >
                                <History className="w-3.5 h-3.5 text-nude-600" />
                                <span>Historique</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun événement enregistré</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Toutes les activations, suspensions et réactivations s'inscriront ici pour l'audit.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1 : FICHE HISTORIQUE D'UN SALON                          */}
      {/* ============================================================== */}
      {historyModalUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header du modal salon */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {historyModalUser.establishment?.name || historyModalUser.full_name}
                  </h2>
                  {getStatusBadge(historyModalUser.subscription_status)}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                    {historyModalUser.full_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {historyModalUser.email}
                  </span>
                  {historyModalUser.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {historyModalUser.phone}
                    </span>
                  )}
                  {historyModalUser.establishment?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {historyModalUser.establishment.city}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setHistoryModalUser(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sous-onglets dans la fiche historique */}
            <div className="flex border-b border-gray-200 mt-4 gap-4">
              <button
                onClick={() => setHistoryModalTab('payments')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  historyModalTab === 'payments'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Paiements & Abonnements ({salonHistory.subs.length})</span>
              </button>

              <button
                onClick={() => setHistoryModalTab('logs')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                  historyModalTab === 'logs'
                    ? 'border-blue-600 text-blue-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Journal d'activité & Suspensions ({salonHistory.logs.length})</span>
              </button>
            </div>

            {/* Corps défilable */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {historyModalTab === 'payments' ? (
                <div>
                  {salonHistory.subs.length > 0 ? (
                    <div className="space-y-3">
                      {salonHistory.subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getPlanBadge(sub.plan_type)}
                              {getPaymentMethodBadge(sub.payment_method)}
                              {getStatusBadge(sub.status)}
                            </div>
                            <span className="text-base font-extrabold text-emerald-700">
                              {Number(sub.amount) > 0 ? `${Number(sub.amount).toLocaleString()} DA` : '0 DA (Gratuit)'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200/60">
                            <div>
                              <span className="text-gray-400 block">Date d'enregistrement</span>
                              <span className="font-medium text-gray-800">
                                {new Date(sub.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-400 block">Période couverte</span>
                              <span className="font-medium text-gray-800">
                                Du {new Date(sub.starts_at).toLocaleDateString('fr-FR')} au {new Date(sub.ends_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-400 block">Référence paiement</span>
                              <span className="font-mono font-medium text-gray-800">
                                {sub.payment_reference || 'Aucune référence'}
                              </span>
                            </div>
                          </div>

                          {sub.notes && (
                            <div className="mt-2 text-xs text-gray-500 italic bg-white p-2 rounded border border-gray-100">
                              Note: {sub.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Aucun paiement archivé pour ce salon</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cliquez sur "Activer / Renouveler" pour ajouter un paiement ou un essai.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {salonHistory.logs.length > 0 ? (
                    <div className="space-y-3">
                      {salonHistory.logs.map((log) => {
                        const details = log.details || {}
                        return (
                          <div
                            key={log.id}
                            className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getActionBadge(log.action)}
                              </div>
                              <span className="text-xs text-gray-500 font-medium">
                                {new Date(log.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div className="mt-2 text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-100">
                              {log.action === 'suspend_user' && (
                                <p>
                                  <strong className="text-red-700">Motif de suspension :</strong>{' '}
                                  {details.reason || 'Non spécifié'}
                                </p>
                              )}
                              {log.action === 'activate_subscription' && (
                                <p>
                                  <strong className="text-green-700">Activation formule :</strong>{' '}
                                  {details.plan_label || details.plan_type} • {Number(details.amount || 0).toLocaleString()} DA ({details.payment_method})
                                </p>
                              )}
                              {log.action === 'reactivate_user' && (
                                <p>
                                  <strong className="text-blue-700">Levée de la suspension :</strong>{' '}
                                  {details.reason || 'Restauré'}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Aucun événement loggé pour ce salon</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pied du modal avec actions directes */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-2">
              <button
                onClick={() => setHistoryModalUser(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Fermer
              </button>

              <div className="flex gap-2">
                {historyModalUser.subscription_status === 'suspended' ? (
                  <button
                    onClick={() => {
                      handleReactivateUser(historyModalUser)
                      setHistoryModalUser(null)
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Lever la suspension</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const user = historyModalUser
                      setHistoryModalUser(null)
                      setSelectedUser(user)
                      setSuspendReason('')
                      setShowModal('suspend')
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Suspendre</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const user = historyModalUser
                    setHistoryModalUser(null)
                    setSelectedUser(user)
                    setActivationForm({
                      plan: '1_month',
                      amount: 1500,
                      paymentMethod: 'baridimob',
                      paymentReference: '',
                      notes: ''
                    })
                    setShowModal('activate')
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Activer / Renouveler</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2 : ACTIVATION / RENOUVELLEMENT D'ABONNEMENT             */}
      {/* ============================================================== */}
      {showModal === 'activate' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Activer / Renouveler l'abonnement</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  <strong>{selectedUser.establishment?.name || selectedUser.full_name}</strong> • {selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setShowModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statut actuel */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Statut actuel du salon :</span>
              {getStatusBadge(selectedUser.subscription_status)}
            </div>

            <div className="space-y-4">
              {/* Choix : Essai ou Payant */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Formule d'activation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActivationForm({ ...activationForm, plan: 'trial', amount: 0 })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      activationForm.plan === 'trial'
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-blue-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Essai gratuit</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">30 jours offerts</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const plan = PLAN_OPTIONS.find(p => p.value === '1_month')
                      setActivationForm({ ...activationForm, plan: '1_month', amount: plan?.price || 1500 })
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      activationForm.plan !== 'trial'
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Abonnement payant</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">1 500 DA / mois</div>
                  </button>
                </div>
              </div>

              {/* Si formule payante */}
              {activationForm.plan !== 'trial' && (
                <>
                  {/* Durée */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Durée de validité
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLAN_OPTIONS.filter(p => !p.isTrial).map(plan => (
                        <button
                          key={plan.value}
                          type="button"
                          onClick={() => setActivationForm({ ...activationForm, plan: plan.value, amount: plan.price })}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            activationForm.plan === plan.value
                              ? 'border-nude-600 bg-nude-50/80 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-bold text-gray-900 text-sm">{plan.label}</div>
                          <div className="text-xs text-nude-700 font-extrabold mt-0.5">
                            {plan.price.toLocaleString()} DA
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Montant encaissé */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Montant reçu (DA)
                    </label>
                    <input
                      type="number"
                      value={activationForm.amount}
                      onChange={(e) => setActivationForm({ ...activationForm, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-nude-400"
                    />
                  </div>

                  {/* Mode de paiement */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                      Mode de paiement
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map(method => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setActivationForm({ ...activationForm, paymentMethod: method.value })}
                          className={`p-2.5 rounded-lg border-2 text-xs font-bold transition-all ${
                            activationForm.paymentMethod === method.value
                              ? 'border-nude-600 bg-nude-50 text-nude-800 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Référence */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Référence transaction (reçu, code BaridiMob, virement...)
                    </label>
                    <input
                      type="text"
                      value={activationForm.paymentReference}
                      onChange={(e) => setActivationForm({ ...activationForm, paymentReference: e.target.value })}
                      placeholder="Ex: BM-20261014-9842"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-nude-400"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Remarques ou notes admin (optionnel)
                </label>
                <textarea
                  value={activationForm.notes}
                  onChange={(e) => setActivationForm({ ...activationForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Informations supplémentaires sur le paiement..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-nude-400"
                />
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan choisi :</span>
                <span className="font-bold text-gray-900">
                  {PLAN_OPTIONS.find(p => p.value === activationForm.plan)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nouveau statut :</span>
                <span className={`font-bold ${activationForm.plan === 'trial' ? 'text-blue-600' : 'text-emerald-700'}`}>
                  {activationForm.plan === 'trial' ? 'Essai gratuit (30 jours)' : 'Actif'}
                </span>
              </div>
              {activationForm.plan !== 'trial' && (
                <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-gray-200/80">
                  <span className="text-gray-700">Montant total :</span>
                  <span className="text-emerald-700">{activationForm.amount.toLocaleString()} DA</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm text-gray-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleActivateSubscription}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 ${
                  activationForm.plan === 'trial'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionLoading ? 'Enregistrement...' : activationForm.plan === 'trial' ? '🎁 Valider l\'essai' : '✓ Enregistrer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3 : SUSPENSION AVEC MOTIF                                */}
      {/* ============================================================== */}
      {showModal === 'suspend' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Pause className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Mettre le salon en suspension ?</h2>
              <p className="text-xs text-gray-600 mt-1">
                Le salon <strong>{selectedUser.establishment?.name || selectedUser.full_name}</strong> sera masqué des recherches et les prises de rendez-vous seront bloquées.
              </p>
            </div>

            {/* Choix rapide de motifs */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Motif de la mise en suspens
              </label>
              <div className="space-y-1.5 mb-2">
                {SUSPEND_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSuspendReason(reason)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      suspendReason === reason
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    • {reason}
                  </button>
                ))}
              </div>

              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Renseignez ou complétez le motif précis de la suspension..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Ce motif sera consigné dans le journal d'activité admin.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSuspendUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Suspension...' : 'Confirmer la suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4 : SUPPRESSION DÉFINITIVE                               */}
      {/* ============================================================== */}
      {showModal === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-red-600">Supprimer définitivement ?</h2>
              <p className="text-xs text-gray-600 mt-1">
                Cette action est <strong>irréversible</strong>. Toutes les données du compte de{' '}
                <strong>{selectedUser.full_name}</strong> (rendez-vous, prestations, abonnements) seront supprimées.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
