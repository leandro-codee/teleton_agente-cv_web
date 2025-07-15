import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { WeightConfig, PROCESSING_PRESETS } from '@/types'
import WeightSlider from './WeightSlider'
import ValidationIndicator from './ValidationIndicator'

interface ProcessingConfigProps {
  ddcId: string
  onProcessingStart: (config: WeightConfig & { name: string }) => void
  isLoading?: boolean
  disabled?: boolean
}

const ProcessingConfig: React.FC<ProcessingConfigProps> = ({ 
  ddcId, 
  onProcessingStart, 
  isLoading = false,
  disabled = false
}) => {
  const [weights, setWeights] = useState<WeightConfig>({ profession: 0, experience: 0, skills: 0 })
  const [customName, setCustomName] = useState("")
  const [isValid, setIsValid] = useState(false)
  
  React.useEffect(() => {
    const total = weights.profession + weights.experience + weights.skills
    setIsValid(total === 100)
  }, [weights])
  
  const handleWeightChange = (field: keyof WeightConfig, value: number) => {
    const newWeights = { ...weights, [field]: value }
    setWeights(newWeights)
  }
  
  const resetWeights = () => {
    setWeights({ profession: 0, experience: 0, skills: 0 })
  }
  
  const handlePresetSelect = (presetKey: string) => {
    if (presetKey in PROCESSING_PRESETS) {
      setWeights(PROCESSING_PRESETS[presetKey])
    }
  }
  
  const handleProcess = () => {
    if (!isValid) {
      toast.error("Los pesos deben sumar exactamente 100%")
      return
    }
    
    onProcessingStart({
      ...weights,
      name: customName || `Procesamiento ${new Date().toLocaleString()}`
    })
  }
  
  const total = weights.profession + weights.experience + weights.skills
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Configurar Evaluación de CVs</CardTitle>
        <CardDescription>
          Configura los pesos para cada criterio de evaluación. Los pesos deben sumar exactamente 100%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nombre del procesamiento */}
        <div className="space-y-2">
          <Label htmlFor="processing-name">Nombre del procesamiento</Label>
          <Input
            id="processing-name"
            placeholder="Ej: Evaluación Q1 2024"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            disabled={isLoading || disabled}
          />
        </div>
        
        {/* Presets */}
        <div className="space-y-2">
          <Label>Presets predefinidos</Label>
          <Select onValueChange={handlePresetSelect} disabled={isLoading || disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un preset o configura manualmente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STANDARD">Estándar (33% - 33% - 34%)</SelectItem>
              <SelectItem value="EXPERIENCE_FOCUSED">Foco en Experiencia (20% - 60% - 20%)</SelectItem>
              <SelectItem value="SKILLS_FOCUSED">Foco en Habilidades (20% - 20% - 60%)</SelectItem>
              <SelectItem value="PROFESSION_FOCUSED">Foco en Profesión (60% - 20% - 20%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Sliders de pesos */}
        <div className="space-y-4">
          <WeightSlider
            label="Profesión"
            value={weights.profession}
            onChange={(value) => handleWeightChange('profession', value)}
            disabled={isLoading || disabled}
          />
          
          <WeightSlider
            label="Experiencia"
            value={weights.experience}
            onChange={(value) => handleWeightChange('experience', value)}
            disabled={isLoading || disabled}
          />
          
          <WeightSlider
            label="Habilidades Específicas"
            value={weights.skills}
            onChange={(value) => handleWeightChange('skills', value)}
            disabled={isLoading || disabled}
          />
        </div>
        
        {/* Indicador de validación */}
        <ValidationIndicator total={total} isValid={isValid} />
        
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={resetWeights} 
            variant="outline"
            disabled={isLoading || disabled}
            className="flex-1"
          >
            Reset (Todo en 0)
          </Button>
          <Button 
            onClick={handleProcess} 
            disabled={!isValid || isLoading || disabled}
            className="flex-1"
          >
            {isLoading ? "Iniciando..." : disabled ? "Procesamiento Activo" : "Iniciar Procesamiento"}
          </Button>
        </div>
        
        {/* Descripción de criterios */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Descripción de criterios:</h4>
          <ul className="text-sm space-y-1 text-gray-600">
            <li><strong>Profesión:</strong> Coincidencia con carreras requeridas en la DDC</li>
            <li><strong>Experiencia:</strong> Años de experiencia vs mínimo requerido</li>
            <li><strong>Habilidades:</strong> Skills blandas, idiomas, sector, liderazgo, etc.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProcessingConfig 