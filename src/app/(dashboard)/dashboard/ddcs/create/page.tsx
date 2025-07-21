'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { ArrowLeft, Upload, Save } from 'lucide-react'

interface DDCFormData {
  title: string
  description: string
  requirements: string
  status: 'draft' | 'open' | 'closed'
  file?: File
}

const CreateDDCPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<DDCFormData>({
    title: '',
    description: '',
    requirements: '',
    status: 'draft'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const createDDCMutation = useMutation({
    mutationFn: (data: DDCFormData) => api.createDDC(data),
    onSuccess: async (ddc) => {
      // Si hay un archivo seleccionado, subirlo por separado
      if (selectedFile) {
        try {
          await api.updateDDCFile(ddc.ddc.id, selectedFile.name, selectedFile)
          toast.success("DDC creada exitosamente", {
            description: `La DDC "${ddc.ddc.title}" ha sido creada con archivo adjunto`
          })
        } catch (error) {
          toast.success("DDC creada exitosamente", {
            description: `La DDC "${ddc.ddc.title}" ha sido creada (error al subir archivo)`
          })
        }
      } else {
        toast.success("DDC creada exitosamente", {
          description: `La DDC "${ddc.ddc.title}" ha sido creada`
        })
      }
      router.push('/dashboard/ddcs')
    },
    onError: (error: any) => {
      toast.error("Error al crear DDC", {
        description: error.message || "Hubo un problema al guardar la DDC"
      })
    }
  })

  const handleInputChange = (field: keyof DDCFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error("Archivo no válido", {
          description: "Solo se permiten archivos PDF, DOC y DOCX"
        })
        return
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Archivo muy grande", {
          description: "El archivo no debe superar los 10MB"
        })
        return
      }
      
      setSelectedFile(file)
      setFormData(prev => ({
        ...prev,
        file: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Título requerido", {
        description: "Por favor ingresa el título del cargo"
      })
      return
    }

    if (!formData.description.trim()) {
      toast.error("Descripción requerida", {
        description: "Por favor ingresa la descripción del cargo"
      })
      return
    }

    if (!formData.requirements.trim()) {
      toast.error("Requisitos requeridos", {
        description: "Por favor ingresa los requisitos del cargo"
      })
      return
    }

    // Preparar datos sin el archivo para el JSON
    const ddcData = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      status: formData.status
    }

    createDDCMutation.mutate(ddcData)
  }

  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, status: 'draft' }))
    setTimeout(() => {
      document.getElementById('submit-form')?.click()
    }, 100)
  }

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, status: 'open' }))
    setTimeout(() => {
      document.getElementById('submit-form')?.click()
    }, 100)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nueva DDC</h1>
          <p className="text-gray-600">
            Crea una nueva DDC para revisar CVs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            {/* <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Define los detalles principales de la posición
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Cargo *</Label>
              <Input
                id="title"
                placeholder="Ej: Desarrollador Full Stack Senior"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Cargo *</Label>
              <Textarea
                id="description"
                placeholder="Describe las responsabilidades principales, el perfil de la empresa, etc."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Ingrese requisitos especiales *</Label>
              <Textarea
                id="requirements"
                placeholder="Deseable experiencia el sector salud, experiencia en procesos de acreditación o certificación, etc."
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingrese el archivo de la DDC *</CardTitle>
            <CardDescription>
              Obligatorio, sube un archivo PDF/DOC con detalles adicionales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="file">Archivo DDC (PDF, DOC, DOCX)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comentado temporalmente: Sección de Estado de Publicación
        <Card>
          <CardHeader>
            <CardTitle>Estado de Publicación</CardTitle>
            <CardDescription>
              Controla si la DDC está disponible para postulaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador (no visible públicamente)</SelectItem>
                  <SelectItem value="open">Abierto (acepta postulaciones)</SelectItem>
                  <SelectItem value="closed">Cerrado (no acepta postulaciones)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        */}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={createDDCMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={createDDCMutation.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {createDDCMutation.isPending ? 'Creando...' : 'Publicar DDC'}
          </Button>
          <button
            id="submit-form"
            type="submit"
            style={{ display: 'none' }}
          />
        </div>
      </form>
    </div>
  )
}

export default CreateDDCPage 