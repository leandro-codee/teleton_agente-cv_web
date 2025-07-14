'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { api } from '@/lib/api'
import { formatBytes } from '@/lib/utils'

export function PublicCVUpload() {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [cvUuid, setCvUuid] = useState<string>('')
    const [error, setError] = useState<string>('')
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
            const gcsPath = await uploadFile(file, 'public-cvs', (progress) => {
                setUploadProgress(progress)
            })

            // Register CV in backend
            const response = await api.uploadCV(file.name, gcsPath)

            setCvUuid(response.uuid)
            setUploadStatus('success')

            toast.success("¡CV subido exitosamente!", {
                description: `Tu CV ha sido procesado. UUID: ${response.uuid.slice(0, 8)}...`,
            })

        } catch (error) {
            setUploadStatus('error')
            const errorMessage = error instanceof Error ? error.message : 'Error al subir el archivo'
            setError(errorMessage)

            toast.error("Error al subir CV", {
                description: errorMessage,
            })
        }
    }

    const resetUpload = () => {
        setUploadStatus('idle')
        setUploadProgress(0)
        setCvUuid('')
        setError('')
    }

    if (uploadStatus === 'success') {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <CardTitle className="text-green-700">¡CV Subido Exitosamente!</CardTitle>
                    <CardDescription>
                        Tu currículum ha sido procesado y almacenado de forma segura.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">ID de tu CV:</p>
                        <p className="font-mono text-sm bg-white p-2 rounded border">
                            {cvUuid}
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        Guarda este identificador para consultar el estado de evaluación de tu CV.
                    </p>
                    <Button
                        onClick={resetUpload}
                        variant="outline"
                        className="w-full"
                    >
                        Subir otro CV
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle>Sube tu CV</CardTitle>
                <CardDescription>
                    Formatos aceptados: PDF, DOC, DOCX (máx. 10MB)
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                            Subiendo... {Math.round(uploadProgress)}%
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
                                    Arrastra tu CV aquí o haz clic para seleccionar
                                </p>
                                <Button variant="outline" size="sm">
                                    Seleccionar archivo
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}