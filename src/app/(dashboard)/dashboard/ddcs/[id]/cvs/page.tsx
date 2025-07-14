'use client'

import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { CVToDDC, BulkUploadResponse } from '@/types'
import { Upload, Eye, ExternalLink, Trash2, ArrowLeft, FileText, Download } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const ManageCVsPage = () => {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const ddcId = params.id as string
  const [uploading, setUploading] = useState(false)

  const { data: ddc } = useQuery({
    queryKey: ['ddc', ddcId],
    queryFn: () => api.getDDC(ddcId),
  })

  const { data: cvs = [], refetch } = useQuery({
    queryKey: ['ddc-cvs', ddcId],
    queryFn: () => api.getDDCCVs(ddcId),
  })

  const uploadMutation = useMutation({
    mutationFn: api.uploadCVsBatch,
    onSuccess: (response) => {
      toast.success("CVs subidos exitosamente", {
        description: `${response.successful} de ${response.total_files} archivos procesados correctamente`
      })
      queryClient.invalidateQueries({ queryKey: ['ddc-cvs', ddcId] })
    },
    onError: (error: any) => {
      toast.error("Error al subir CVs", {
        description: error.message || "Hubo un problema al procesar los archivos"
      })
    }
  })

  const removeCVMutation = useMutation({
    mutationFn: (cvId: string) => api.removeCVFromDDC(cvId, ddcId),
    onSuccess: () => {
      toast.success("CV removido", {
        description: "El CV ha sido removido de esta DDC"
      })
      queryClient.invalidateQueries({ queryKey: ['ddc-cvs', ddcId] })
    },
    onError: (error: any) => {
      toast.error("Error al remover CV", {
        description: error.message || "No se pudo remover el CV"
      })
    }
  })

  const exportMutation = useMutation({
    mutationFn: ({ format }: { format: 'csv' | 'excel' }) => 
      api.exportDDCCVs(ddcId, format),
    onSuccess: (response, { format }) => {
      // Crear y descargar el archivo
      const blob = new Blob([response], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cvs_ddc_${ddc?.title || 'ddc'}_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Exportación exitosa", {
        description: `Archivo ${format.toUpperCase()} descargado`
      })
    },
    onError: (error: any) => {
      toast.error("Error al exportar CVs", {
        description: error.message || "Error al exportar CVs"
      })
    }
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    
    try {
      console.log('Iniciando upload de', acceptedFiles.length, 'archivos')
      const response = await api.uploadCVsBulk(ddcId, acceptedFiles)
      console.log('Respuesta del servidor:', response)
      
      toast.success("Upload completado", {
        description: `${response.successful} de ${response.total_files} archivos subidos exitosamente`
      })
      
      if (response.failed > 0) {
        console.log('Archivos fallidos:', response.results.filter((r: any) => r.status === 'error'))
      }
      
      refetch()
    } catch (error: any) {
      console.error('Error en upload:', error)
      toast.error("Error al subir archivos", {
        description: error.message || "Error al subir archivos"
      })
    } finally {
      setUploading(false)
    }
  }, [ddcId, refetch])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  })

  const handleViewCV = async (cv: CVToDDC, mode: 'modal' | 'tab') => {
    try {
      const response = await api.getCVSignedUrl(cv.cv_id)
      
      if (mode === 'tab') {
        window.open(response.signed_url, '_blank')
      } else {
        // Implementar modal para visualizar CV
        // Por ahora, abrir en nueva pestaña
        window.open(response.signed_url, '_blank')
      }
    } catch (error) {
      toast.error("Error al obtener el CV", {
        description: "No se pudo obtener el CV"
      })
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const getUploadSourceBadge = (source: string) => {
    switch (source) {
      case 'public':
        return <Badge variant="default">Postulación Pública</Badge>
      case 'bulk_upload':
        return <Badge variant="secondary">Upload Masivo</Badge>
      case 'cv_reuse':
        return <Badge variant="outline">Reutilizado</Badge>
      default:
        return <Badge variant="outline">{source}</Badge>
    }
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Gestionar CVs</h1>
          <p className="text-gray-600">
            {ddc?.title || 'Cargando...'}
          </p>
        </div>
        {cvs.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            {/* <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={exportMutation.isPending}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button> */}
          </div>
        )}
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Masivo de CVs</CardTitle>
          <CardDescription>
            Arrastra y suelta archivos PDF, DOC o DOCX para subir múltiples CVs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {uploading ? (
              <p className="text-lg font-medium">Subiendo archivos...</p>
            ) : isDragActive ? (
              <p className="text-lg font-medium">Suelta los archivos aquí...</p>
            ) : (
              <div>
                <p className="text-lg font-medium">
                  Arrastra y suelta archivos aquí, o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Soporta PDF, DOC, DOCX. Máximo 10MB por archivo.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CVs Table */}
      <Card>
        <CardHeader>
          <CardTitle>CVs Recibidos ({cvs.length})</CardTitle>
          <CardDescription>
            Lista de todos los CVs asociados a esta DDC
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cvs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600">
                No hay CVs para esta DDC
              </p>
              <p className="text-sm text-gray-500">
                Sube archivos usando el área de upload o espera postulaciones públicas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Archivo</th>
                    <th className="text-left p-3">Candidato</th>
                    <th className="text-left p-3">Origen</th>
                    <th className="text-left p-3">Tamaño</th>
                    <th className="text-left p-3">Fecha</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cvs.map((cvRelation) => (
                    <tr key={cvRelation.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {cvRelation.cv?.original_filename || 'Archivo sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cvRelation.cv?.mime_type}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {cvRelation.cv?.candidate_name || 'Nombre no extraído'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cvRelation.cv?.candidate_email || 'Email no disponible'}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {getUploadSourceBadge(cvRelation.upload_source)}
                      </td>
                      <td className="p-3">
                        {formatFileSize(cvRelation.cv?.file_size || 0)}
                      </td>
                      <td className="p-3">
                        {formatDate(cvRelation.uploaded_at)}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCV(cvRelation, 'modal')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCV(cvRelation, 'tab')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveCV(cvRelation.cv_id)}
                            disabled={removeCVMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ManageCVsPage 