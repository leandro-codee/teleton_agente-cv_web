import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface CVStatusBadgeProps {
  isProcessed: boolean
  hasError?: boolean
}

export function CVStatusBadge({ isProcessed, hasError }: CVStatusBadgeProps) {
  if (hasError) {
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <AlertCircle className="h-3 w-3" />
        <span>Error</span>
      </Badge>
    )
  }

  if (isProcessed) {
    return (
      <Badge variant="default" className="flex items-center space-x-1">
        <CheckCircle className="h-3 w-3" />
        <span>Procesado</span>
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="flex items-center space-x-1">
      <Clock className="h-3 w-3" />
      <span>Pendiente</span>
    </Badge>
  )
}
