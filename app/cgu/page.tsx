import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Kalendo" width={140} height={50} className="h-10 w-auto" />
          </Link>
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-nude-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">1. Objet</h2>
              <p className="text-gray-600 leading-relaxed">
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme 
                Kalendo, service de réservation en ligne pour les établissements de beauté en Algérie.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">2. Accès au service</h2>
              <p className="text-gray-600 leading-relaxed">
                L'accès à Kalendo est gratuit pour les clients. L'inscription permet de bénéficier de 
                fonctionnalités supplémentaires comme l'historique des rendez-vous et les rappels personnalisés.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">3. Réservations</h2>
              <p className="text-gray-600 leading-relaxed">
                Les réservations effectuées via Kalendo sont confirmées par SMS et/ou email. Le paiement 
                s'effectue directement auprès de l'établissement. En cas d'annulation, nous vous recommandons 
                de prévenir l'établissement au moins 24 heures à l'avance.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">4. Responsabilités</h2>
              <p className="text-gray-600 leading-relaxed">
                Kalendo agit en tant qu'intermédiaire entre les clients et les établissements. Nous ne sommes 
                pas responsables de la qualité des prestations fournies par les établissements partenaires.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">5. Propriété intellectuelle</h2>
              <p className="text-gray-600 leading-relaxed">
                Tous les éléments du site Kalendo (logo, textes, images, fonctionnalités) sont protégés par 
                les droits de propriété intellectuelle et appartiennent à Kalendo.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">6. Modification des CGU</h2>
              <p className="text-gray-600 leading-relaxed">
                Kalendo se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs 
                seront informés de toute modification importante.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">7. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question relative aux CGU : 
                <a href="mailto:contact@kalendo.space" className="text-nude-600 hover:underline ml-1">
                  contact@kalendo.space
                </a>
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Dernière mise à jour : Décembre 2024
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Kalendo. Tous droits réservés. 🇩🇿</p>
        </div>
      </footer>
    </main>
  )
}
