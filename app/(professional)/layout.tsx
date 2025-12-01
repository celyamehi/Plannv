import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Vérifier l'authentification
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', session.user.id)
    .single()

  // Vérifier que c'est un professionnel
  if (profile?.user_type !== 'professional' && profile?.user_type !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-semibold">PlannV Pro</span>
              </Link>
            </div>

            <nav className="flex items-center space-x-6">
              <Link href="/professional/pro-dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/professional/calendar" className="text-gray-600 hover:text-gray-900">
                Calendrier
              </Link>
              <Link href="/professional/pro-services" className="text-gray-600 hover:text-gray-900">
                Services
              </Link>
              <Link href="/professional/pro-staff" className="text-gray-600 hover:text-gray-900">
                Équipe
              </Link>
              <Link href="/professional/settings" className="text-gray-600 hover:text-gray-900">
                Paramètres
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Vue client
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
