'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import { User, Search, Calendar, Star, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from '../ui/button'

interface NavbarProps {
  currentPage?: string
}

export default function Navbar({ currentPage = 'default' }: NavbarProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Récupérer le rôle et les infos utilisateur
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (userData) {
          let profileData = null

          // Récupérer les infos selon le rôle
          if (userData.role === 'client') {
            try {
              const { data: clientData } = await supabase
                .from('clients')
                .select('*')
                .eq('id', session.user.id)
                .single()
              profileData = clientData
            } catch (profileError) {
              console.error('Erreur récupération profil client:', profileError)
              profileData = null
            }
          } else if (userData.role === 'professional') {
            try {
              const { data: professionalData } = await supabase
                .from('professionals')
                .select('*')
                .eq('id', session.user.id)
                .single()
              profileData = professionalData
            } catch (profileError) {
              console.error('Erreur récupération profil professionnel:', profileError)
              profileData = null
            }
          }

          setUser({
            ...session.user,
            role: userData.role,
            profile: profileData
          })
        }
      }
    } catch (error) {
      console.error('Erreur vérification utilisateur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getFullName = () => {
    try {
      if (!user?.profile) return 'Utilisateur'

      if (user.role === 'client') {
        if (user.profile.first_name && user.profile.last_name) {
          return `${user.profile.first_name} ${user.profile.last_name}`
        }
        if (user.profile.first_name) {
          return user.profile.first_name
        }
        return 'Utilisateur'
      } else if (user.role === 'professional') {
        return user.profile.business_name || user.profile.contact_full_name || 'Professionnel'
      }

      return 'Utilisateur'
    } catch (error) {
      console.error('Erreur getFullName:', error)
      return 'Utilisateur'
    }
  }


  const getFixedNavLinks = () => {
    // Retourne les liens selon le rôle de l'utilisateur
    if (user?.role === 'professional' || user?.role === 'admin') {
      // Liens pour les professionnels
      return [
        { href: '/professional/pro-dashboard', label: 'Tableau de bord' },
        { href: '/professional/appointments', label: 'Rendez-vous' },
        { href: '/professional/pro-services', label: 'Services' },
        { href: '/professional/pro-staff', label: 'Équipe' }
      ]
    } else {
      // Liens pour les clients
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/search', label: 'Rechercher' },
        { href: '/appointments', label: 'Rendez-vous' },
        { href: '/favorites', label: 'Favoris' }
      ]
    }
  }

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-64 h-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.role === 'professional' || user?.role === 'admin'
              ? 'bg-gradient-to-br from-pink-600 to-purple-600'
              : 'bg-gradient-to-br from-purple-600 to-pink-600'
              }`}>
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-semibold">
              {user?.role === 'professional' || user?.role === 'admin' ? 'PlannV Pro' : 'PlannV'}
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {getFixedNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${currentPage === link.href.replace('/', '') ||
                  (currentPage === 'dashboard' && link.href === '/dashboard') ||
                  (currentPage === 'pro-dashboard' && link.href === '/professional/pro-dashboard')
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions à droite */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="hidden sm:block text-sm text-gray-600">
                  Bonjour, {getFullName()}
                </span>
                <Link
                  href={user.role === 'client' ? '/profile' : '/professional/pro-profile'}
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex items-center text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/selection">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                    S&apos;inscrire
                  </Button>
                </Link>
              </div>
            )}

            {/* Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              {getFixedNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${currentPage === link.href.replace('/', '') ||
                    (currentPage === 'dashboard' && link.href === '/dashboard') ||
                    (currentPage === 'pro-dashboard' && link.href === '/professional/pro-dashboard')
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {user && (
                <>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Bonjour, {getFullName()}
                    </p>
                    <Link
                      href={user.role === 'client' ? '/profile' : '/professional/pro-profile'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm text-gray-600 hover:text-gray-900 mb-2 block"
                    >
                      Mon profil
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Déconnexion
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
