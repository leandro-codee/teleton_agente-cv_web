'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useProcessing } from '@/hooks/useProcessing'
import { WeightConfig, PROCESSING_PRESETS } from '@/types'
import { PROCESSING_CONFIG } from '@/lib/constants'
import ProcessingConfig from '@/components/dashboard/ProcessingConfig'
import { ArrowLeft, FileText, Users, BarChart3, Loader2, Clock, AlertTriangle, ExternalLink } from 'lucide-react'

const ProcessDDCPage = () => {
  const params = useParams()
  const router = useRouter()
  const ddcId = params.id as string
  const { startProcessing, isProcessing } = useProcessing()

  const { data: ddc } = useQuery({
    queryKey: ['ddc', ddcId],
    queryFn: () => api.getDDC(ddcId),
  })

  const { data: cvs = [] } = useQuery({
    queryKey: ['ddc-cvs', ddcId],
    queryFn: () => api.getDDCCVs(ddcId),
  })

  const { data: processings = [] } = useQuery({
    queryKey: ['ddc-processings', ddcId],
    queryFn: () => api.getDDCProcessings(ddcId),
  })

  // Detectar procesamiento activo
  const activeProcessing = processings.find(p => p.status === 'pending' || p.status === 'processing')

  const handleProcessingStart = (config: WeightConfig & { name: string }) => {
    startProcessing({
      ddc_id: ddcId,
      name: config.name,
      profession_weight: config.profession,
      experience_weight: config.experience,
      skills_weight: config.skills,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Procesando</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProgressPercentage = (processing: any) => {
    if (processing.cv_count === 0) return 0
    return Math.round(((processing.processed_count + processing.failed_count) / processing.cv_count) * 100)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Procesar CVs</h1>
          <p className="text-gray-600">
            {ddc?.title || 'Cargando...'}
          </p>
        </div>
      </div>

      {/* Alerta de Procesamiento Activo */}
      {activeProcessing && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-yellow-800">
                    Procesamiento Activo Detectado
                  </h3>
                  {getStatusBadge(activeProcessing.status)}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {activeProcessing.name}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Iniciado el {formatDate(activeProcessing.started_at)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-yellow-700">CVs Procesados</p>
                      <p className="font-medium text-yellow-800">
                        {activeProcessing.processed_count}/{activeProcessing.cv_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-yellow-700">Progreso</p>
                      <p className="font-medium text-yellow-800">
                        {getProgressPercentage(activeProcessing)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-yellow-700">Configuración</p>
                      <p className="font-medium text-yellow-800 text-xs">
                        P:{activeProcessing.profession_weight}% | 
                        E:{activeProcessing.experience_weight}% | 
                        H:{activeProcessing.skills_weight}%
                      </p>
                    </div>
                    <div>
                      <p className="text-yellow-700">Estado</p>
                      <p className="font-medium text-yellow-800 capitalize">
                        {activeProcessing.status === 'pending' ? 'Pendiente' : 'Procesando'}
                      </p>
                    </div>
                  </div>

                  {activeProcessing.status === 'processing' && (
                    <div className="mt-3">
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(activeProcessing)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/ddcs/${ddcId}/results`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver en Historial
                    </Button>
                    <p className="text-xs text-yellow-700">
                      Debes esperar a que termine este procesamiento antes de iniciar uno nuevo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loader simple durante procesamiento */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">
                  Procesando CVs...
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Los CVs se están procesando en paralelo con reintentos automáticos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la DDC */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Estado de la DDC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CVs disponibles:</span>
                <Badge variant="outline">{cvs.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Procesamientos:</span>
                <Badge variant="outline">{processings.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <Badge className={
                  ddc?.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }>
                  {ddc?.status === 'open' ? 'Abierto' : 'Cerrado'}
                </Badge>
              </div>
              {activeProcessing && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Procesamiento activo:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {activeProcessing.status === 'pending' ? 'Pendiente' : 'Procesando'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial de Procesamientos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay procesamientos previos
                </p>
              ) : (
                <div className="space-y-3">
                  {processings.slice(0, 5).map((processing) => (
                    <div key={processing.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{processing.name}</span>
                        {getStatusBadge(processing.status)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(processing.started_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {processing.processed_count}/{processing.cv_count} CVs
                      </div>
                      {processing.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => router.push(`/dashboard/ddcs/${ddcId}/results/${processing.id}`)}
                        >
                          Ver Resultados
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuración de Procesamiento */}
        <div className="lg:col-span-2">
          {cvs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No hay CVs para procesar
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Necesitas al menos un CV para iniciar un procesamiento
                </p>
                <Button
                  onClick={() => router.push(`/dashboard/ddcs/${ddcId}/cvs`)}
                >
                  Gestionar CVs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ProcessingConfig
              ddcId={ddcId}
              onProcessingStart={handleProcessingStart}
              isLoading={isProcessing}
              disabled={!!activeProcessing}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProcessDDCPage