import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function MentionsLegalesPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Mentions légales</h1>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">1. Éditeur du site</h2>
              <p className="text-gray-600 leading-relaxed">
                Le site Kalendo est édité par :<br />
                <strong>Kalendo</strong><br />
                Adresse : Alger, Algérie<br />
                Email : contact@kalendo.space
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">2. Hébergement</h2>
              <p className="text-gray-600 leading-relaxed">
                Le site est hébergé par Vercel Inc.<br />
                340 S Lemon Ave #4133<br />
                Walnut, CA 91789, USA
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">3. Propriété intellectuelle</h2>
              <p className="text-gray-600 leading-relaxed">
                L'ensemble du contenu de ce site (textes, images, logos, etc.) est protégé par le droit d'auteur. 
                Toute reproduction, même partielle, est interdite sans autorisation préalable.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">4. Données personnelles</h2>
              <p className="text-gray-600 leading-relaxed">
                Les informations collectées sur ce site sont destinées à Kalendo pour la gestion des réservations 
                et l'amélioration de nos services. Conformément à la loi, vous disposez d'un droit d'accès, 
                de modification et de suppression de vos données personnelles.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">5. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse : 
                <a href="mailto:contact@kalendo.space" className="text-nude-600 hover:underline ml-1">
                  contact@kalendo.space
                </a>
              </p>
            </div>
          </div>
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
