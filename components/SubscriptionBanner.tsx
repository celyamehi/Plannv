'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Clock, CheckCircle, AlertTriangle, XCircle, Calendar, Phone, Mail, Gift } from 'lucide-react'

interface SubscriptionInfo {
  status: 'pending' | 'trial' | 'active' | 'suspended' | 'expired'
  endsAt: Date | null
  trialEndsAt: Date | null
  daysRemaining: number
}

export default function SubscriptionBanner() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔍 SubscriptionBanner - Session:', session?.user?.email)
      
      if (!session) {
        console.log('❌ SubscriptionBanner - Pas de session')
        setLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_ends_at, trial_ends_at, user_type')
        .eq('id', session.user.id)
        .single()

      console.log('🔍 SubscriptionBanner - Profil:', profile)
      console.log('🔍 SubscriptionBanner - Erreur:', error)

      if (profile) {
        // Ne pas afficher pour les clients ou admins
        if (profile.user_type !== 'professional') {
          console.log('ℹ️ SubscriptionBanner - Pas un professionnel, masquer')
          setLoading(false)
          return
        }

        const endsAt = profile.subscription_ends_at ? new Date(profile.subscription_ends_at) : null
        const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
        
        let daysRemaining = 0
        if (endsAt) {
          const now = new Date()
          const diffTime = endsAt.getTime() - now.getTime()
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        console.log('✅ SubscriptionBanner - Statut:', profile.subscription_status, 'Jours restants:', daysRemaining)

        setSubscription({
          status: profile.subscription_status || 'pending',
          endsAt,
          trialEndsAt,
          daysRemaining
        })
      }
    } catch (error) {
      console.error('Erreur chargement abonnement:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  if (!subscription) return null

  // Configuration selon le statut
  const statusConfig = {
    trial: {
      bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: Gift,
      title: 'Période d\'essai gratuite',
      showDays: true,
    },
    active: {
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: CheckCircle,
      title: 'Abonnement actif',
      showDays: true,
    },
    pending: {
      bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      icon: Clock,
      title: 'Compte en attente d\'activation',
      showDays: false,
    },
    suspended: {
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: XCircle,
      title: 'Compte suspendu',
      showDays: false,
    },
    expired: {
      bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
      icon: AlertTriangle,
      title: 'Abonnement expiré',
      showDays: false,
    },
  }

  const config = statusConfig[subscription.status] || statusConfig.pending
  const Icon = config.icon

  // Formater la date
  const formatDate = (date: Date | null) => {
    if (!date) return '—'
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className={`${config.bgColor} rounded-2xl p-6 text-white shadow-lg mb-6`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Statut principal */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{config.title}</h3>
            
            {/* Message selon le statut */}
            {subscription.status === 'trial' && (
              <p className="text-white/90 mt-1">
                Profitez de toutes les fonctionnalités gratuitement pendant votre période d'essai.
              </p>
            )}
            {subscription.status === 'active' && (
              <p className="text-white/90 mt-1">
                Votre abonnement est actif. Continuez à développer votre activité !
              </p>
            )}
            {subscription.status === 'pending' && (
              <p className="text-white/90 mt-1">
                Contactez-nous pour activer votre période d'essai gratuite de 30 jours.
              </p>
            )}
            {subscription.status === 'suspended' && (
              <p className="text-white/90 mt-1">
                Votre compte a été suspendu. Contactez-nous pour plus d'informations.
              </p>
            )}
            {subscription.status === 'expired' && (
              <p className="text-white/90 mt-1">
                Votre abonnement a expiré. Renouvelez pour continuer à utiliser Kalendo.
              </p>
            )}
          </div>
        </div>

        {/* Compteur de jours / Date d'expiration */}
        {config.showDays && subscription.endsAt && (
          <div className="flex items-center gap-6">
            {/* Jours restants */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${subscription.daysRemaining <= 3 ? 'text-yellow-300' : ''}`}>
                {subscription.daysRemaining > 0 ? subscription.daysRemaining : 0}
              </div>
              <div className="text-sm text-white/80">
                jour{subscription.daysRemaining > 1 ? 's' : ''} restant{subscription.daysRemaining > 1 ? 's' : ''}
              </div>
            </div>

            {/* Séparateur */}
            <div className="h-12 w-px bg-white/30 hidden md:block"></div>

            {/* Date d'expiration */}
            <div className="text-center hidden md:block">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Expire le</span>
              </div>
              <div className="font-semibold">
                {formatDate(subscription.endsAt)}
              </div>
            </div>
          </div>
        )}

        {/* Bouton contact pour les statuts problématiques */}
        {(subscription.status === 'pending' || subscription.status === 'expired' || subscription.status === 'suspended') && (
          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/213776393135?text=Bonjour%2C%20je%20vous%20contacte%20concernant%20mon%20abonnement%20Kalendo%20Pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-medium transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:contact@kalendo.space"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              <Mail className="w-4 h-4" />
              contact@kalendo.space
            </a>
          </div>
        )}
      </div>

      {/* Alerte si proche de l'expiration */}
      {config.showDays && subscription.daysRemaining > 0 && subscription.daysRemaining <= 3 && (
        <div className="mt-4 p-3 bg-yellow-400/20 rounded-lg border border-yellow-300/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-300" />
            <span className="font-medium">
              Attention ! Votre {subscription.status === 'trial' ? 'période d\'essai' : 'abonnement'} expire bientôt.
            </span>
          </div>
          <p className="text-sm text-white/80 mt-1 ml-7">
            Contactez-nous pour renouveler et continuer à utiliser Kalendo sans interruption.
          </p>
        </div>
      )}

      {/* Tarifs pour les statuts qui en ont besoin */}
      {(subscription.status === 'trial' || subscription.status === 'expired' || subscription.status === 'pending') && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm text-white/80 mb-2">Nos offres d'abonnement :</p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">1 mois : 5 000 DA</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">3 mois : 12 000 DA</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">6 mois : 20 000 DA</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium bg-white/30">12 mois : 35 000 DA</span>
          </div>
        </div>
      )}
    </div>
  )
}
