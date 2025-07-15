export const FILE_TYPES = {
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
  } as const
  
  export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  export const MAX_FILES_BATCH = 1000
  
  export const SCORE_THRESHOLDS = {
    EXCELLENT: 0.8,
    GOOD: 0.6,
    FAIR: 0.4,
  } as const
  
  export const DEFAULT_WEIGHTS = {
    PROFESSION: 0.333,
    EXPERIENCE: 0.333,
    SKILLS: 0.334,
  } as const

// Configuración de procesamiento
export const PROCESSING_CONFIG = {
  // Función para calcular el tamaño del lote basado en la cantidad total de CVs
  getBatchSize: (totalCVs: number): number => {
    const NUM_WORKERS = 15
    const batchSize = Math.ceil(totalCVs / NUM_WORKERS)
    // Asegurar un mínimo de 1 CV por lote
    return Math.max(batchSize, 1)
  },
  MAX_RETRIES: parseInt(process.env.NEXT_PUBLIC_PROCESSING_MAX_RETRIES || '3'),
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_PROCESSING_RETRY_DELAY || '1000'),
  WORKER_URL: process.env.NEXT_PUBLIC_PROCESSING_WORKER_URL || 'https://teleton-agente-cv-api-worker-processing-525254047375.us-central1.run.app'
}