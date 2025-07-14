'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Brain, Menu, Home, Search, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/check', label: 'Consultar CV', icon: Search },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ]

  const NavLink = ({ href, label, icon: Icon, mobile = false }: any) => (
    <Link
      href={href}
      className={cn(
        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        pathname === href
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        mobile && 'w-full justify-start'
      )}
      onClick={() => mobile && setIsOpen(false)}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CV Evaluation</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-2 mt-8">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} mobile />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}