"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

interface MainHeaderProps {
  transparent?: boolean
}

export default function MainHeader({ transparent = false }: MainHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          {/* Menu hamburger - visible uniquement sur mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-nude-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Connexion - caché sur mobile */}
          <Link
            href="/login"
            className="hidden sm:inline-flex text-gray-600 hover:text-nude-600 font-medium transition-colors"
          >
            Connexion
          </Link>
          
          {/* Ajouter mon salon - caché sur mobile, visible sur tablette+ */}
          <Link
            href="/professionals/signup"
            className="hidden sm:inline-flex px-5 py-2.5 bg-gradient-to-r from-nude-600 to-nude-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-nude-200 hover:scale-105 transition-all duration-300 text-sm"
          >
            Ajouter mon salon
          </Link>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-nude-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Navigation mobile */}
            <Link
              href="/search"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-600 hover:text-nude-600 font-medium transition-colors py-2"
            >
              Trouver un salon
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-600 hover:text-nude-600 font-medium transition-colors py-2"
            >
              Comment ça marche ?
            </Link>
            <Link
              href="/#professionals"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-600 hover:text-nude-600 font-medium transition-colors py-2"
            >
              Pour les professionnels
            </Link>
            <Link
              href="/faq"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-600 hover:text-nude-600 font-medium transition-colors py-2"
            >
              FAQ
            </Link>
            
            {/* Séparateur */}
            <div className="border-t border-nude-200 pt-3"></div>
            
            {/* Actions mobile */}
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-600 hover:text-nude-600 font-medium transition-colors py-2"
            >
              Connexion
            </Link>
            <Link
              href="/professionals/signup"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full px-5 py-2.5 bg-gradient-to-r from-nude-600 to-nude-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-nude-200 hover:scale-105 transition-all duration-300 text-sm text-center"
            >
              Ajouter mon salon
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
