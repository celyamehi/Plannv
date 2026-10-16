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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header (Sans menu gauche, design smartphone moderne) */}
                <header className="lg:hidden h-14 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 z-20">
                    <Link href="/client/dashboard" className="flex items-center">
                        <Image src="/logo.png" alt="Kalendo" width={110} height={36} className="h-7 w-auto" />
                    </Link>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-nude-50 rounded-full border border-nude-100">
                            <User className="w-3.5 h-3.5 text-nude-600" />
                            <span className="text-xs font-semibold text-nude-800 truncate max-w-[120px]">
                                {user?.full_name || 'Mon compte'}
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

                {/* Page Content avec padding bas pour la barre inférieure mobile */}
                <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 lg:pb-8">
                    {children}
                </main>

                {/* Barre de navigation inférieure smartphone (exactement comme sur la photo) */}
                <nav
                    aria-label="Navigation mobile client"
                    className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] lg:hidden transition-all duration-200"
                >
                    <div className="grid grid-cols-5 items-center px-1 py-1.5 max-w-md mx-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const active = pathname === item.href
                            const shortLabel = item.href === '/client/dashboard'
                                ? "Accueil"
                                : item.href === '/client/appointments'
                                ? "RDV"
                                : item.label

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
                                        active
                                            ? "text-nude-600 font-semibold"
                                            : "text-gray-400 hover:text-gray-600 active:scale-95"
                                    }`}
                                >
                                    <div className="relative">
                                        <Icon
                                            className={`w-5 h-5 transition-transform duration-200 ${
                                                active ? "scale-110 stroke-[2.4] text-nude-600" : "stroke-[1.8]"
                                            }`}
                                        />
                                        {active && (
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-nude-600" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-full leading-tight ${
                                            active ? "font-bold text-nude-600" : "font-normal text-gray-500"
                                        }`}
                                    >
                                        {shortLabel}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>
        </div>
    )
}
