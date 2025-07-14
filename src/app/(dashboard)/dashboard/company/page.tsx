'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Company } from '@/types'
import { 
  Building, 
  Palette, 
  Upload, 
  Save,
  Bell,
  Settings,
  Globe,
  Mail
} from 'lucide-react'

interface CompanyFormData {
  name: string
  description: string
  website: string
  primary_color: string
  secondary_color: string
  logo_file?: File
}

interface NotificationSettings {
  email_notifications: boolean
  processing_updates: boolean
  weekly_reports: boolean
}

const CompanySettingsPage = () => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    website: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF'
  })
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    processing_updates: true,
    weekly_reports: false
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const { data: company, isLoading } = useQuery({
    queryKey: ['company'],
    queryFn: () => api.getCompany(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Company>) => api.updateCompany(data),
    onSuccess: () => {
      toast.success("Configuración actualizada", {
        description: "Los datos de la empresa han sido guardados"
      })
      queryClient.invalidateQueries({ queryKey: ['company'] })
    },
    onError: (error: any) => {
      toast.error("Error al actualizar", {
        description: error.message || "No se pudieron guardar los cambios"
      })
    }
  })

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => api.uploadCompanyLogo(file.name, file),
    onSuccess: (response) => {
      setFormData(prev => ({
        ...prev,
        logo_url: response.logo_url
      }))
      toast.success("Logo subido", {
        description: "El logo de la empresa ha sido actualizado"
      })
    },
    onError: (error: any) => {
      toast.error("Error al subir logo", {
        description: error.message || "No se pudo subir el logo"
      })
    }
  })

  const updateNotificationsMutation = useMutation({
    mutationFn: (settings: NotificationSettings) => api.updateNotificationSettings(settings),
    onSuccess: () => {
      toast.success("Notificaciones actualizadas", {
        description: "Las preferencias de notificaciones han sido guardadas"
      })
    },
    onError: (error: any) => {
      toast.error("Error al actualizar notificaciones", {
        description: error.message || "Error al actualizar las notificaciones"
      })
    }
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        primary_color: company.primary_color || '#3B82F6',
        secondary_color: company.secondary_color || '#1E40AF'
      })
      setLogoPreview(company.logo_url || null)
    }
  }, [company])

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error("Archivo no válido", {
          description: "Solo se permiten archivos de imagen"
        })
        return
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Archivo muy grande", {
          description: "La imagen no debe superar los 5MB"
        })
        return
      }
      
      setLogoFile(file)
      setFormData(prev => ({
        ...prev,
        logo_file: file
      }))
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Nombre requerido", {
        description: "Por favor ingresa el nombre de la empresa"
      })
      return
    }

    updateMutation.mutate(formData)
  }

  const handleSubmitNotifications = (e: React.FormEvent) => {
    e.preventDefault()
    updateNotificationsMutation.mutate(notificationSettings)
  }

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = async (file: File) => {
    uploadLogoMutation.mutate(file)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Configuración de Empresa</h1>
          <p className="text-gray-600">
            Configura la información y branding de tu empresa
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Información General
              </CardTitle>
              <CardDescription>
                Datos básicos de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input
                    id="name"
                    placeholder="Nombre de tu empresa"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descripción de tu empresa"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://tuempresa.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Información'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Branding
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de tus páginas públicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la Empresa</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <p className="text-sm text-gray-500">
                  Formatos soportados: JPG, PNG, GIF. Máximo 5MB.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Color Primario</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Color Secundario</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitNotifications} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                      <p className="text-sm text-gray-500">
                        Recibe notificaciones importantes por correo electrónico
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="processing-updates">Actualizaciones de Procesamiento</Label>
                      <p className="text-sm text-gray-500">
                        Notificaciones cuando se completen los procesamientos
                      </p>
                    </div>
                    <Switch
                      id="processing-updates"
                      checked={notificationSettings.processing_updates}
                      onCheckedChange={(checked) => handleNotificationChange('processing_updates', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-reports">Reportes Semanales</Label>
                      <p className="text-sm text-gray-500">
                        Resumen semanal de actividad y métricas
                      </p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={notificationSettings.weekly_reports}
                      onCheckedChange={(checked) => handleNotificationChange('weekly_reports', checked)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateNotificationsMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateNotificationsMutation.isPending ? 'Guardando...' : 'Guardar Preferencias'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                Así se verá tu branding en las páginas públicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="rounded-lg p-4 border"
                style={{ 
                  backgroundColor: formData.primary_color + '10',
                  borderColor: formData.primary_color + '40'
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center text-white"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      <Building className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{formData.name || 'Nombre de la Empresa'}</h3>
                    <p className="text-sm text-gray-600">
                      {formData.description || 'Descripción de la empresa'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    size="sm"
                    style={{ 
                      backgroundColor: formData.primary_color,
                      borderColor: formData.primary_color
                    }}
                    className="w-full"
                  >
                    Postular a esta posición
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    style={{ 
                      borderColor: formData.secondary_color,
                      color: formData.secondary_color
                    }}
                    className="w-full"
                  >
                    Ver más información
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CompanySettingsPage 