'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Download, Search, ArrowUpDown, Trophy, Medal, Award } from 'lucide-react'
import { api } from '@/lib/api'
import { CVResult } from '@/types'
import { formatDate } from '@/lib/utils'

export function ResultsView() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const { data: resultsData, isLoading, error, refetch } = useQuery({
    queryKey: ['results'],
    queryFn: api.getResults,
  })

  const columns: ColumnDef<CVResult>[] = [
    {
      id: 'rank',
      header: '#',
      cell: ({ row }) => {
        const rank = row.index + 1
        return (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm">{rank}</span>
            {rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
            {rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
            {rank === 3 && <Award className="h-4 w-4 text-orange-500" />}
          </div>
        )
      },
    },
    {
      accessorKey: 'candidate_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-medium"
        >
          Candidato
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'profession',
      header: 'Profesión',
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('profession')}</span>
      ),
    },
    {
      accessorKey: 'years_experience',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-medium"
        >
          Experiencia
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue('years_experience')} años</span>
      ),
    },
    {
      accessorKey: 'total_score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-medium"
        >
          Puntuación Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.getValue('total_score') as number
        return (
          <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "outline"}>
            {score.toFixed(1)}%
          </Badge>
        )
      },
    },
    {
      accessorKey: 'profession_score',
      header: 'Profesión',
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {(row.getValue('profession_score') as number).toFixed(1)}%
        </span>
      ),
    },
    {
      accessorKey: 'experience_score',
      header: 'Experiencia',
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {(row.getValue('experience_score') as number).toFixed(1)}%
        </span>
      ),
    },
    {
      accessorKey: 'skills_score',
      header: 'Habilidades',
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {(row.getValue('skills_score') as number).toFixed(1)}%
        </span>
      ),
    },
  ]

  const table = useReactTable({
    data: resultsData?.results || [],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportCSV()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cv_results_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("¡Exportación exitosa!", {
        description: "Los resultados han sido descargados como CSV.",
      })
    } catch (error) {
      toast.error("Error al exportar", {
        description: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando resultados...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar los resultados</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!resultsData?.results.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              No hay resultados disponibles. Primero procesa algunos CVs.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Evaluación</CardTitle>
          <CardDescription>
            {resultsData.total_candidates} candidatos evaluados contra {resultsData.ddc_filename}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar candidatos..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Button onClick={handleExportCSV} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}