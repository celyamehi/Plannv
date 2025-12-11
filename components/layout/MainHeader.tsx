"use client"

import Link from "next/link"

interface MainHeaderProps {
  transparent?: boolean
}

export default function MainHeader({ transparent = false }: MainHeaderProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-xl border-b border-nude-200'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-nude-600 to-nude-500 rounded-xl flex items-center justify-center shadow-lg shadow-nude-200">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-nude-700 to-nude-500 bg-clip-text text-transparent">
            Kalendo
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/search" className="text-gray-600 hover:text-nude-600 font-medium transition-colors">
            Trouver un salon
          </Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-nude-600 font-medium transition-colors">
            Comment ça marche ?
          </Link>
          <Link href="/#professionals" className="text-gray-600 hover:text-nude-600 font-medium transition-colors">
            Pour les professionnels
          </Link>
          <Link href="/faq" className="text-gray-600 hover:text-nude-600 font-medium transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-gray-600 hover:text-nude-600 font-medium transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/professionals/signup"
            className="px-5 py-2.5 bg-gradient-to-r from-nude-600 to-nude-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-nude-200 hover:scale-105 transition-all duration-300 text-sm"
          >
            Ajouter mon salon
          </Link>
        </div>
      </div>
    </header>
  )
}
