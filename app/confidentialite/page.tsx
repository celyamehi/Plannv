import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function ConfidentialitePage() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Politique de confidentialité</h1>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">1. Collecte des données</h2>
              <p className="text-gray-600 leading-relaxed">
                Nous collectons les données suivantes lors de votre utilisation de Kalendo :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Nom et prénom</li>
                <li>Numéro de téléphone</li>
                <li>Adresse email</li>
                <li>Historique des réservations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">2. Utilisation des données</h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Gérer vos réservations</li>
                <li>Vous envoyer des confirmations et rappels par SMS/email</li>
                <li>Améliorer nos services</li>
                <li>Vous contacter en cas de besoin</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">3. Protection des données</h2>
              <p className="text-gray-600 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données 
                personnelles contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">4. Partage des données</h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données sont partagées uniquement avec les établissements auprès desquels vous 
                effectuez une réservation, dans le but de confirmer et gérer votre rendez-vous. 
                Nous ne vendons jamais vos données à des tiers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">5. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Kalendo utilise des cookies pour améliorer votre expérience de navigation. 
                Ces cookies nous permettent de mémoriser vos préférences et d'analyser l'utilisation du site.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">6. Vos droits</h2>
              <p className="text-gray-600 leading-relaxed">
                Vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit de suppression</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Pour exercer ces droits, contactez-nous à : 
                <a href="mailto:kalendodz@gmail.com" className="text-nude-600 hover:underline ml-1">
                  kalendodz@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">7. Modifications</h2>
              <p className="text-gray-600 leading-relaxed">
                Cette politique de confidentialité peut être mise à jour. Nous vous informerons 
                de tout changement significatif.
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
