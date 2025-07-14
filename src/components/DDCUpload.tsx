'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { api } from '@/lib/api'
import { formatBytes } from '@/lib/utils'

export function DDCUpload() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
      const [error, setError] = useState<string>('')
    const [ddcInfo, setDdcInfo] = useState<{ filename: string } | null>(null)
    const { uploadFile } = useFileUpload()

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: handleFileUpload,
  })

  async function handleFileUpload(files: File[]) {
    if (files.length === 0) return

    const file = files[0]
    setUploadStatus('uploading')
    setError('')

    try {
      // Upload to GCS
      const gcsPath = await uploadFile(file, 'ddcs', (progress) => {
        setUploadProgress(progress)
      })

      // Register DDC in backend
      await api.uploadDDC(file.name, gcsPath as any)
      
      setDdcInfo({ filename: file.name })
      setUploadStatus('success')
      
      toast.success("¡DDC subida exitosamente!", {
        description: "El documento de descripción del cargo ha sido procesado.",
      })

    } catch (error) {
      setUploadStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Error al subir el archivo'
      setError(errorMessage)
      
      toast.error("Error al subir DDC", {
        description: errorMessage,
      })
    }
  }

  const resetUpload = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
    setDdcInfo(null)
    setError('')
  }

  if (uploadStatus === 'success') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-700">DDC cargada exitosamente</p>
            <p className="text-sm text-green-600">{ddcInfo?.filename}</p>
          </div>
        </div>
        <Button onClick={resetUpload} variant="outline" className="w-full">
          Subir nueva DDC
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uploadStatus === 'uploading' ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium">{acceptedFiles[0]?.name}</p>
              <p className="text-sm text-gray-500">
                {formatBytes(acceptedFiles[0]?.size || 0)}
              </p>
            </div>
          </div>
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-center text-gray-600">
            Subiendo DDC... {Math.round(uploadProgress)}%
          </p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploadStatus === 'error' ? 'border-red-400 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploadStatus === 'error' ? (
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          )}
          
          {uploadStatus === 'error' ? (
            <div>
              <p className="text-red-700 font-medium mb-2">Error al subir archivo</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={resetUpload} variant="outline" size="sm">
                Intentar nuevamente
              </Button>
            </div>
          ) : isDragActive ? (
            <p className="text-blue-600">Suelta el archivo aquí...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Arrastra la DDC aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, DOC, DOCX - Máx. 10MB
              </p>
              <Button variant="outline" size="sm">
                Seleccionar archivo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}