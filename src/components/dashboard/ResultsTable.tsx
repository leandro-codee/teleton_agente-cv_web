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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Eye, 
  ExternalLink, 
  Trash2, 
  Download, 
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'
import { CVAnalysis } from '@/types'

interface ResultsTableProps {
  results: CVAnalysis[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSearch: (query: string) => void
  onSort: (field: string, direction: 'asc' | 'desc') => void
  onViewCV: (cv: CVAnalysis, mode: 'modal' | 'tab') => void
  onRemoveCV: (cvId: string) => void
  onExport: (format: 'csv' | 'excel') => void
  isLoading?: boolean
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onSort,
  onViewCV,
  onRemoveCV,
  onExport,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortField(field)
    setSortDirection(direction)
    onSort(field, direction)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Resultados de Evaluación</CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={() => onExport('csv')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={() => onExport('excel')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>
        
        {/* Búsqueda y controles */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o profesión..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 filas</SelectItem>
              <SelectItem value="25">25 filas</SelectItem>
              <SelectItem value="50">50 filas</SelectItem>
              <SelectItem value="100">100 filas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('candidate_name')}
                    className="h-auto p-0 font-semibold"
                  >
                    Candidato
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('profession')}
                    className="h-auto p-0 font-semibold"
                  >
                    Profesión
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('years_experience')}
                    className="h-auto p-0 font-semibold"
                  >
                    Experiencia
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('total_score')}
                    className="h-auto p-0 font-semibold"
                  >
                    Puntuación Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Profesión</TableHead>
                <TableHead>Experiencia</TableHead>
                <TableHead>Habilidades</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Cargando resultados...
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No se encontraron resultados
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{result.candidate_name}</div>
                        <div className="text-sm text-gray-500">{result.cv?.original_filename}</div>
                      </div>
                    </TableCell>
                    <TableCell>{result.profession}</TableCell>
                    <TableCell>{result.years_experience} años</TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(result.total_score)}>
                        {result.total_score}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.profession_score}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.experience_score}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.skills_score}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewCV(result, 'modal')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewCV(result, 'tab')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRemoveCV(result.cv_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total} resultados
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ResultsTable 