'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  TrendingUp,
  Phone,
  DollarSign,
  User
} from 'lucide-react'
import { Button } from '../ui/button'

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
            role: profileData.user_type // Pour compatibilité
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

  const getFullName = () => {
    if (!user?.profile) return 'Professionnel'
    return user.profile.business_name || user.profile.contact_full_name || 'Professionnel'
  }

  const menuItems = [
    {
      href: '/professional/pro-dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue d&apos;ensemble mensuelle'
    },
    {
      href: '/professional/establishment',
      label: 'Établissement',
      icon: Building,
      description: 'Statistiques complètes'
    },
    {
      href: '/professional/appointments',
      label: 'Rendez-vous',
      icon: Calendar,
      description: 'Gestion des RDV'
    },
    {
      href: '/professional/pro-calls',
      label: 'Appels',
      icon: Phone,
      description: 'Confirmations'
    },
    {
      href: '/professional/pro-services',
      label: 'Services',
      icon: Scissors,
      description: 'Prestations'
    },
    {
      href: '/professional/pro-staff',
      label: 'Équipe',
      icon: Users,
      description: 'Collaborateurs'
    },
    {
      href: '/professional/availability',
      label: 'Disponibilités',
      icon: Calendar,
      description: 'Horaires & absences'
    },
    {
      href: '/professional/cash-register',
      label: 'Caisse',
      icon: DollarSign,
      description: 'Paiements'
    },
    {
      href: '/professional/settings',
      label: 'Paramètres',
      icon: Settings,
      description: 'Configuration'
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
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-nude-600 to-warm-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            {sidebarOpen && (
              <span className="text-lg font-semibold">Kalendo Pro</span>
            )}
          </div>
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
              <div className="w-10 h-10 bg-nude-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-nude-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.full_name || 'Professionnel'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive
                  ? 'bg-nude-50 text-nude-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-nude-600' : 'text-gray-400'}`} />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {sidebarOpen && 'Déconnexion'}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white z-50" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Sidebar Content */}
            <div className="h-full flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-nude-600 to-warm-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="text-lg font-semibold">Kalendo Pro</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive
                        ? 'bg-nude-50 text-nude-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-nude-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-lg font-semibold">Kalendo Pro</span>
          <div className="w-8" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
