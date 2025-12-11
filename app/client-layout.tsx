'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Home, Calendar, User, Settings, LogOut, Menu, X, MapPin, Clock, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/login')
          return
        }

        // Récupérer le profil utilisateur
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData?.user_type === 'professional' || profileData?.user_type === 'admin') {
          router.push('/professional/pro-dashboard')
          return
        }

        setProfile(profileData)
      } catch (error) {
        console.error('Erreur:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nude-600"></div>
      </div>
    )
  }

  const navItems = [
    {
      name: 'Tableau de bord',
      href: '/client/dashboard',
      icon: <Home className="h-5 w-5" />,
      active: pathname === '/client/dashboard'
    },
    {
      name: 'Prendre RDV',
      href: '/search',
      icon: <Calendar className="h-5 w-5" />,
      active: pathname.startsWith('/booking') || pathname === '/search' || pathname === '/client/search'
    },
    {
      name: 'Mes rendez-vous',
      href: '/client/appointments',
      icon: <Clock className="h-5 w-5" />,
      active: pathname.startsWith('/client/appointments') || pathname.startsWith('/appointments')
    },
    {
      name: 'Favoris',
      href: '/client/favorites',
      icon: <MapPin className="h-5 w-5" />,
      active: pathname.startsWith('/client/favorites') || pathname.startsWith('/favorites')
    },
    {
      name: 'Notifications',
      href: '/client/notifications',
      icon: <Bell className="h-5 w-5" />,
      active: pathname.startsWith('/client/notifications')
    },
    {
      name: 'Mon profil',
      href: '/client/profile',
      icon: <User className="h-5 w-5" />,
      active: pathname.startsWith('/client/profile') || pathname.startsWith('/profile')
    },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-white"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:flex-shrink-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40`}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-warm-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-xl font-semibold">Kalendo</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${item.active
                    ? 'bg-nude-50 text-nude-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'Mon compte'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.email || 'Chargement...'}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="h-4 w-4 mr-3" />
              Paramètres
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        <main className="flex-1 pb-8">
          {/* Overlay pour le menu mobile */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
