'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface SelectValueProps {
  placeholder?: string
  value?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  onSelect?: (value: string) => void
}

export function Select({ value, onValueChange, placeholder, children }: SelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedValue: string) => {
    console.log('✅ SELECT: Valeur sélectionnée:', selectedValue)
    onValueChange?.(selectedValue)
    setOpen(false)
  }

  // Filtrer les enfants pour ne garder que les SelectItem
  const items = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<SelectItemProps> => 
      React.isValidElement(child) && child.type === SelectItem
  )

  console.log('📋 SELECT: Render - valeur actuelle:', value, 'items:', items.length)

  return (
    <div className="relative">
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer"
        onClick={() => {
          console.log('🔽 SELECT: Click pour ouvrir/fermer')
          setOpen(!open)
        }}
      >
        <span className={value ? '' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </div>
      
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-1">
            {items.map((item, index) => {
              const itemValue = item.props.value
              console.log(`📝 SELECT: Item ${index}:`, itemValue)
              
              return React.cloneElement(item, {
                key: itemValue || index,
                onSelect: handleSelect
              })
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function SelectTrigger({ children, className = "", onClick, ...props }: SelectTriggerProps & any) {
  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectValue({ placeholder, value }: SelectValueProps) {
  return (
    <span className={value ? '' : 'text-gray-500'}>
      {value || placeholder}
    </span>
  )
}

export function SelectContent({ children }: SelectContentProps) {
  return <>{children}</>
}

export function SelectItem({ value, children, onSelect }: SelectItemProps) {
  return (
    <div
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100"
      onClick={() => {
        console.log('🎯 SELECTITEM: Click sur:', value)
        onSelect?.(value)
      }}
    >
      {children}
    </div>
  )
}
