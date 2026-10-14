"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  LayoutGrid,
  CalendarCheck,
  CalendarDays,
  Users,
  Settings,
} from "lucide-react"

export default function ProBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const viewParam = searchParams?.get("view")

  const navItems = [
    {
      label: "Vue d'ense...",
      fullLabel: "Vue d'ensemble",
      href: "/professional/pro-dashboard",
      icon: LayoutGrid,
      isActive: pathname === "/professional/pro-dashboard",
    },
    {
      label: "Réservations",
      fullLabel: "Réservations",
      href: "/professional/appointments",
      icon: CalendarCheck,
      isActive: pathname === "/professional/appointments" && viewParam !== "planning",
    },
    {
      label: "Planning",
      fullLabel: "Planning",
      href: "/professional/appointments?view=planning",
      icon: CalendarDays,
      isActive:
        pathname === "/professional/appointments?view=planning" ||
        (pathname === "/professional/appointments" && viewParam === "planning"),
    },
    {
      label: "Employés",
      fullLabel: "Employés",
      href: "/professional/pro-staff",
      icon: Users,
      isActive: pathname === "/professional/pro-staff",
    },
    {
      label: "Paramètres",
      fullLabel: "Paramètres",
      href: "/professional/settings",
      icon: Settings,
      isActive: pathname === "/professional/settings",
    },
  ]

  return (
    <nav
      aria-label="Navigation mobile salon"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] lg:hidden transition-all duration-200"
    >
      <div className="grid grid-cols-5 items-center px-1.5 py-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.fullLabel}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                active
                  ? "text-[#5b50e6]"
                  : "text-gray-400 hover:text-gray-600 active:scale-95"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5b50e6]" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-full leading-tight ${
                  active ? "font-bold text-[#5b50e6]" : "font-normal text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
