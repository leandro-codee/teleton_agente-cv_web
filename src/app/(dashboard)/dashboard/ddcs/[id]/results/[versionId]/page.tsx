'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { CVAnalysis } from '@/types'
import ResultsTable from '@/components/dashboard/ResultsTable'
import { ArrowLeft, TrendingUp, Users, Target, Award } from 'lucide-react'

const ProcessingResultsPage = () => {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const ddcId = params.id as string
  const versionId = params.versionId as string

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('total_score')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data: ddc } = useQuery({
    queryKey: ['ddc', ddcId],
    queryFn: () => api.getDDC(ddcId),
  })

  const { data: processing } = useQuery({
    queryKey: ['processing', versionId],
    queryFn: () => api.getProcessingStatus(versionId),
  })

  const { data: resultsData, isLoading } = useQuery({
    queryKey: ['processing-results', versionId, currentPage, pageSize, searchQuery, sortField, sortDirection],
    queryFn: () => api.getProcessingResults(versionId, {
      page: currentPage,
      page_size: pageSize,
      search: searchQuery,
      sort_field: sortField,
      sort_direction: sortDirection
    }),
  })

  const exportMutation = useMutation({
    mutationFn: ({ format }: { format: 'csv' | 'excel' }) => 
      api.exportProcessingResults(versionId, format),
    onSuccess: (response, { format }) => {
      // Crear y descargar el archivo
      const blob = new Blob([response], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resultados_${processing?.name || 'procesamiento'}_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Exportación exitosa", {
        description: `Archivo ${format.toUpperCase()} descargado`
      })
    },
    onError: (error: any) => {
      toast.error("Error al exportar resultados", {
        description: error.message || "Error al exportar resultados"
      })
    }
  })

  const removeCVMutation = useMutation({
    mutationFn: (cvId: string) => api.removeCVFromDDC(cvId, ddcId),
    onSuccess: () => {
      toast.success("CV eliminado", {
        description: "El CV ha sido removido de esta DDC"
      })
      queryClient.invalidateQueries({ queryKey: ['processing-results', versionId] })
    },
    onError: (error: any) => {
      toast.error("Error al eliminar el CV", {
        description: error.message || "Error al eliminar el CV"
      })
    }
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handleViewCV = async (result: CVAnalysis, mode: 'modal' | 'tab') => {
    try {
      const response = await api.getCVSignedUrl(result.cv_id)
      
      if (mode === 'tab') {
        window.open(response.signed_url, '_blank')
      } else {
        // Implementar modal para visualizar CV
        window.open(response.signed_url, '_blank')
      }
    } catch (error) {
      toast.error("No se pudo obtener el CV")
    }
  }

  const handleRemoveCV = (cvId: string) => {
    if (confirm('¿Estás seguro de que quieres remover este CV de la DDC?')) {
      removeCVMutation.mutate(cvId)
    }
  }

  const handleExport = (format: 'csv' | 'excel') => {
    exportMutation.mutate({ format })
  }

  const results = resultsData?.results || []
  const total = resultsData?.total || 0

  // Calcular estadísticas
  const getStatistics = () => {
    if (results.length === 0) return { average: 0, top10: 0, above70: 0 }
    
    const scores = results.map(r => r.total_score)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const top10Percent = Math.ceil(results.length * 0.1)
    const above70 = results.filter(r => r.total_score >= 70).length
    
    return {
      average: Math.round(average),
      top10: top10Percent,
      above70
    }
  }

  const stats = getStatistics()

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
          <h1 className="text-3xl font-bold">Resultados Detallados</h1>
          <p className="text-gray-600">
            {ddc?.title} - {processing?.name}
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">CVs Evaluados</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Promedio</p>
                <p className="text-2xl font-bold">{stats.average}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Sobre 70%</p>
                <p className="text-2xl font-bold">{stats.above70}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Configuración</p>
                <p className="text-xs font-medium">
                  P:{processing?.profession_weight}% | 
                  E:{processing?.experience_weight}% | 
                  H:{processing?.skills_weight}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del Procesamiento */}
      {processing && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Procesamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Iniciado</p>
                <p>{new Date(processing.started_at).toLocaleString('es-ES')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Completado</p>
                <p>
                  {processing.completed_at 
                    ? new Date(processing.completed_at).toLocaleString('es-ES')
                    : 'En progreso'
                  }
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Estado</p>
                <Badge className={
                  processing.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }>
                  {processing.status === 'completed' ? 'Completado' : 'En progreso'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Resultados */}
      <ResultsTable
        results={results}
        total={total}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onSort={handleSort}
        onViewCV={handleViewCV}
        onRemoveCV={handleRemoveCV}
        onExport={handleExport}
        isLoading={isLoading}
      />
    </div>
  )
}

export default ProcessingResultsPage