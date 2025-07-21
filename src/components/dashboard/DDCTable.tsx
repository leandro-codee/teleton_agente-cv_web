import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ExternalLink, 
  Folder, 
  Bot, 
  BarChart3, 
  Copy, 
  ToggleLeft,
  ToggleRight,
  Plus,
  ChevronDown
} from 'lucide-react'
import { DDC } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface DDCTableProps {
  ddcs: DDC[]
  onCreateNew: () => void
  onPublicPage: (ddc: DDC) => void
  onManageCVs: (ddc: DDC) => void
  onProcess: (ddc: DDC) => void
  onResults: (ddc: DDC) => void
  onReuseCVs: (ddc: DDC) => void
  onToggleStatus: (ddc: DDC) => void
  onUpdateStatus: (ddc: DDC, status: string) => void
  isLoading?: boolean
}

const DDCTable: React.FC<DDCTableProps> = ({
  ddcs,
  onCreateNew,
  onPublicPage,
  onManageCVs,
  onProcess,
  onResults,
  onReuseCVs,
  onToggleStatus,
  onUpdateStatus,
  isLoading = false
}) => {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const getStatusBadge = (status: DDC['status']) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800">Abierto</Badge>
      case 'closed':
        return <Badge className="bg-red-100 text-red-800">Cerrado</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Borrador</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusLabel = (status: DDC['status']) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'closed':
        return 'Cerrado'
      case 'draft':
        return 'Borrador'
      default:
        return status
    }
  }

  const handleStatusChange = async (ddc: DDC, newStatus: string) => {
    if (ddc.status === newStatus) return

    setUpdatingStatus(ddc.id)
    try {
      await onUpdateStatus(ddc, newStatus)
      toast.success("Estado actualizado", {
        description: `La DDC ahora está ${getStatusLabel(newStatus as DDC['status']).toLowerCase()}`
      })
    } catch (error) {
      toast.error("Error al actualizar estado")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Descripciones de Cargos (DDCs)</CardTitle>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva DDC
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-x-auto min-w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold w-[120px]">Acciones</TableHead>
                <TableHead className="font-semibold">Cargo</TableHead>
                <TableHead className="font-semibold whitespace-nowrap w-[100px]">Estado</TableHead>
                <TableHead className="font-semibold text-center w-[80px]">CVs</TableHead>
                <TableHead className="font-semibold whitespace-nowrap w-[100px]">Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Cargando DDCs...
                  </TableCell>
                </TableRow>
              ) : ddcs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No hay DDCs creadas. Crea tu primera DDC para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                ddcs.map((ddc) => (
                  <TableRow key={ddc.id} className="hover:bg-gray-50">
                    <TableCell className="w-[120px]">
                      <div className="flex flex-wrap gap-1">
                        {/* Gestionar CVs */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onManageCVs(ddc)}
                          title="Gestionar CVs"
                        >
                          <Folder className="h-4 w-4" />
                        </Button>
                        
                        {/* Procesar CVs */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onProcess(ddc)}
                          title="Procesar CVs"
                          disabled={ddc.cv_count === 0}
                        >
                          <Bot className="h-4 w-4" />
                        </Button>
                        
                        {/* Ver Resultados */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onResults(ddc)}
                          title="Ver Resultados"
                          disabled={ddc.processing_count === 0}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                        <div className="font-medium truncate">{ddc.title}</div>
                        <div className="text-sm text-gray-500 truncate" title={ddc.description}>
                          {ddc.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(ddc.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingStatus === ddc.id}
                              className="h-6 w-6 p-0"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(ddc, 'draft')}
                              disabled={ddc.status === 'draft' || updatingStatus === ddc.id}
                            >
                              Borrador
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(ddc, 'open')}
                              disabled={ddc.status === 'open' || updatingStatus === ddc.id}
                            >
                              Abierto
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(ddc, 'closed')}
                              disabled={ddc.status === 'closed' || updatingStatus === ddc.id}
                            >
                              Cerrado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-[80px]">
                      <Badge variant="outline">{ddc.cv_count}</Badge>
                    </TableCell>
                    <TableCell className="w-[100px]">{formatDate(ddc.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default DDCTable 