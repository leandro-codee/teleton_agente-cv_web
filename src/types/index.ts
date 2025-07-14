// Tipos base
export interface Company {
  id: string
  name: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  description?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  id: string
  company_id: string
  ai_model: string
  processing_timeout: number
  max_file_size: number
  allowed_file_types: string[]
  notification_email: string
  auto_processing: boolean
  custom_branding_enabled: boolean
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  email_notifications: boolean
  processing_updates: boolean
  weekly_reports: boolean
}

export interface User {
  id: string
  email: string
  full_name: string
  company_id: string
  role: string
  is_active: boolean
  created_at: string
  last_login?: string
  company?: Company
}

export interface DDC {
  id: string
  uuid: string
  title: string
  description: string
  requirements: string
  storage_path: string
  status: 'open' | 'closed' | 'draft'
  company_id: string
  created_by: string
  cv_count: number
  processing_count: number
  custom_branding?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreatedDDC {
  ddc: DDC
  message: string
}

export interface CV {
  id: string
  uuid: string
  original_filename: string
  storage_path: string
  candidate_name?: string
  candidate_email?: string
  file_size: number
  mime_type: string
  uploaded_at: string
  processed_at?: string
  is_active: boolean
}

export interface CVToDDC {
  id: string
  cv_id: string
  ddc_id: string
  upload_source: 'public' | 'bulk_upload' | 'cv_reuse'
  uploaded_by?: string
  uploaded_at: string
  is_active: boolean
  cv?: CV
}

export interface Processing {
  id: string
  ddc_id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  cv_count: number
  processed_count: number
  failed_count: number
  profession_weight: number
  experience_weight: number
  skills_weight: number
  started_at: string
  completed_at?: string
  created_by: string
  error_message?: string
}

export interface CVAnalysis {
  id: string
  cv_id: string
  processing_id: string
  candidate_name: string
  profession: string
  years_experience: number
  profession_score: number
  experience_score: number
  skills_score: number
  total_score: number
  ai_reasoning?: string
  created_at: string
  cv?: CV
}

export interface Notification {
  id: string
  user_id: string
  type: 'processing_completed' | 'processing_failed'
  title: string
  message: string
  action_url?: string
  is_read: boolean
  created_at: string
  expires_at?: string
}

// Configuración de pesos
export interface WeightConfig {
  profession: number    // 0-100
  experience: number   // 0-100  
  skills: number      // 0-100
  // Validación: profession + experience + skills = 100
}

// Parámetros para procesamiento
export interface ProcessingParams {
  ddc_id: string
  name: string
  profession_weight: number
  experience_weight: number
  skills_weight: number
  cv_ids?: string[]
}

// Respuesta del endpoint de procesamiento
export interface ProcessingResponse {
  processing_id: string
  ddc_id: string
  status: string
  cv_count: number
  cv_ids: string[]
  weights: {
    profession: number
    experience: number
    skills: number
  }
  message: string
}

// Resultados de CV
export interface CVResult {
  id: string
  candidate_name: string
  profession: string
  years_experience: number
  profession_score: number
  experience_score: number
  skills_score: number
  total_score: number
  ai_reasoning?: string
  created_at: string
}

// Presets de configuración
export const PROCESSING_PRESETS: Record<string, WeightConfig> = {
  STANDARD: { profession: 33, experience: 33, skills: 34 },
  EXPERIENCE_FOCUSED: { profession: 20, experience: 60, skills: 20 },
  SKILLS_FOCUSED: { profession: 20, experience: 20, skills: 60 },
  PROFESSION_FOCUSED: { profession: 60, experience: 20, skills: 20 }
}

// Interfaces para exportación
export interface ExportConfig {
  format: 'csv' | 'excel'
  filters?: Record<string, any>
  columns?: string[]
}

export interface CVUploadResult {
  filename: string
  status: 'success' | 'error'
  message?: string
  cv_id?: string
}

export interface BulkUploadResponse {
  total_files: number
  successful: number
  failed: number
  results: CVUploadResult[]
}

// Tipos para progreso de upload
export interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}