'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, BarChart3, Settings } from 'lucide-react'
import { DDCUpload } from '@/components/DDCUpload'
import { CVBatchUpload } from '@/components/CVBatchUpload'
import { ProcessingSettings } from '@/components/ProcessingSettings'
import { ResultsView } from '@/components/ResultsView'

export function DashboardHome() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Evaluación de CVs
        </h1>
        <p className="text-gray-600">
          Gestiona la evaluación automática de currículums con inteligencia artificial
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Subir Archivos</span>
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Procesar</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Resultados</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Análisis</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* DDC Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {/* <FileUpload className="h-5 w-5 text-blue-600" /> */}
                  <span>Descripción del Cargo (DDC)</span>
                </CardTitle>
                <CardDescription>
                  Sube el documento que describe los requisitos del cargo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DDCUpload />
              </CardContent>
            </Card>

            {/* CV Batch Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span>CVs para Evaluar</span>
                </CardTitle>
                <CardDescription>
                  Sube múltiples CVs para evaluar (hasta 1000 archivos)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CVBatchUpload />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="process">
          <ProcessingSettings />
        </TabsContent>

        <TabsContent value="results">
          <ResultsView />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Avanzado</CardTitle>
              <CardDescription>
                Próximamente: gráficos y métricas detalladas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Esta funcionalidad estará disponible en una próxima versión.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}