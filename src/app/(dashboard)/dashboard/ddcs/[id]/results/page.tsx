'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Users, 
  XCircle, 
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react'
import { api } from '@/lib/api'
import { Processing } from '@/types'

const DDCResultsPage = () => {
  const params = useParams()
  const router = useRouter()
  const ddcId = params.id as string

  const { data: ddc } = useQuery({
    queryKey: ['ddc', ddcId],
    queryFn: () => api.getDDC(ddcId),
  })

  const { data: processings = [], isLoading } = useQuery({
    queryKey: ['ddc-processings', ddcId],
    queryFn: () => api.getDDCProcessings(ddcId),
  })

  const queryClient = useQueryClient()

  const cancelProcessingMutation = useMutation({
    mutationFn: (processingId: string) => api.cancelProcessing(processingId),
    onSuccess: (data, processingId) => {
      toast.success("Procesamiento cancelado", {
        description: data.message || "El procesamiento ha sido cancelado exitosamente",
      })
      // Refrescar la lista de procesamientos
      queryClient.invalidateQueries({ queryKey: ['ddc-processings', ddcId] })
    },
    onError: (error: any) => {
      toast.error("Error al cancelar procesamiento", {
        description: error.message || "No se pudo cancelar el procesamiento",
      })
    },
  })

  const handleCancelProcessing = (processing: Processing) => {
    if (processing.status !== 'pending' && processing.status !== 'processing') {
      toast.error("No se puede cancelar", {
        description: "Solo se pueden cancelar procesamientos pendientes o en proceso",
      })
      return
    }

    if (confirm(`¿Estás seguro de que quieres cancelar el procesamiento "${processing.name}"?`)) {
      cancelProcessingMutation.mutate(processing.id)
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'cancelled':
        return <X className="h-5 w-5 text-gray-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getProgressPercentage = (processing: Processing) => {
    if (processing.cv_count === 0) return 0
    return Math.round(((processing.processed_count + processing.failed_count) / processing.cv_count) * 100)
  }

  const getDuration = (processing: Processing) => {
    if (!processing.completed_at) return 'En progreso'
    
    const start = new Date(processing.started_at)
    const end = new Date(processing.completed_at)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.round(diffMs / 60000)
    
    if (diffMins < 60) {
      return `${diffMins} minutos`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}m`
    }
  }

  const handleViewResults = (processing: Processing) => {
    router.push(`/dashboard/ddcs/${ddcId}/results/${processing.id}`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Resultados de Procesamiento</h1>
          <p className="text-gray-600">
            {ddc?.title || 'Cargando...'}
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Procesamientos</p>
                <p className="text-2xl font-bold">{processings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completados</p>
                <p className="text-2xl font-bold">
                  {processings.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">En Proceso</p>
                <p className="text-2xl font-bold">
                  {processings.filter(p => p.status === 'processing' || p.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">CVs Evaluados</p>
                <p className="text-2xl font-bold">
                  {processings.reduce((sum, p) => sum + p.processed_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Procesamientos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Procesamientos</CardTitle>
          <CardDescription>
            Todas las versiones de procesamiento realizadas para esta DDC
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-4" />
              <p>Cargando procesamientos...</p>
            </div>
          ) : processings.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                No hay procesamientos realizados
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Inicia tu primer procesamiento para ver resultados aquí
              </p>
              <Button
                onClick={() => router.push(`/dashboard/ddcs/${ddcId}/process`)}
              >
                Iniciar Procesamiento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {processings.map((processing) => (
                <div key={processing.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(processing.status)}
                      <div>
                        <h3 className="font-medium">{processing.name}</h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(processing.started_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(processing.status)}
                      {processing.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleViewResults(processing)}
                        >
                          Ver Resultados
                        </Button>
                      )}
                      {(processing.status === 'pending' || processing.status === 'processing') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelProcessing(processing)}
                          disabled={cancelProcessingMutation.isPending}
                        >
                          {cancelProcessingMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">CVs Procesados</p>
                      <p className="font-medium">
                        {processing.processed_count}/{processing.cv_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Progreso</p>
                      <p className="font-medium">{getProgressPercentage(processing)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duración</p>
                      <p className="font-medium">{getDuration(processing)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Configuración</p>
                      <p className="font-medium text-xs">
                        P:{processing.profession_weight}% | 
                        E:{processing.experience_weight}% | 
                        H:{processing.skills_weight}%
                      </p>
                    </div>
                  </div>

                  {processing.status === 'processing' && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(processing)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {processing.status === 'failed' && processing.error_message && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <strong>Error:</strong> {processing.error_message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DDCResultsPage 