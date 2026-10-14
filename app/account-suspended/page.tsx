'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { AlertTriangle, Phone, Mail, LogOut, RefreshCw } from 'lucide-react'

export default function AccountSuspendedPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email, subscription_status, subscription_ends_at, trial_ends_at')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        // Si le compte est maintenant actif, rediriger vers le dashboard
        if (profileData.subscription_status === 'active' || profileData.subscription_status === 'trial') {
          const endsAt = profileData.subscription_ends_at ? new Date(profileData.subscription_ends_at) : null
          if (!endsAt || endsAt > new Date()) {
            router.push('/professional/pro-dashboard')
            return
          }
        }
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setChecking(true)
    await checkStatus()
    setChecking(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-nude-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const getStatusInfo = () => {
    switch (profile?.subscription_status) {
      case 'suspended':
        return {
          title: 'Compte suspendu',
          message: 'Votre compte a été suspendu par l\'administrateur.',
          color: 'red'
        }
      case 'expired':
        return {
          title: 'Abonnement expiré',
          message: 'Votre période d\'essai ou abonnement a expiré.',
          color: 'orange'
        }
      default:
        return {
          title: 'Accès restreint',
          message: 'Votre compte n\'est pas actif.',
          color: 'gray'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">K</span>
            </div>
            <span className="text-3xl font-semibold">Kalendo</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            statusInfo.color === 'red' ? 'bg-red-100' : 
            statusInfo.color === 'orange' ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <AlertTriangle className={`w-10 h-10 ${
              statusInfo.color === 'red' ? 'text-red-600' : 
              statusInfo.color === 'orange' ? 'text-orange-600' : 'text-gray-600'
            }`} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {statusInfo.title}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {statusInfo.message}
          </p>

          {/* User info */}
          {profile && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-500">Compte</p>
              <p className="font-medium">{profile.full_name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Pour réactiver votre compte, veuillez nous contacter :
            </p>

            <a
              href="tel:+213555123456"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-nude-600 to-warm-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Phone className="w-5 h-5" />
              Appeler : 0555 123 456
            </a>

            <a
              href="mailto:contact@kalendo.dz"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-nude-600 text-nude-600 rounded-xl font-medium hover:bg-nude-50 transition-all"
            >
              <Mail className="w-5 h-5" />
              contact@kalendo.dz
            </a>
          </div>

          {/* Refresh & Logout */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              Vérifier
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Pricing reminder */}
        <div className="mt-6 p-5 bg-white rounded-2xl shadow-sm border border-nude-100 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            30 jours d&apos;essai gratuit inclus
          </div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
            Tarif unique Kalendo Pro
          </p>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">1 500</span>
            <span className="text-sm font-bold text-nude-700">DA</span>
            <span className="text-xs text-gray-500">/ mois</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Sans engagement • Tout inclus (planning en ligne, gestion employés, réservations 24h/24)
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs pt-2 border-t border-gray-100">
            <span className="px-2.5 py-1 bg-nude-50 text-nude-800 rounded-lg font-medium border border-nude-100">
              1 mois : 1 500 DA
            </span>
            <span className="px-2.5 py-1 bg-nude-50 text-nude-800 rounded-lg font-medium border border-nude-100">
              3 mois : 4 500 DA
            </span>
            <span className="px-2.5 py-1 bg-nude-50 text-nude-800 rounded-lg font-medium border border-nude-100">
              6 mois : 9 000 DA
            </span>
            <span className="px-2.5 py-1 bg-nude-100 text-nude-900 rounded-lg font-bold border border-nude-200">
              12 mois : 18 000 DA
            </span>
          </div>
          <div className="mt-3">
            <Link
              href="/nos-offres"
              className="text-xs text-nude-600 hover:text-nude-800 font-medium underline transition-colors"
            >
              Découvrir les détails de l&apos;offre Kalendo Pro →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
