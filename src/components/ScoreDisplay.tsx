import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ScoreDisplayProps {
    label: string
    score: number
    weight?: number
    showWeight?: boolean
}

export function ScoreDisplay({ label, score, weight, showWeight = false }: ScoreDisplayProps) {
    const percentage = Math.round(score * 100)

    const getScoreColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600'
        if (score >= 0.6) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getProgressColor = (score: number) => {
        if (score >= 0.8) return 'bg-green-500'
        if (score >= 0.6) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center space-x-2">
                    {showWeight && weight && (
                        <Badge variant="outline" className="text-xs">
                            {Math.round(weight * 100)}%
                        </Badge>
                    )}
                    <span className={`text-sm font-mono ${getScoreColor(score)}`}>
                        {percentage}%
                    </span>
                </div>
            </div>
            <div className="relative">
                <Progress value={percentage} className="h-2" />
                <div
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(score)}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}