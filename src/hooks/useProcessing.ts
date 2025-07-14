import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'

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

export const useProcessing = () => {
  const [processingProgress, setProcessingProgress] = useState({
    isProcessing: false,
    currentBatch: 0,
    totalBatches: 0,
    processedCVs: 0,
    totalCVs: 0,
    currentBatchCVs: 0,
    currentBatchProcessed: 0,
  })

  const startProcessingMutation = useMutation({
    mutationFn: (params: ProcessingParams) => api.processCVs(params),
    onSuccess: async (result) => {
      const { processing_id, cv_ids, weights } = result
      
      // Dividir CVs en lotes
      const batchSize = 3 // Tamaño del lote
      const batches: string[][] = []
      for (let i = 0; i < cv_ids.length; i += batchSize) {
        batches.push(cv_ids.slice(i, i + batchSize))
      }

      setProcessingProgress({
        isProcessing: true,
        currentBatch: 0,
        totalBatches: batches.length,
        processedCVs: 0,
        totalCVs: cv_ids.length,
        currentBatchCVs: 0,
        currentBatchProcessed: 0,
      })

      toast.success("Iniciando procesamiento", {
        description: `Procesando ${cv_ids.length} CVs en ${batches.length} lotes`,
      })

      // Procesar cada lote
      for (let i = 0; i < batches.length; i++) {
        try {
          const batchData: BatchData = {
            processing_id,
            ddc_id: result.ddc_id,
            cv_ids: batches[i],
            batch_index: i,
            total_batches: batches.length,
            weights,
          }

          setProcessingProgress(prev => ({
            ...prev,
            currentBatch: i + 1,
            currentBatchCVs: batches[i].length,
            currentBatchProcessed: 0,
          }))

          toast.info(`Procesando lote ${i + 1} de ${batches.length}`, {
            description: `Analizando ${batches[i].length} CVs...`,
          })

          const batchResult = await api.processCVBatch(batchData)

          setProcessingProgress(prev => ({
            ...prev,
            processedCVs: prev.processedCVs + batchResult.processed_count,
            currentBatchProcessed: batchResult.processed_count,
          }))

          toast.success(`Lote ${i + 1} completado`, {
            description: `${batchResult.processed_count} CVs procesados exitosamente`,
          })

          // Pequeña pausa entre lotes
          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`Error processing batch ${i}:`, error)
          toast.error(`Error procesando lote ${i + 1}`, {
            description: error instanceof Error ? error.message : 'Error desconocido',
          })
        }
      }

      setProcessingProgress({
        isProcessing: false,
        currentBatch: 0,
        totalBatches: 0,
        processedCVs: 0,
        totalCVs: 0,
        currentBatchCVs: 0,
        currentBatchProcessed: 0,
      })

      toast.success("Procesamiento completado", {
        description: `Se procesaron ${cv_ids.length} CVs en ${batches.length} lotes`,
      })
    },
    onError: (error: any) => {
      toast.error("Error al iniciar procesamiento", {
        description: error.message || "Error desconocido",
      })
    },
  })

  const startProcessing = useCallback((params: ProcessingParams) => {
    startProcessingMutation.mutate(params)
  }, [startProcessingMutation])

  return {
    startProcessing,
    isProcessing: startProcessingMutation.isPending || processingProgress.isProcessing,
    progress: processingProgress,
  }
} 