import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Teletón - Sistema de Evaluación de CV',
  description: 'Sistema inteligente de evaluación y ranking de CVs',
  keywords: ['CV', 'evaluation', 'AI', 'recruitment', 'HR', 'Teletón'],
  authors: [{ name: 'Teletón' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
              {children}
              <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}