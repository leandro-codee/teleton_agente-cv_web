import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Brain } from 'lucide-react'

interface AIRationaleModalProps {
  rationale: string
  candidateName: string
  trigger?: React.ReactNode
}

export const AIRationaleModal: React.FC<AIRationaleModalProps> = ({ 
  rationale, 
  candidateName,
  trigger 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Ver Razonamiento IA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Razonamiento de IA - {candidateName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {rationale}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 