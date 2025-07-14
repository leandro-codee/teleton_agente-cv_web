'use client'

import React, { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { DDC, Company } from '@/types'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import CompanyHeader from '@/components/public/CompanyHeader'

interface ApplicationFormData {
  candidate_name: string
  candidate_email: string
  candidate_phone: string
  motivation_letter: string
  cv_file: File | null
}

const PublicDDCPage = () => {
  const params = useParams()
  const router = useRouter()
  const ddcUuid = params.uuid as string

  const [formData, setFormData] = useState<ApplicationFormData>({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    motivation_letter: '',
    cv_file: null
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: ddcData, isLoading: isDDCLoading } = useQuery({
    queryKey: ['public-ddc', ddcUuid],
    queryFn: () => api.getPublicDDC(ddcUuid),
    retry: 1
  })

  const { data: companyBranding } = useQuery({
    queryKey: ['company-branding', ddcData?.company_id],
    queryFn: () => api.getCompanyBranding(ddcData?.company_id),
    enabled: !!ddcData?.company_id
  })

  const submitApplicationMutation = useMutation({
    mutationFn: (data: FormData) => api.submitPublicApplication(ddcUuid, data),
    onSuccess: (response) => {
      toast.success("Postulación enviada exitosamente", {
        description: "Hemos recibido tu CV. Te contactaremos pronto."
      })
      router.push(`/ddc/${ddcUuid}/success?ref=${response.reference_number}`)
    },
    onError: (error: any) => {
      toast.error("Error al enviar postulación", {
        description: error.message || "Hubo un problema al procesar tu aplicación"
      })
      setIsSubmitting(false)
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setCvFile(file)
      setFormData(prev => ({
        ...prev,
        cv_file: file
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    multiple: false
  })

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cvFile) {
      toast.error("CV requerido", {
        description: "Por favor sube tu CV para completar la postulación"
      })
      return
    }

    if (!formData.candidate_name.trim()) {
      toast.error("Nombre requerido", {
        description: "Por favor ingresa tu nombre completo"
      })
      return
    }

    if (!formData.candidate_email.trim()) {
      toast.error("Email requerido", {
        description: "Por favor ingresa tu email de contacto"
      })
      return
    }

    setIsSubmitting(true)

    const formDataToSend = new FormData()
    formDataToSend.append('candidate_name', formData.candidate_name)
    formDataToSend.append('candidate_email', formData.candidate_email)
    formDataToSend.append('candidate_phone', formData.candidate_phone)
    formDataToSend.append('motivation_letter', formData.motivation_letter)
    formDataToSend.append('cv_file', cvFile)

    submitApplicationMutation.mutate(formDataToSend)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Abierto para postulaciones
          </Badge>
        )
      case 'closed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Proceso cerrado
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            No disponible
          </Badge>
        )
    }
  }

  // Loading state
  if (isDDCLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del cargo...</p>
        </div>
      </div>
    )
  }

  // Error state - DDC not found
  if (!ddcData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cargo no encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            La oferta de trabajo que buscas no existe o ha sido eliminada.
          </p>
          <Button onClick={() => window.history.back()}>
            Volver atrás
          </Button>
        </div>
      </div>
    )
  }

  // Closed DDC state
  if (ddcData.status === 'closed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <CompanyHeader company={companyBranding} />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Proceso de Selección Cerrado
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Lamentamos informarte que el proceso de selección para <strong>{ddcData.title}</strong> ha sido cerrado.
            </p>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Detalles del Cargo</h2>
              <div className="text-left space-y-2">
                <p><strong>Posición:</strong> {ddcData.title}</p>
                <p><strong>Estado:</strong> {getStatusDisplay(ddcData.status)}</p>
                <p><strong>Empresa:</strong> {companyBranding?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyHeader company={companyBranding} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header del cargo */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {ddcData.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{companyBranding?.name}</span>
                  </div>
                  {companyBranding?.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <a 
                        href={companyBranding.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Sitio web
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusDisplay(ddcData.status)}
              </div>
            </div>
            
            {companyBranding?.description && (
              <p className="text-gray-600 mb-4">
                {companyBranding.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información del cargo */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Cargo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {ddcData.description}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {ddcData.requirements}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulario de postulación */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Postular a este cargo</CardTitle>
                  <CardDescription>
                    Completa el formulario para enviar tu postulación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidate_name">Nombre completo *</Label>
                      <Input
                        id="candidate_name"
                        placeholder="Tu nombre completo"
                        value={formData.candidate_name}
                        onChange={(e) => handleInputChange('candidate_name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="candidate_email">Email *</Label>
                      <Input
                        id="candidate_email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.candidate_email}
                        onChange={(e) => handleInputChange('candidate_email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="candidate_phone">Teléfono</Label>
                      <Input
                        id="candidate_phone"
                        type="tel"
                        placeholder="+56 9 1234 5678"
                        value={formData.candidate_phone}
                        onChange={(e) => handleInputChange('candidate_phone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivation_letter">Carta de motivación</Label>
                      <Textarea
                        id="motivation_letter"
                        placeholder="Cuéntanos por qué te interesa esta posición..."
                        value={formData.motivation_letter}
                        onChange={(e) => handleInputChange('motivation_letter', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>CV / Currículum Vitae *</Label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {cvFile ? (
                          <div className="space-y-2">
                            <FileText className="mx-auto h-8 w-8 text-green-600" />
                            <p className="text-sm font-medium">{cvFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(cvFile.size)}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="text-sm font-medium">
                              {isDragActive
                                ? 'Suelta tu CV aquí...'
                                : 'Arrastra tu CV aquí o haz clic para seleccionar'
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, DOC, DOCX (máx. 10MB)
                            </p>
                          </div>
                        )}
                      </div>
                      {fileRejections.length > 0 && (
                        <div className="text-sm text-red-600">
                          {fileRejections[0].errors[0].message}
                        </div>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                      style={{ 
                        backgroundColor: companyBranding?.primary_color || '#3B82F6',
                        borderColor: companyBranding?.primary_color || '#3B82F6'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Postulación'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicDDCPage 