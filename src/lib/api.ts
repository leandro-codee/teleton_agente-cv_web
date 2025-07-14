import { User, CV, DDC, Company, CompanySettings, NotificationSettings, CVAnalysis, Processing, ProcessingParams, ProcessingResponse, CVResult, CreatedDDC, CVToDDC, BulkUploadResponse } from '@/types'
import { PROCESSING_CONFIG } from '@/lib/constants'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new ApiError(response.status, error.error || 'Unknown error')
  }

  return response.json()
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetchApi('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return response
  },

  register: async (email: string, password: string, full_name: string, company_name: string) => {
    return fetchApi('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, company_name }),
    })
  },

  logout: () => {
    localStorage.removeItem('auth_token')
  },

  // DDCs
  getDDCs: async (): Promise<DDC[]> => {
    return fetchApi('/v1/ddcs')
  },

  getDDC: async (id: string): Promise<DDC> => {
    return fetchApi(`/v1/ddcs/${id}`)
  },

  getDDCCVs: async (ddcId: string): Promise<CVToDDC[]> => {
    return fetchApi(`/v1/ddcs/${ddcId}/cvs`)
  },

  getDDCProcessings: async (ddcId: string): Promise<Processing[]> => {
    return fetchApi(`/v1/ddcs/${ddcId}/processings`)
  },

  createDDC: async (data: {
    title: string
    description: string
    requirements: string
    status?: string
    storage_path?: string
    custom_branding?: any
  }): Promise<CreatedDDC> => {
    return fetchApi('/v1/ddcs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateDDC: async (id: string, data: Partial<DDC>): Promise<DDC> => {
    return fetchApi(`/v1/ddcs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteDDC: async (id: string): Promise<void> => {
    return fetchApi(`/v1/ddcs/${id}`, {
      method: 'DELETE',
    })
  },

  toggleDDCStatus: async (id: string): Promise<void> => {
    return fetchApi(`/v1/ddcs/${id}/toggle-status`, {
      method: 'PUT',
    })
  },

  updateDDCStatus: async (id: string, status: string): Promise<void> => {
    return fetchApi(`/v1/ddcs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },

  uploadDDC: async (filename: string, file: File): Promise<{ storage_path: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/v1/ddcs/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al subir archivo')
    }

    return response.json()
  },

  updateDDCFile: async (ddcId: string, filename: string, file: File): Promise<{ storage_path: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/v1/ddcs/${ddcId}/upload-file`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al subir archivo')
    }

    return response.json()
  },

  // CVs
  uploadCV: async (filename: string, gcsPath: string) => {
    return fetchApi('/v1/cvs/upload', {
      method: 'POST',
      body: JSON.stringify({ filename, gcs_path: gcsPath }),
    })
  },

  uploadCVsBulk: async (ddcId: string, files: File[]): Promise<BulkUploadResponse> => {
    const formData = new FormData()
    formData.append('ddc_id', ddcId)
    
    files.forEach((file) => {
      formData.append('files', file)
    })

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/v1/cvs/upload-bulk`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al subir archivos')
    }

    return response.json()
  },

  uploadCVsBatch: async (cvFiles: Array<{ filename: string; gcs_path: string }>) => {
    return fetchApi('/v1/cvs/upload-batch', {
      method: 'POST',
      body: JSON.stringify({ cv_files: cvFiles }),
    })
  },

  getCVByUuid: async (uuid: string): Promise<CV> => {
    return fetchApi(`/v1/cvs/${uuid}`)
  },

  getCVSignedUrl: async (cvId: string): Promise<{ signed_url: string }> => {
    return fetchApi(`/v1/cvs/${cvId}/signed-url`)
  },

  removeCVFromDDC: async (cvId: string, ddcId: string): Promise<void> => {
    return fetchApi(`/v1/cvs/${cvId}/remove-from-ddc`, {
      method: 'DELETE',
      body: JSON.stringify({ ddc_id: ddcId }),
    })
  },

  reuseCVs: async (sourceDDCId: string, targetDDCId: string): Promise<void> => {
    return fetchApi('/v1/cvs/reuse', {
      method: 'POST',
      body: JSON.stringify({ source_ddc_id: sourceDDCId, target_ddc_id: targetDDCId }),
    })
  },

  // Processing
  processCVs: async (params: ProcessingParams): Promise<ProcessingResponse> => {
    return fetchApi('/v1/processing/start', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  finishProcessing: async (processingId: string): Promise<any> => {
    return fetchApi(`/v1/processing/${processingId}/finish`, {
      method: 'POST',
    })
  },

  processCVBatch: async (batchData: {
    processing_id: string
    ddc_id: string
    cv_ids: string[]
    batch_index: number
    total_batches: number
    weights: {
      profession: number
      experience: number
      skills: number
    }
  }): Promise<any> => {
    const workerUrl = PROCESSING_CONFIG.WORKER_URL
    
    console.log('Enviando petición al worker:', {
      url: `${workerUrl}/process-cvs`,
      data: batchData
    })
    
    const response = await fetch(`${workerUrl}/process-cvs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(batchData),
    })

    console.log('Respuesta del worker:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error del worker:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Resultado del worker:', result)
    return result
  },

  getProcessingStatus: async (processingId: string): Promise<Processing> => {
    return fetchApi(`/v1/processing/${processingId}`)
  },

  getProcessingResults: async (
    processingId: string,
    options?: {
      page?: number
      page_size?: number
      search?: string
      sort_field?: string
      sort_direction?: string
    }
  ): Promise<{
    results: CVAnalysis[]
    total: number
    processing: Processing
  }> => {
    let query = ''
    if (options) {
      const params = new URLSearchParams()
      if (options.page) params.append('page', options.page.toString())
      if (options.page_size) params.append('page_size', options.page_size.toString())
      if (options.search) params.append('search', options.search)
      if (options.sort_field) params.append('sort_field', options.sort_field)
      if (options.sort_direction) params.append('sort_direction', options.sort_direction)
      query = '?' + params.toString()
    }
    return fetchApi(`/v1/processing/${processingId}/results${query}`)
  },

  exportProcessingResults: async (processingId: string, format: 'csv' | 'excel'): Promise<Blob> => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/v1/export/processing/${processingId}/${format}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    
    if (!response.ok) {
      throw new Error('Error exporting results')
    }
    
    return response.blob()
  },

  exportDDCCVs: async (ddcId: string, format: 'csv' | 'excel'): Promise<Blob> => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/v1/export/ddc/${ddcId}/cvs/${format}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    
    if (!response.ok) {
      throw new Error('Error exporting DDC CVs')
    }
    
    return response.blob()
  },

  // Company
  getCompany: async (): Promise<Company> => {
    return fetchApi('/v1/company')
  },

  updateCompany: async (data: Partial<Company>): Promise<Company> => {
    return fetchApi('/v1/company', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  uploadCompanyLogo: async (filename: string, file: File): Promise<{ logo_url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)

    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/v1/company/logo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al subir logo')
    }

    return response.json()
  },

  getCompanySettings: async (): Promise<CompanySettings> => {
    return fetchApi('/v1/company/settings')
  },

  updateNotificationSettings: async (data: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    return fetchApi('/v1/company/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Notifications
  getNotifications: async (): Promise<any[]> => {
    return fetchApi('/v1/notifications')
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    return fetchApi(`/v1/notifications/${notificationId}/mark-read`, {
      method: 'POST',
    })
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    return fetchApi(`/v1/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  },

  // Export
  exportCSV: async (): Promise<Blob> => {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${API_BASE_URL}/v1/export/csv`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    
    if (!response.ok) {
      throw new Error('Error exporting CSV')
    }
    
    return response.blob()
  },

  // Status
  getStatus: async () => {
    return fetchApi('/v1/status')
  },

  // Public endpoints
  getPublicDDC: async (uuid: string) => {
    const response = await fetch(`${API_BASE_URL}/v1/public/ddc/${uuid}`)
    if (!response.ok) {
      throw new Error('DDC no encontrada')
    }
    return response.json()
  },

  getCompanyBranding: async (companyId: string) => {
    const response = await fetch(`${API_BASE_URL}/v1/public/company/${companyId}/branding`)
    if (!response.ok) {
      throw new Error('Información de empresa no encontrada')
    }
    return response.json()
  },

  submitPublicApplication: async (ddcUuid: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/v1/public/ddc/${ddcUuid}/apply`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al enviar la postulación')
    }
    
    return response.json()
  },
}