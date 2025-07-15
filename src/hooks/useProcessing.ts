import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { ProcessingResponse } from '@/types'
import { PROCESSING_CONFIG } from '@/lib/constants'

interface ProcessingParams {
  ddc_id: string
  name: string
  profession_weight: number
  experience_weight: number
  skills_weight: number
}

interface BatchData {
  processing_id: string
  ddc_id: string
  cv_ids: string[]
  batch_index: number
  total_batches: number
  weights: {
    profession: number
    experience: number
    skills: number
  }
}

interface BatchResult {
  success: boolean
  processed_count?: number
  failed_count?: number
  batch_index: number
  error?: string
}

export const useProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false)

  const processBatchWithRetry = async (
    batchData: BatchData, 
    maxRetries: number = PROCESSING_CONFIG.MAX_RETRIES
  ): Promise<BatchResult> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await api.processCVBatch(batchData)
        return {
          success: true,
          processed_count: result.processed_count,
          failed_count: result.failed_count,
          batch_index: batchData.batch_index,
        }
      } catch (error) {
        console.error(`Error en lote ${batchData.batch_index + 1}, intento ${attempt}:`, error)
        
        if (attempt === maxRetries) {
          return {
            success: false,
            batch_index: batchData.batch_index,
            error: error instanceof Error ? error.message : 'Error desconocido',
          }
        }
        
        // Esperar antes del reintento (tiempo exponencial)
        await new Promise(resolve => setTimeout(resolve, PROCESSING_CONFIG.RETRY_DELAY * attempt))
      }
    }
    
    return {
      success: false,
      batch_index: batchData.batch_index,
      error: 'Máximo de reintentos alcanzado',
    }
  }

  const startProcessingMutation = useMutation({
    mutationFn: async (params: ProcessingParams) => {
      // Primero obtener solo los cv_ids usando el nuevo endpoint
      const cvIds = await api.getDDCCVIds(params.ddc_id)
      
      // Luego iniciar el procesamiento con los cv_ids obtenidos
      const result = await api.processCVs(params)
      
      return {
        ...result,
        cv_ids: cvIds // Usar los cv_ids obtenidos del nuevo endpoint
      }
    },
    onSuccess: async (result) => {
      const { processing_id, cv_ids, weights } = result
      
      // Dividir CVs en lotes usando la configuración
      const batchSize = PROCESSING_CONFIG.BATCH_SIZE
      const batches: string[][] = []
      for (let i = 0; i < cv_ids.length; i += batchSize) {
        batches.push(cv_ids.slice(i, i + batchSize))
      }

      setIsProcessing(true)

      toast.success("Iniciando procesamiento", {
        description: `Procesando ${cv_ids.length} CVs en ${batches.length} lotes de ${batchSize}`,
      })

      // Procesar lotes en paralelo con reintentos
      const batchPromises = batches.map((batch, index) => {
        const batchData: BatchData = {
          processing_id,
          ddc_id: result.ddc_id,
          cv_ids: batch,
          batch_index: index,
          total_batches: batches.length,
          weights,
        }
        return processBatchWithRetry(batchData)
      })

      // Esperar a que todos los lotes terminen
      const results = await Promise.allSettled(batchPromises)
      
      let totalProcessed = 0
      let totalFailed = 0
      let failedBatches = 0
      let successfulBatches = 0

      // Procesar resultados
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const batchResult = result.value
          if (batchResult.success) {
            totalProcessed += batchResult.processed_count || 0
            totalFailed += batchResult.failed_count || 0
            successfulBatches++
            
            toast.success(`Lote ${index + 1} completado`, {
              description: `${batchResult.processed_count} CVs procesados exitosamente`,
            })
          } else {
            failedBatches++
            toast.error(`Lote ${index + 1} falló`, {
              description: batchResult.error || 'Error desconocido',
            })
          }
        } else {
          failedBatches++
          toast.error(`Lote ${index + 1} falló`, {
            description: result.reason || 'Error desconocido',
          })
        }
      })

      // Mostrar resumen final
      const successRate = ((successfulBatches / batches.length) * 100).toFixed(1)
      toast.success("Procesamiento completado", {
        description: `${successfulBatches}/${batches.length} lotes exitosos (${successRate}%). ${totalProcessed} CVs procesados.`,
      })

      // Finalizar el procesamiento en el backend
      try {
        await api.finishProcessing(processing_id)
        toast.success("Estado actualizado", {
          description: "El procesamiento ha sido marcado como completado",
        })
      } catch (error) {
        console.error('Error al finalizar procesamiento:', error)
        toast.error("Error al actualizar estado", {
          description: "El procesamiento se completó pero no se pudo actualizar el estado",
        })
      }

      // Resetear estado
      setTimeout(() => {
        setIsProcessing(false)
      }, 3000)
    },
    onError: (error: any) => {
      // Manejar específicamente el error de procesamiento único
      if (error.message && error.message.includes('Ya existe un procesamiento activo')) {
        toast.error("Procesamiento en curso", {
          description: error.message,
        })
      } else {
        toast.error("Error al iniciar procesamiento", {
          description: error.message || "Error desconocido",
        })
      }
      setIsProcessing(false)
    },
  })

  const startProcessing = useCallback((params: ProcessingParams) => {
    startProcessingMutation.mutate(params)
  }, [startProcessingMutation])

  return {
    startProcessing,
    isProcessing: startProcessingMutation.isPending || isProcessing,
  }
} 