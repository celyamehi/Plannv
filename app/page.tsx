import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import CTASection from '@/components/home/CTASection'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Kalendo
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              Rechercher
            </Link>
            <Link href="/professionals" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              Professionnels
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
              À propos
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/auth/selection"
              className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20">
        <HeroSection />
        <CategoriesSection />
        <FeaturesSection />
        <CTASection />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Kalendo</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                La plateforme de réservation beauté et bien-être qui simplifie votre quotidien.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-900">Clients</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/search" className="hover:text-purple-600 transition-colors">Rechercher</Link></li>
                <li><Link href="/how-it-works" className="hover:text-purple-600 transition-colors">Comment ça marche</Link></li>
                <li><Link href="/faq" className="hover:text-purple-600 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-900">Professionnels</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/professionals" className="hover:text-purple-600 transition-colors">Espace Pro</Link></li>
                <li><Link href="/professionals/pricing" className="hover:text-purple-600 transition-colors">Tarifs</Link></li>
                <li><Link href="/professionals/features" className="hover:text-purple-600 transition-colors">Fonctionnalités</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-900">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/terms" className="hover:text-purple-600 transition-colors">CGU</Link></li>
                <li><Link href="/privacy" className="hover:text-purple-600 transition-colors">Confidentialité</Link></li>
                <li><Link href="/contact" className="hover:text-purple-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Kalendo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

