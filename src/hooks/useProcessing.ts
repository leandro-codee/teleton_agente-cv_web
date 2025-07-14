import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Processing, WeightConfig, ProcessingParams } from '@/types'
import { toast } from 'sonner'

export const useProcessing = () => {
  const queryClient = useQueryClient()

  const startProcessingMutation = useMutation({
    mutationFn: ({ 
      ddcId, 
      config 
    }: { 
      ddcId: string
      config: WeightConfig & { name: string }
    }) => {
      const params: ProcessingParams = {
        ddc_id: ddcId,
        name: config.name,
        profession_weight: config.profession,
        experience_weight: config.experience,
        skills_weight: config.skills
      }
      return api.processCVs(params)
    },
    onSuccess: (data: Processing) => {
      toast.success("Procesamiento iniciado", {
        description: `Se ha iniciado el procesamiento de ${data.cv_count} CVs`
      })
      queryClient.invalidateQueries({ queryKey: ['ddcs'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error: any) => {
      toast.error("Error al iniciar el procesamiento", {
        description: error.message || "Error al iniciar el procesamiento"
      })
    }
  })

  const getProcessingStatus = (processingId: string) => {
    return useQuery({
      queryKey: ['processing', processingId],
      queryFn: () => api.getProcessingStatus(processingId),
      enabled: !!processingId,
      refetchInterval: 5000, // Actualizar cada 5 segundos mientras está procesando
    })
  }

  const getProcessingResults = (processingId: string) => {
    return useQuery({
      queryKey: ['processing-results', processingId],
      queryFn: () => api.getProcessingResults(processingId),
      enabled: !!processingId,
    })
  }

  return {
    startProcessing: startProcessingMutation.mutate,
    isStarting: startProcessingMutation.isPending,
    getProcessingStatus,
    getProcessingResults
  }
} 