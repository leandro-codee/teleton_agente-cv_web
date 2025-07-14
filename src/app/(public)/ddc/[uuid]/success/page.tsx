'use client'

import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
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

const ApplicationSuccessPage = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const ddcUuid = params.uuid as string
  const referenceNumber = searchParams.get('ref')

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

  const handleGoBack = () => {
    window.history.back()
  }

  const handleVisitWebsite = () => {
    if (companyBranding?.website) {
      window.open(companyBranding.website, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader company={companyBranding} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div 
              className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4"
              style={{ 
                backgroundColor: companyBranding?.primary_color + '20' || '#3B82F620',
                color: companyBranding?.primary_color || '#3B82F6'
              }}
            >
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Postulación Enviada Exitosamente!
            </h1>
            <p className="text-lg text-gray-600">
              Tu CV ha sido recibido y está siendo procesado
            </p>
          </div>

          {/* Reference Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Detalles de tu Postulación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posición</p>
                  <p className="text-lg font-semibold">{ddcData?.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Empresa</p>
                  <p className="text-lg font-semibold">{companyBranding?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Número de Referencia</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {referenceNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Fecha de Postulación</p>
                  <p className="text-lg font-semibold">
                    {new Date().toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Badge 
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Postulación Confirmada
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Próximos Pasos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: companyBranding?.primary_color || '#3B82F6' }}
                  >
                    1
                  </div>
                  <div>
                    <p className="font-medium">Revisión de CV</p>
                    <p className="text-sm text-gray-600">
                      Nuestro equipo de RRHH revisará tu CV y experiencia
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: companyBranding?.secondary_color || '#1E40AF' }}
                  >
                    2
                  </div>
                  <div>
                    <p className="font-medium">Evaluación</p>
                    <p className="text-sm text-gray-600">
                      Evaluaremos tu perfil
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Contacto Directo</p>
                    <p className="text-sm text-gray-600">
                      Si tu perfil es seleccionado, nos contactaremos contigo por email
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Información Importante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    <strong>Guarda tu número de referencia:</strong> {referenceNumber || 'N/A'}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    <strong>Tiempo de respuesta:</strong> Normalmente respondemos en 5-7 días hábiles
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    <strong>Revisa tu correo:</strong> Incluyendo la carpeta de spam
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    <strong>Múltiples postulaciones:</strong> Puedes postular a otras posiciones disponibles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Oferta
            </Button>
            
            {companyBranding?.website && (
              <Button
                onClick={handleVisitWebsite}
                className="flex-1 sm:flex-none"
                style={{ 
                  backgroundColor: companyBranding?.primary_color || '#3B82F6',
                  borderColor: companyBranding?.primary_color || '#3B82F6'
                }}
              >
                Visitar Sitio Web
              </Button>
            )}
          </div>

          {/* Footer Message */}
          <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>¡Gracias por tu interés!</strong> Estamos emocionados de conocer tu perfil y evaluar tu candidatura para esta posición.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationSuccessPage 