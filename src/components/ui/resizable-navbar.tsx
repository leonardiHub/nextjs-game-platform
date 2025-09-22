'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Menu } from 'lucide-react'

interface NavbarProps {
  children: React.ReactNode
}

export function Navbar({ children }: NavbarProps) {
  return (
    <nav className="w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      {children}
    </nav>
  )
}

interface NavBodyProps {
  children: React.ReactNode
  className?: string
}

export function NavBody({ children, className = '' }: NavBodyProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex justify-between items-center h-16">{children}</div>
    </div>
  )
}

interface MobileNavProps {
  children: React.ReactNode
}

export function MobileNav({ children }: MobileNavProps) {
  return <div className="lg:hidden">{children}</div>
}

export function NavbarLogo({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>
}

interface NavbarButtonProps {
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  className?: string
  title?: string
  children: React.ReactNode
}

export function NavbarButton({
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  title,
  children,
}: NavbarButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded-lg font-medium transition-all duration-300'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  )
}

interface MobileNavHeaderProps {
  children: React.ReactNode
}

export function MobileNavHeader({ children }: MobileNavHeaderProps) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
      {children}
    </div>
  )
}

interface MobileNavToggleProps {
  isOpen: boolean
  onClick: () => void
}

export function MobileNavToggle({ isOpen, onClick }: MobileNavToggleProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  )
}

interface MobileNavMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileNavMenu({ isOpen, children }: MobileNavMenuProps) {
  if (!isOpen) return null

  return (
    <div className="px-4 py-3 border-t border-gray-800 bg-gray-900">
      {children}
    </div>
  )
}
