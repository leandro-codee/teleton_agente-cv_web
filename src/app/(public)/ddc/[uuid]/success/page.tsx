'use client'

import React, { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { 
  CheckCircle, 
  Mail, 
  Calendar, 
  FileText,
  ArrowLeft,
  Clock
} from 'lucide-react'
import CompanyHeader from '@/components/public/CompanyHeader'
import SuccessContent from './SuccessContent'

const ApplicationSuccessPage = () => {
  const params = useParams()
  const ddcUuid = params.uuid as string

  const { data: ddcData } = useQuery({
    queryKey: ['public-ddc', ddcUuid],
    queryFn: () => api.getPublicDDC(ddcUuid),
    retry: 1
  })

  const { data: companyBranding } = useQuery({
    queryKey: ['company-branding', ddcData?.company_id],
    queryFn: () => api.getCompanyBranding(ddcData?.company_id),
    enabled: !!ddcData?.company_id
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader company={companyBranding} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          }>
            <SuccessContent 
              ddcData={ddcData} 
              companyBranding={companyBranding}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ApplicationSuccessPage 