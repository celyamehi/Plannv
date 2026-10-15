'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  Phone,
  DollarSign,
  User,
  ChevronRight
} from 'lucide-react'
import { Button } from '../ui/button'
import ProBottomNav from './ProBottomNav'

interface ProSidebarProps {
  children: React.ReactNode
}

export default function ProSidebar({ children }: ProSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fermer automatiquement le menu mobile lors d'un changement de page
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Récupérer le profil depuis la table profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type, full_name, email, business_name')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          setUser({
            ...profileData,
            role: profileData.user_type
          })
        }
      }
    } catch (error) {
      console.error('Erreur checkUser:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Erreur logout:', error)
    }
  }

  const menuItems = [
    {
      href: '/professional/pro-dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble & CA mensuel'
    },
    {
      href: '/professional/cash-register',
      label: 'Caisse & Paiements',
      icon: DollarSign,
      description: 'Encaissement & recettes'
    },
    {
      href: '/professional/appointments',
      label: 'Rendez-vous',
      icon: Calendar,
      description: 'Planning & réservations'
    },
    {
      href: '/professional/pro-services',
      label: 'Prestations & Tarifs',
      icon: Scissors,
      description: 'Catalogue des services'
    },
    {
      href: '/professional/pro-staff',
      label: 'Équipe & Collaborateurs',
      icon: Users,
      description: 'Employés & plannings'
    },
    {
      href: '/professional/availability',
      label: 'Horaires & Disponibilités',
      icon: Calendar,
      description: 'Créneaux & congés'
    },
    {
      href: '/professional/establishment',
      label: 'Établissement & Vitrine',
      icon: Building,
      description: 'Photos, avis & localisation'
    },
    {
      href: '/professional/pro-calls',
      label: 'Appels clients',
      icon: Phone,
      description: 'Confirmations & contacts'
    },
    {
      href: '/professional/settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration du salon'
    }
  ]

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 bg-gray-900 animate-pulse">
          <div className="h-16 bg-gray-800"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-800 rounded"></div>
            <div className="h-8 bg-gray-800 rounded"></div>
            <div className="h-8 bg-gray-800 rounded"></div>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="p-8">
            <div className="h-32 bg-white rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || (user.user_type !== 'professional' && user.user_type !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Cette page est réservée aux professionnels</p>
          <Button onClick={() => router.push('/login')}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 hidden lg:flex lg:flex-col flex-shrink-0`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Kalendo"
              width={sidebarOpen ? 160 : 40}
              height={55}
              className={sidebarOpen ? "h-12 w-auto" : "h-10 w-10 object-contain"}
            />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-nude-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-nude-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user.business_name || user.full_name || 'Professionnel'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Desktop */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                  ? 'bg-nude-50 text-nude-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-nude-600' : 'text-gray-400'}`} />
                {sidebarOpen && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer Desktop */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {sidebarOpen && 'Déconnexion'}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header avec bouton Menu Hamburger */}
        <header className="lg:hidden h-14 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-3 flex-shrink-0 z-20">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Ouvrir le menu du salon"
            >
              <Menu className="w-5 h-5 text-gray-800" />
            </button>
            <Link href="/professional/pro-dashboard" className="flex items-center">
              <Image src="/logo.png" alt="Kalendo" width={110} height={36} className="h-7 w-auto" />
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-nude-50 rounded-full border border-nude-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-nude-800 truncate max-w-[120px]">
                {user?.business_name || user?.full_name || 'Mon salon'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              title="Déconnexion"
              className="text-gray-400 hover:text-red-600 p-1.5 h-8 w-8"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content avec padding bas pour la navigation smartphone */}
        <main className="flex-1 overflow-auto pb-24 lg:pb-0">
          {children}
        </main>

        {/* Barre de navigation inférieure smartphone */}
        <ProBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      </div>

      {/* TIROIR MOBILE COULISSANT (DRAWER) - TOUTES LES PAGES SUR SMARTPHONE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Arrière-plan flouté cliquable pour fermer */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panneau latéral coulissant */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Header du panneau */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
              <Link href="/professional/pro-dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <Image src="/logo.png" alt="Kalendo" width={120} height={40} className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Infos salon & utilisateur */}
            {user && (
              <div className="p-4 bg-gray-50/90 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-nude-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-nude-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.business_name || user.full_name || 'Mon salon'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-nude-700 bg-nude-100 px-2 py-0.5 rounded-full">
                      Espace Professionnel Pro
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Liste de toutes les 9 pages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Toutes les fonctionnalités
              </p>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-nude-600 text-white font-semibold shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <div className="min-w-0">
                        <div className="text-sm truncate">{item.label}</div>
                        <div className={`text-[11px] truncate ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white/60' : 'text-gray-300'}`} />
                  </Link>
                )
              })}
            </div>

            {/* Footer avec bouton Déconnexion */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
