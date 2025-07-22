import { Suspense } from 'react'

import Link from 'next/link'
import LoginForm from './auth/login/LoginForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo2.svg" alt="Teletón Logo" className="h-12 w-auto" />
          </div>
          <p className="text-gray-600">
            Acceso para equipo de RRHH
          </p>
        </div>

        {/* Login Form */}
        <Suspense fallback={
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Navigation Links */}
        {/* <div className="text-center space-y-2">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 block">
            ← Volver al inicio
          </Link>
          <div className="text-xs text-gray-500">
            ¿Problemas para acceder?{' '}
            <a href="mailto:soporte@teleton.cl" className="text-blue-600 hover:underline">
              Contactar soporte
            </a>
          </div>
        </div> */}
      </div>
    </div>
  )
}