'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import {
    LayoutDashboard,
    Calendar,
    Search,
    Heart,
    User,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { Button } from '../ui/button'

export default function ClientSidebar({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
            setUser(profile)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const menuItems = [
        {
            href: '/client/dashboard',
            label: 'Tableau de bord',
            icon: LayoutDashboard
        },
        {
            href: '/client/search',
            label: 'Rechercher',
            icon: Search
        },
        {
            href: '/client/appointments',
            label: 'Mes Rendez-vous',
            icon: Calendar
        },
        {
            href: '/client/favorites',
            label: 'Favoris',
            icon: Heart
        },
        {
            href: '/client/settings',
            label: 'Paramètres',
            icon: Settings
        }
    ]

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Desktop */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 hidden lg:flex lg:flex-col`}>
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
                            <div className="w-10 h-10 bg-nude-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-nude-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.full_name || 'Client'}
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
                                <Link href="/" className="flex items-center">
                                    <Image
                                        src="/logo.png"
                                        alt="Kalendo"
                                        width={120}
                                        height={40}
                                        className="h-8 w-auto"
                                    />
                                </Link>
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
                    <Image src="/logo.png" alt="Kalendo" width={100} height={32} className="h-6 w-auto" />
                    <div className="w-8" /> {/* Spacer for centering */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
