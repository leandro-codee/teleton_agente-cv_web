'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, User, Briefcase, Award, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface CVDetailClientProps {
  uuid: string
}

export default function CVDetailClient({ uuid }: CVDetailClientProps) {
  const { data: cvData, isLoading, error } = useQuery({
    queryKey: ['cv', uuid],
    queryFn: () => api.getCVByUuid(uuid),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del CV...</p>
        </div>
      </div>
    )
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center pt-6">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">CV no encontrado</h2>
            <p className="text-gray-600 mb-4">
              El CV con UUID {uuid} no existe o no está disponible.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Información del CV</h1>
            <p className="text-gray-600">UUID: {cvData.uuid}</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Información del Archivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre del archivo</p>
                  <p className="text-sm font-mono">{cvData.original_filename}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de subida</p>
                  <p className="text-sm">{formatDate(cvData.uploaded_at)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Candidato</p>
                  <p className="text-sm">{cvData.candidate_name || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{cvData.candidate_email || 'No especificado'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tamaño del archivo</p>
                  <p className="text-sm">{cvData.file_size} bytes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de archivo</p>
                  <p className="text-sm">{cvData.mime_type}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={cvData.processed_at ? "default" : "secondary"}>
                  {cvData.processed_at ? 'Procesado' : 'Pendiente de procesamiento'}
                </Badge>
                {cvData.processed_at && (
                  <Badge variant="outline">
                    Procesado el {formatDate(cvData.processed_at)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Message */}
          {!cvData.processed_at && (
            <Card>
              <CardContent className="text-center pt-6">
                <div className="animate-pulse">
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  CV en procesamiento
                </h3>
                <p className="text-gray-600">
                  Tu currículum está siendo analizado por nuestro sistema de IA. 
                  Los resultados estarán disponibles pronto.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 