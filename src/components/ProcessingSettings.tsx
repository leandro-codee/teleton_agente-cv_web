'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { Brain, Loader2, Play } from 'lucide-react'
import { api } from '@/lib/api'
import { ProcessingParams } from '@/types'

const processingSchema = z.object({
  profession_weight: z.number().min(0).max(1),
  experience_weight: z.number().min(0).max(1),
  skills_weight: z.number().min(0).max(1),
}).refine((data) => {
  const total = data.profession_weight + data.experience_weight + data.skills_weight
  return Math.abs(total - 1) < 0.01
}, {
  message: "Los pesos deben sumar 100%",
})

export function ProcessingSettings() {
  const [isProcessing, setIsProcessing] = useState(false)
      const [professionWeight, setProfessionWeight] = useState([33])
    const [experienceWeight, setExperienceWeight] = useState([33])
    const [skillsWeight, setSkillsWeight] = useState([34])

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<ProcessingParams>({
    resolver: zodResolver(processingSchema) as any,
  })

  // Update weights and ensure they sum to 100%
  const updateProfessionWeight = (value: number[]) => {
    const newProf = value[0]
    const remaining = 100 - newProf
    const exp = Math.min(experienceWeight[0], remaining)
    const skills = remaining - exp
    
    setProfessionWeight([newProf])
    setExperienceWeight([exp])
    setSkillsWeight([skills])
  }

  const updateExperienceWeight = (value: number[]) => {
    const newExp = value[0]
    const remaining = 100 - newExp
    const prof = Math.min(professionWeight[0], remaining)
    const skills = remaining - prof
    
    setExperienceWeight([newExp])
    setProfessionWeight([prof])
    setSkillsWeight([skills])
  }

  const updateSkillsWeight = (value: number[]) => {
    const newSkills = value[0]
    const remaining = 100 - newSkills
    const prof = Math.min(professionWeight[0], remaining)
    const exp = remaining - prof
    
    setSkillsWeight([newSkills])
    setProfessionWeight([prof])
    setExperienceWeight([exp])
  }

  const onSubmit = async () => {
    setIsProcessing(true)
    
    try {
      const params: ProcessingParams = {
        profession_weight: professionWeight[0] / 100,
        experience_weight: experienceWeight[0] / 100,
        skills_weight: skillsWeight[0] / 100,
      } as any

      const response = await api.processCVs(params)
      
      toast.success("¡Procesamiento completado!", {
        description: `Se procesaron CVs exitosamente.`,
      })

    } catch (error) {
      toast.error("Error en el procesamiento", {
        description: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const totalWeight = professionWeight[0] + experienceWeight[0] + skillsWeight[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Configuración de Evaluación</span>
          </CardTitle>
          <CardDescription>
            Ajusta los pesos de cada criterio de evaluación. El total debe sumar 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profession Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Importancia de la Profesión</Label>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {professionWeight[0]}%
              </span>
            </div>
            <Slider
              value={professionWeight}
              onValueChange={updateProfessionWeight}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Qué tan importante es que el candidato tenga la profesión exacta o relacionada
            </p>
          </div>

          {/* Experience Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Importancia de la Experiencia</Label>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {experienceWeight[0]}%
              </span>
            </div>
            <Slider
              value={experienceWeight}
              onValueChange={updateExperienceWeight}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Peso de los años de experiencia laboral del candidato
            </p>
          </div>

          {/* Skills Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Importancia de Habilidades Específicas</Label>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {skillsWeight[0]}%
              </span>
            </div>
            <Slider
              value={skillsWeight}
              onValueChange={updateSkillsWeight}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Peso de habilidades específicas, idiomas, sector de experiencia, etc.
            </p>
          </div>

          {/* Total Weight Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total de pesos:</span>
              <span className={`font-mono text-lg ${
                totalWeight === 100 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalWeight}%
              </span>
            </div>
            {totalWeight !== 100 && (
              <p className="text-sm text-red-600 mt-1">
                Los pesos deben sumar exactamente 100%
              </p>
            )}
          </div>

          {/* Process Button */}
          <Button
            onClick={onSubmit}
            disabled={totalWeight !== 100 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando CVs...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Procesar CVs con esta configuración
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}