'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { api } from '@/lib/api'
import { formatBytes } from '@/lib/utils'
import { FILE_TYPES, MAX_FILE_SIZE, MAX_FILES_BATCH } from '@/lib/constants'

export function CVBatchUpload() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<Array<{ file: File; errors: string[] }>>([])
  const { uploadMultipleFiles, isUploading, progress, resetProgress } = useFileUpload()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      [FILE_TYPES.PDF]: ['.pdf'],
      [FILE_TYPES.DOCX]: ['.docx'],
      [FILE_TYPES.DOC]: ['.doc'],
    },
    maxFiles: MAX_FILES_BATCH,
    maxSize: MAX_FILE_SIZE,
    onDrop: handleFilesSelected,
    onDropRejected: handleRejectedFiles,
  })

  function handleFilesSelected(acceptedFiles: File[]) {
    const newFiles = [...uploadedFiles, ...acceptedFiles]
    
    if (newFiles.length > MAX_FILES_BATCH) {
      toast.error("Demasiados archivos", {
        description: `Solo puedes subir máximo ${MAX_FILES_BATCH} archivos a la vez.`,
      })
      return
    }

    setUploadedFiles(newFiles)
    setUploadStatus('idle')
    setRejectedFiles([])
  }

  function handleRejectedFiles(rejectedFiles: any[]) {
    const rejectedWithErrors = rejectedFiles.map(rejected => ({
      file: rejected.file,
      errors: rejected.errors.map((error: any) => {
        switch (error.code) {
          case 'file-too-large':
            return `Archivo muy grande (máx. ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)`
          case 'file-invalid-type':
            return 'Tipo de archivo no válido (solo PDF, DOC, DOCX)'
          case 'too-many-files':
            return `Demasiados archivos (máx. ${MAX_FILES_BATCH})`
          default:
            return error.message
        }
      })
    }))
    
    setRejectedFiles(rejectedWithErrors)
    
    toast.error("Algunos archivos fueron rechazados", {
      description: `${rejectedWithErrors.length} archivos no cumplen los requisitos.`,
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeRejectedFile = (index: number) => {
    setRejectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearAllFiles = () => {
    setUploadedFiles([])
    setRejectedFiles([])
    setUploadStatus('idle')
    resetProgress()
  }

  async function uploadFiles() {
    if (uploadedFiles.length === 0) return

    setUploadStatus('uploading')

    try {
      // Upload files to GCS
      const uploadResults = await uploadMultipleFiles(uploadedFiles, 'cvs')
      
      // Filter successful uploads
      const successfulUploads = uploadResults.filter(result => result.gcs_path)
      
      if (successfulUploads.length > 0) {
        // Register CVs in backend
        await api.uploadCVsBatch(successfulUploads)
        
        setUploadStatus('success')
        toast.success("¡CVs subidos exitosamente!", {
          description: `${successfulUploads.length} CVs han sido procesados y están listos para evaluación.`,
        })
      } else {
        throw new Error('No se pudieron subir los archivos')
      }

    } catch (error) {
      setUploadStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Error al subir los archivos'
      
      toast.error("Error al subir CVs", {
        description: errorMessage,
      })
    }
  }

  const successfulUploads = progress.filter(p => p.status === 'completed').length
  const errorUploads = progress.filter(p => p.status === 'error').length
  const totalFiles = uploadedFiles.length

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return <FileText className="h-5 w-5 text-blue-600" />
  }

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      {uploadStatus !== 'success' && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? 'border-blue-400 bg-blue-50 scale-105' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
            ${uploadedFiles.length > 0 ? 'border-green-300 bg-green-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Suelta los archivos aquí...</p>
          ) : (
            <div>
              <p className="text-gray-700 font-medium mb-2">
                Arrastra múltiples CVs aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, DOC, DOCX • Hasta {MAX_FILES_BATCH} archivos • Máx. {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB cada uno
              </p>
              <Button variant="outline" size="sm" className="mx-auto">
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivos
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Selected Files */}
      {uploadedFiles.length > 0 && uploadStatus !== 'success' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-lg">
              Archivos seleccionados ({uploadedFiles.length})
            </h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-300">
                {uploadedFiles.length} CVs listos
              </Badge>
              <Button onClick={clearAllFiles} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar todo
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-thin">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{file.type}</span>
                    </div>
                  </div>
                </div>
                
                {!isUploading && (
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!isUploading && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {uploadedFiles.length} archivos listos para subir
                  </p>
                  <p className="text-xs text-blue-600">
                    Tamaño total: {formatBytes(uploadedFiles.reduce((acc, file) => acc + file.size, 0))}
                  </p>
                </div>
                <Button onClick={uploadFiles} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir {uploadedFiles.length} archivos
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rejected Files */}
      {rejectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-lg text-red-700">
              Archivos rechazados ({rejectedFiles.length})
            </h4>
            <Button onClick={() => setRejectedFiles([])} variant="outline" size="sm">
              Limpiar rechazados
            </Button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 scrollbar-thin">
            {rejectedFiles.map((rejected, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-red-800">{rejected.file.name}</p>
                    <div className="text-xs text-red-600">
                      {rejected.errors.map((error, i) => (
                        <div key={i}>{error}</div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => removeRejectedFile(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-lg">Subiendo archivos...</h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-300">
                {successfulUploads} completados
              </Badge>
              {errorUploads > 0 && (
                <Badge variant="destructive">
                  {errorUploads} errores
                </Badge>
              )}
              <Badge variant="secondary">
                {successfulUploads + errorUploads} / {totalFiles}
              </Badge>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso general</span>
              <span>{Math.round(((successfulUploads + errorUploads) / totalFiles) * 100)}%</span>
            </div>
            <Progress 
              value={((successfulUploads + errorUploads) / totalFiles) * 100} 
              className="h-2"
            />
          </div>

          {/* Individual File Progress */}
          <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
            {progress.map((fileProgress, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate flex-1">
                    {fileProgress.filename}
                  </span>
                  <div className="flex items-center space-x-2">
                    {fileProgress.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {fileProgress.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {fileProgress.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    <span className="text-xs font-mono">
                      {Math.round(fileProgress.progress)}%
                    </span>
                  </div>
                </div>
                <Progress value={fileProgress.progress} className="h-1" />
                {fileProgress.error && (
                  <p className="text-xs text-red-600 mt-1">{fileProgress.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {uploadStatus === 'success' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800 text-lg">
                ¡{successfulUploads} CVs subidos exitosamente!
              </p>
              <p className="text-sm text-green-600 mt-1">
                Los archivos han sido procesados y están listos para evaluación.
                Ahora puedes proceder a configurar los parámetros de evaluación.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={clearAllFiles} variant="outline" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Subir más CVs
            </Button>
            <Button 
              onClick={() => {
                // Aquí podrías navegar a la pestaña de procesamiento
                const event = new CustomEvent('switchTab', { detail: 'process' })
                window.dispatchEvent(event)
              }}
              className="flex-1"
            >
              Procesar CVs →
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {uploadStatus === 'error' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-6 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800 text-lg">
                Error al subir algunos archivos
              </p>
              <p className="text-sm text-red-600 mt-1">
                {successfulUploads > 0 ? (
                  <>Se subieron {successfulUploads} archivos correctamente, pero hubo errores con {errorUploads} archivos.</>
                ) : (
                  'Hubo un problema al subir los archivos. Intenta nuevamente.'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={() => setUploadStatus('idle')} variant="outline" className="flex-1">
              Intentar nuevamente
            </Button>
            {successfulUploads > 0 && (
              <Button onClick={clearAllFiles} className="flex-1">
                Continuar con archivos exitosos
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      {uploadedFiles.length === 0 && rejectedFiles.length === 0 && uploadStatus === 'idle' && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2">💡 Consejos para la subida masiva:</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Asegúrate de que todos los archivos sean CVs relevantes</li>
            <li>• Los nombres de archivo descriptivos ayudan en la identificación</li>
            <li>• Puedes arrastrar una carpeta completa con CVs</li>
            <li>• La subida se realiza en paralelo para mayor velocidad</li>
            <li>• Los archivos se almacenan de forma segura en Google Cloud</li>
          </ul>
        </div>
      )}
    </div>
  )
}