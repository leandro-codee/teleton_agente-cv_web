import { useState, useCallback } from 'react'
import { generateSignedUrl, uploadToGCS } from '@/lib/gcs'
import { UploadProgress } from '@/types'

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress[]>([])

  const uploadFile = useCallback(async (
    file: File,
    folder: string = 'cvs',
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    try {
      const { url, gcsPath } = await generateSignedUrl(file.name, file.type, folder)
      
      await uploadToGCS(file, url, onProgress)
      
      return gcsPath
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }, [])

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    folder: string = 'cvs',
    concurrency: number = 5
  ): Promise<Array<{ filename: string; gcs_path: string }>> => {
    setIsUploading(true)
    const results: Array<{ filename: string; gcs_path: string }> = []
    const uploadProgress: UploadProgress[] = files.map(file => ({
      filename: file.name,
      progress: 0,
      status: 'uploading',
    }))

    setProgress(uploadProgress)

    const uploadQueue = files.map((file, index) => async () => {
      try {
        const gcsPath = await uploadFile(file, folder, (progressValue) => {
          setProgress(prev => prev.map((item, i) => 
            i === index ? { ...item, progress: progressValue } : item
          ))
        })

        results.push({ filename: file.name, gcs_path: gcsPath })
        
        setProgress(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'completed', progress: 100 } : item
        ))
      } catch (error) {
        setProgress(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : item
        ))
      }
    })

    // Process uploads with concurrency limit
    for (let i = 0; i < uploadQueue.length; i += concurrency) {
      const batch = uploadQueue.slice(i, i + concurrency)
      await Promise.all(batch.map(upload => upload()))
    }

    setIsUploading(false)
    return results
  }, [uploadFile])

  const resetProgress = useCallback(() => {
    setProgress([])
  }, [])

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    progress,
    resetProgress,
  }
}