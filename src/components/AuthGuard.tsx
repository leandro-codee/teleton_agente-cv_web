'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface AuthGuardProps {
    children: React.ReactNode
    requireAuth?: boolean
    redirectTo?: string
}

export function AuthGuard({
    children,
    requireAuth = true,
    redirectTo = '/auth/login'
}: AuthGuardProps) {
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (requireAuth && !isAuthenticated) {
            // Redirect to login with return URL
            const returnUrl = encodeURIComponent(pathname)
            router.push(`${redirectTo}?returnUrl=${returnUrl}`)
        }
    }, [isAuthenticated, requireAuth, router, redirectTo, pathname])

    // Show loading while checking auth
    if (requireAuth && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}