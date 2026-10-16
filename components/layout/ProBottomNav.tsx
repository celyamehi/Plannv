"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Scissors,
  Menu,
} from "lucide-react"

interface ProBottomNavProps {
  onOpenMenu?: () => void
}

export default function ProBottomNav({ onOpenMenu }: ProBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Dashboard",
      fullLabel: "Tableau de bord",
      href: "/professional/pro-dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/professional/pro-dashboard",
    },
    {
      label: "Planning",
      fullLabel: "Rendez-vous & Planning",
      href: "/professional/appointments",
      icon: Calendar,
      isActive: pathname === "/professional/appointments",
    },
    {
      label: "Caisse",
      fullLabel: "Caisse & Paiements",
      href: "/professional/cash-register",
      icon: DollarSign,
      isActive: pathname === "/professional/cash-register",
    },
    {
      label: "Services",
      fullLabel: "Prestations & Tarifs",
      href: "/professional/pro-services",
      icon: Scissors,
      isActive: pathname === "/professional/pro-services",
    },
  ]

  return (
    <nav
      aria-label="Navigation mobile salon"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] lg:hidden transition-all duration-200"
    >
      <div className="grid grid-cols-5 items-center px-1 py-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.fullLabel}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-200 ${
                active
                  ? "text-nude-600 font-semibold"
                  : "text-gray-400 hover:text-gray-700 active:scale-95"
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
                className={`text-[10px] mt-1 tracking-tight truncate max-w-full leading-tight ${
                  active ? "font-bold text-nude-600" : "font-medium text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Bouton Menu Complet (Toutes les pages) */}
        <button
          type="button"
          onClick={onOpenMenu}
          title="Toutes les pages"
          className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl text-gray-500 hover:text-nude-600 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="relative p-0.5">
            <Menu className="w-5 h-5 stroke-[2] text-gray-700 hover:text-nude-600 transition-colors" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight font-semibold text-gray-700 leading-tight">
            Menu
          </span>
        </button>
      </div>
    </nav>
  )
}
