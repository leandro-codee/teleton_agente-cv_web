export const validateCVFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no válido. Solo se permiten archivos PDF, DOC y DOCX.'
    }
  }
  
  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. El tamaño máximo es 10MB.'
    }
  }
  
  // Validar que el archivo no esté vacío
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'El archivo está vacío.'
    }
  }
  
  return { isValid: true }
}

export const getFileTypeIcon = (mimeType: string) => {
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  return '📄'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 