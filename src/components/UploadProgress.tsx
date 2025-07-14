import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { UploadProgress as UploadProgressType } from '@/types'

interface UploadProgressProps {
  files: UploadProgressType[]
}

export function UploadProgress({ files }: UploadProgressProps) {
  if (files.length === 0) return null

  const completed = files.filter(f => f.status === 'completed').length
  const errors = files.filter(f => f.status === 'error').length
  const uploading = files.filter(f => f.status === 'uploading').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Progreso de subida</h4>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            {completed} completados
          </Badge>
          {errors > 0 && (
            <Badge variant="destructive">
              {errors} errores
            </Badge>
          )}
          {uploading > 0 && (
            <Badge variant="secondary">
              {uploading} subiendo
            </Badge>
          )}
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin">
        {files.map((file, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate flex-1">
                {file.filename}
              </span>
              <div className="flex items-center space-x-2">
                {file.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                {file.status === 'uploading' && (
                  <Clock className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-xs font-mono">
                  {Math.round(file.progress)}%
                </span>
              </div>
            </div>
            <Progress value={file.progress} className="h-1" />
            {file.error && (
              <p className="text-xs text-red-600 mt-1">{file.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}