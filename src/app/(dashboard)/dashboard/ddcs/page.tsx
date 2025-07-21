'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { DDC } from '@/types'
import DDCTable from '@/components/dashboard/DDCTable'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const DDCsPage = () => {
  const router = useRouter()
  const [reuseModalOpen, setReuseModalOpen] = useState(false)
  const [selectedDDC, setSelectedDDC] = useState<DDC | null>(null)
  const [targetDDCId, setTargetDDCId] = useState('')

  const { data: ddcs = [], isLoading, refetch } = useQuery({
    queryKey: ['ddcs'],
    queryFn: () => api.getDDCs(),
  })

  const handleCreateNew = () => {
    router.push('/dashboard/ddcs/create')
  }

  const handlePublicPage = (ddc: DDC) => {
    window.open(`/ddc/${ddc.uuid}`, '_blank')
  }

  const handleManageCVs = (ddc: DDC) => {
    router.push(`/dashboard/ddcs/${ddc.id}/cvs`)
  }

  const handleProcess = (ddc: DDC) => {
    router.push(`/dashboard/ddcs/${ddc.id}/process`)
  }

  const handleResults = (ddc: DDC) => {
    router.push(`/dashboard/ddcs/${ddc.id}/results`)
  }

  const handleReuseCVs = (ddc: DDC) => {
    setSelectedDDC(ddc)
    setReuseModalOpen(true)
  }

  const handleToggleStatus = async (ddc: DDC) => {
    try {
      await api.toggleDDCStatus(ddc.id)
      toast.success("Estado actualizado", {
        description: `La DDC ha sido ${ddc.status === 'open' ? 'cerrada' : 'abierta'}`
      })
      refetch()
    } catch (error) {
      toast.error("No se pudo actualizar el estado de la DDC")
    }
  }

  const handleUpdateStatus = async (ddc: DDC, status: string) => {
    try {
      await api.updateDDCStatus(ddc.id, status)
      refetch()
    } catch (error) {
      throw error
    }
  }

  const handleConfirmReuse = async () => {
    if (!selectedDDC || !targetDDCId) return

    try {
      await api.reuseCVs(selectedDDC.id, targetDDCId)
      toast.success("CVs reutilizados", {
        description: "Los CVs han sido copiados exitosamente"
      })
      setReuseModalOpen(false)
      setSelectedDDC(null)
      setTargetDDCId('')
      refetch()
    } catch (error) {
      toast.error("No se pudieron reutilizar los CVs")
    }
  }

  // Filtrar DDCs disponibles para reutilización (excluir la actual)
  const availableDDCs = ddcs.filter(ddc => ddc.id !== selectedDDC?.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Descripciones de Cargos</h1>
          <p className="text-gray-600">
            Gestiona tus DDCs y procesos de selección
          </p>
        </div>
      </div>

      <DDCTable
        ddcs={ddcs}
        onCreateNew={handleCreateNew}
        onPublicPage={handlePublicPage}
        onManageCVs={handleManageCVs}
        onProcess={handleProcess}
        onResults={handleResults}
        onReuseCVs={handleReuseCVs}
        onToggleStatus={handleToggleStatus}
        onUpdateStatus={handleUpdateStatus}
        isLoading={isLoading}
      />

      {/* Modal de reutilización de CVs */}
      <Dialog open={reuseModalOpen} onOpenChange={setReuseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reutilizar CVs</DialogTitle>
            <DialogDescription>
              Selecciona la DDC destino para copiar los CVs de "{selectedDDC?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-ddc">DDC Destino</Label>
              <Select value={targetDDCId} onValueChange={setTargetDDCId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una DDC destino" />
                </SelectTrigger>
                <SelectContent>
                  {availableDDCs.map((ddc) => (
                    <SelectItem key={ddc.id} value={ddc.id}>
                      {ddc.title} ({ddc.cv_count} CVs)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setReuseModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmReuse}
                disabled={!targetDDCId}
              >
                Reutilizar CVs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DDCsPage 