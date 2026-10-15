import Link from 'next/link'
import MainHeader from '@/components/layout/MainHeader'
import HeroSectionAlgeria from '@/components/home/HeroSectionAlgeria'
import CategoriesSectionAlgeria from '@/components/home/CategoriesSectionAlgeria'
import VillesSection from '@/components/home/VillesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import ProfessionalsSection from '@/components/home/ProfessionalsSection'
import TopRatedSalonsSection from '@/components/home/TopRatedSalonsSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <MainHeader />

      {/* Main Content */}
      <div className="pt-20">
        <HeroSectionAlgeria />
        <CategoriesSectionAlgeria />
        <VillesSection />
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <div id="professionals">
          <ProfessionalsSection />
        </div>
        <TopRatedSalonsSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-nude-100 bg-nude-50/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-nude-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Kalendo</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-sm">
                La 1ère plateforme de réservation beauté en Algérie. Trouvez et réservez vos rendez-vous en quelques clics, 24h/24.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📧</span>
                <a href="mailto:kalendodz@gmail.com" className="hover:text-nude-600 transition-colors">
                  kalendodz@gmail.com
                </a>
              </div>
            </div>

            {/* Pour les clients */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Pour les clients</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link href="/search" className="hover:text-nude-600 transition-colors">
                    Trouver un salon
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-nude-600 transition-colors">
                    Comment ça marche
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pour les professionnels */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Pour les professionnels</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link href="/professionals/signup" className="hover:text-nude-600 transition-colors">
                    Ajouter mon salon
                  </Link>
                </li>
                <li>
                  <Link href="/login?type=professional" className="hover:text-nude-600 transition-colors">
                    Espace Pro
                  </Link>
                </li>
                <li>
                  <Link href="/nos-offres" className="hover:text-nude-600 transition-colors">
                    Nos offres & Tarifs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Légal</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>
                  <Link href="/mentions-legales" className="hover:text-nude-600 transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-nude-600 transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="hover:text-nude-600 transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-nude-600 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-nude-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} <Link href="/admin/login" className="hover:text-nude-600 transition-colors">Kalendo</Link>. Tous droits réservés. 🇩🇿
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Fait avec ❤️ en Algérie</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

