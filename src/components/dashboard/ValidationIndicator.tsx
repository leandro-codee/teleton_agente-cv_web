import React from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ValidationIndicatorProps {
  total: number
  isValid: boolean
}

const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({ total, isValid }) => {
  const getColor = () => {
    if (total === 100) return 'text-green-600 bg-green-50 border-green-200'
    if (total > 100) return 'text-red-600 bg-red-50 border-red-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }
  
  const getIcon = () => {
    if (total === 100) return <CheckCircle className="h-5 w-5" />
    if (total > 100) return <XCircle className="h-5 w-5" />
    return <AlertCircle className="h-5 w-5" />
  }
  
  const getMessage = () => {
    if (total === 100) return 'Perfecto! Los pesos suman 100%'
    if (total > 100) return `Total: ${total}% (debe ser exactamente 100%)`
    return `Total: ${total}% (faltan ${100 - total}% para completar)`
  }
  
  const getProgressColor = () => {
    if (total === 100) return 'bg-green-500'
    if (total > 100) return 'bg-red-500'
    return 'bg-yellow-500'
  }
  
  return (
    <div className={`p-4 rounded-lg border ${getColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="text-sm font-medium">{getMessage()}</span>
        </div>
        <div className="text-lg font-bold">{total}%</div>
      </div>
      <div className="relative">
        <Progress 
          value={Math.min(total, 100)} 
          max={100}
          className="h-2"
        />
        {total > 100 && (
          <div 
            className="absolute top-0 left-0 h-2 bg-red-500 rounded-full"
            style={{ width: `${Math.min((total - 100) / 100 * 100, 100)}%` }}
          />
        )}
      </div>
    </div>
  )
}

export default ValidationIndicator 