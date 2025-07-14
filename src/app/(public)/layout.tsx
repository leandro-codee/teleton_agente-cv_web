import React from 'react'
import { Providers } from '../providers'
import { Toaster } from '@/components/ui/sonner'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </div>
      <Toaster />
    </Providers>
  )
} 