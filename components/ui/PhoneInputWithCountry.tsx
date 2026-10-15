'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface CountryOption {
  name: string
  code: string
  dialCode: string
  flag: string
  example: string
}

export const COUNTRIES: CountryOption[] = [
  { name: 'Algérie', code: 'DZ', dialCode: '+213', flag: '🇩🇿', example: '550 12 34 56' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', example: '6 12 34 56 78' },
  { name: 'Tunisie', code: 'TN', dialCode: '+216', flag: '🇹🇳', example: '20 12 34 56' },
  { name: 'Maroc', code: 'MA', dialCode: '+212', flag: '🇲🇦', example: '6 12 34 56 78' },
  { name: 'Belgique', code: 'BE', dialCode: '+32', flag: '🇧🇪', example: '470 12 34 56' },
  { name: 'Suisse', code: 'CH', dialCode: '+41', flag: '🇨🇭', example: '78 123 45 67' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', example: '514 123 4567' },
  { name: 'Royaume-Uni', code: 'GB', dialCode: '+44', flag: '🇬🇧', example: '7123 456789' },
  { name: 'Turquie', code: 'TR', dialCode: '+90', flag: '🇹🇷', example: '501 234 56 78' },
  { name: 'Émirats Arabes Unis', code: 'AE', dialCode: '+971', flag: '🇦🇪', example: '50 123 4567' },
  { name: 'Arabie Saoudite', code: 'SA', dialCode: '+966', flag: '🇸🇦', example: '50 123 4567' },
  { name: 'Espagne', code: 'ES', dialCode: '+34', flag: '🇪🇸', example: '612 34 56 78' },
  { name: 'Italie', code: 'IT', dialCode: '+39', flag: '🇮🇹', example: '312 345 6789' },
  { name: 'Allemagne', code: 'DE', dialCode: '+49', flag: '🇩🇪', example: '151 23456789' },
]

interface PhoneInputWithCountryProps {
  value: string
  onChange: (fullNumber: string) => void
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  className?: string
  defaultCountryCode?: string
}

export default function PhoneInputWithCountry({
  value = '',
  onChange,
  placeholder,
  required = false,
  id,
  name,
  className = '',
  defaultCountryCode = 'DZ'
}: PhoneInputWithCountryProps) {
  // Trouver le pays initial depuis la valeur ou par défaut
  const initialCountry = COUNTRIES.find(c => value.startsWith(c.dialCode)) || 
    COUNTRIES.find(c => c.code === defaultCountryCode) || 
    COUNTRIES[0]

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(initialCountry)
  
  // Extraire le numéro sans indicatif et sans 0
  const extractLocalNumber = (fullVal: string, dialCode: string) => {
    let local = fullVal
    if (local.startsWith(dialCode)) {
      local = local.slice(dialCode.length).trim()
    }
    // Supprimer le premier 0 si l'utilisateur l'avait entré
    if (local.startsWith('0')) {
      local = local.slice(1).trim()
    }
    return local
  }

  const [localNumber, setLocalNumber] = useState<string>(() => extractLocalNumber(value, initialCountry.dialCode))

  // Mettre à jour si value change de l'extérieur
  useEffect(() => {
    const matched = COUNTRIES.find(c => value.startsWith(c.dialCode))
    if (matched && matched.code !== selectedCountry.code) {
      setSelectedCountry(matched)
      setLocalNumber(extractLocalNumber(value, matched.dialCode))
    } else if (!value) {
      setLocalNumber('')
    }
  }, [value])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0]
    setSelectedCountry(country)
    
    // Reformuler la valeur complète
    const cleaned = localNumber.replace(/^0+/, '').trim()
    const full = cleaned ? `${country.dialCode} ${cleaned}` : ''
    onChange(full)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value

    // Règle d'or : retirer les caractères non numériques (sauf espaces)
    val = val.replace(/[^\d\s]/g, '')

    // Règle demandée : retirer automatiquement le premier 0
    if (val.startsWith('0')) {
      val = val.replace(/^0+/, '')
    }

    setLocalNumber(val)

    const cleaned = val.replace(/\s+/g, '')
    const full = cleaned ? `${selectedCountry.dialCode} ${cleaned}` : ''
    onChange(full)
  }

  return (
    <div className={`relative flex items-center rounded-xl border border-gray-200 bg-white shadow-xs focus-within:border-nude-600 focus-within:ring-2 focus-within:ring-nude-600/20 transition-all ${className}`}>
      {/* Sélecteur de pays avec drapeau et indicatif */}
      <div className="relative flex items-center pl-3 pr-2 py-2.5 border-r border-gray-200 bg-gray-50/70 rounded-l-xl hover:bg-gray-100/70 transition-colors">
        <span className="text-xl mr-1.5 select-none">{selectedCountry.flag}</span>
        <span className="text-sm font-semibold text-gray-700 min-w-[42px]">{selectedCountry.dialCode}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1 pointer-events-none" />
        
        <select
          value={selectedCountry.code}
          onChange={handleCountryChange}
          aria-label="Indicatif pays"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {COUNTRIES.map(country => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name} ({country.dialCode})
            </option>
          ))}
        </select>
      </div>

      {/* Champ numéro (sans le 0) */}
      <input
        type="tel"
        id={id}
        name={name}
        required={required}
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder || `Ex: ${selectedCountry.example} (sans le 0)`}
        className="w-full px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none rounded-r-xl font-medium"
      />
    </div>
  )
}
