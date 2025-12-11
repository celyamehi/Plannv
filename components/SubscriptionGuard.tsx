'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AlertTriangle, Clock, Phone, Mail, RefreshCw } from 'lucide-react'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('pending')
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<Date | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, user_type, subscription_status, subscription_ends_at, trial_ends_at')
        .eq('id', session.user.id)
        .single()

      if (error || !profile) {
        router.push('/login')
        return
      }

      // Si c'est un admin, toujours accès
      if (profile.user_type === 'admin') {
        setHasAccess(true)
        setLoading(false)
        return
      }

      // Si ce n'est pas un professionnel, rediriger
      if (profile.user_type !== 'professional') {
        router.push('/client/dashboard')
        return
      }

      setUserName(profile.full_name || '')
      setSubscriptionStatus(profile.subscription_status || 'pending')

      const endsAt = profile.subscription_ends_at ? new Date(profile.subscription_ends_at) : null
      setSubscriptionEndsAt(endsAt)

      if (endsAt) {
        const now = new Date()
        const diffTime = endsAt.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setDaysRemaining(diffDays)
      }

      // Vérifier l'accès
      const status = profile.subscription_status
      const isExpired = subscriptionEndsAt && new Date() > subscriptionEndsAt

      if (status === 'active' || status === 'trial') {
        if (endsAt && new Date() > endsAt) {
          // Abonnement expiré, mettre à jour le statut
          await supabase
            .from('profiles')
            .update({ subscription_status: 'expired' })
            .eq('id', session.user.id)
          setSubscriptionStatus('expired')
          setHasAccess(false)
        } else {
          setHasAccess(true)
        }
      } else {
        setHasAccess(false)
      }

    } catch (error) {
      console.error('Erreur vérification abonnement:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-nude-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre abonnement...</p>
        </div>
      </div>
    )
  }

  // Si accès autorisé, afficher le contenu
  if (hasAccess) {
    return (
      <>
        {/* Bannière d'avertissement si proche de l'expiration */}
        {daysRemaining > 0 && daysRemaining <= 7 && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  Votre abonnement expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                </span>
              </div>
              <a 
                href="tel:+213555123456" 
                className="text-yellow-800 font-medium hover:underline flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                Renouveler
              </a>
            </div>
          </div>
        )}
        {children}
      </>
    )
  }

  // Page de blocage
  return (
    <div className="min-h-screen bg-gradient-to-br from-nude-50 to-warm-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {subscriptionStatus === 'pending' ? (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Compte en attente d'activation
            </h1>
            <p className="text-gray-600 mb-6">
              Bonjour <strong>{userName}</strong>,<br /><br />
              Votre compte professionnel est en attente d'activation. 
              Contactez-nous pour activer votre <strong>essai gratuit de 30 jours</strong> 
              ou souscrire à un abonnement.
            </p>
          </>
        ) : subscriptionStatus === 'expired' ? (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Abonnement expiré
            </h1>
            <p className="text-gray-600 mb-6">
              Bonjour <strong>{userName}</strong>,<br /><br />
              Votre abonnement a expiré le{' '}
              <strong>{subscriptionEndsAt?.toLocaleDateString('fr-FR')}</strong>.
              Renouvelez votre abonnement pour continuer à utiliser Kalendo.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Compte suspendu
            </h1>
            <p className="text-gray-600 mb-6">
              Bonjour <strong>{userName}</strong>,<br /><br />
              Votre compte a été suspendu. Contactez-nous pour plus d'informations.
            </p>
          </>
        )}

        {/* Tarifs */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Nos offres</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Essai gratuit</span>
              <span className="font-medium text-green-600">30 jours GRATUIT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">1 mois</span>
              <span className="font-medium">5 000 DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">3 mois</span>
              <span className="font-medium">12 000 DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">6 mois</span>
              <span className="font-medium">20 000 DA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">12 mois</span>
              <span className="font-medium">35 000 DA</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <a
            href="tel:+213555123456"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-nude-600 to-warm-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Phone className="w-5 h-5" />
            Appeler : +213 555 123 456
          </a>
          <a
            href="mailto:contact@kalendo.dz"
            className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            <Mail className="w-5 h-5" />
            contact@kalendo.dz
          </a>
        </div>

        <button
          onClick={() => {
            setLoading(true)
            checkSubscription()
          }}
          className="mt-6 text-nude-600 hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Vérifier à nouveau
        </button>
      </div>
    </div>
  )
}
