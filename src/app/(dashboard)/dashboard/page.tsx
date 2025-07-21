import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock,
  Plus,
  BarChart3,
  Settings
} from 'lucide-react'
import Link from 'next/link'

// Datos de ejemplo - en producción vendrían de la API
const dashboardStats = {
  totalDDCs: 12,
  activeDDCs: 8,
  totalCVs: 1247,
  pendingProcessings: 3,
  completedProcessings: 28,
  averageScore: 72.5
}

const recentActivity = [
  {
    id: 1,
    type: 'processing_completed',
    message: 'Procesamiento completado para "Desarrollador Senior"',
    timestamp: '2024-01-15T10:30:00Z',
    ddcId: 'ddc-1'
  },
  {
    id: 2,
    type: 'new_cv',
    message: '15 nuevos CVs recibidos para "Product Manager"',
    timestamp: '2024-01-15T09:15:00Z',
    ddcId: 'ddc-2'
  },
  {
    id: 3,
    type: 'ddc_created',
    message: 'Nueva DDC creada: "Diseñador UX/UI"',
    timestamp: '2024-01-15T08:45:00Z',
    ddcId: 'ddc-3'
  }
]

const DashboardPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Bienvenido a tu panel de control de evaluación de CVs
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/dashboard/ddcs/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva DDC
            </Button>
          </Link>
          <Link href="/dashboard/company">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dashboard/ddcs" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total DDCs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalDDCs}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.activeDDCs} activas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CVs Recibidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCVs}</div>
            <p className="text-xs text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Procesamientos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingProcessings}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes • {dashboardStats.completedProcessings} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Último mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en tu plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {activity.type === 'processing_completed' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === 'new_cv' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'ddc_created' && (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Plus className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accesos directos a funciones principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/ddcs/create">
              <Button className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Crear Nueva DDC
              </Button>
            </Link>
            <Link href="/dashboard/ddcs">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Ver Todas las DDCs
              </Button>
            </Link>
            <Link href="/dashboard/notifications">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Centro de Notificaciones
              </Button>
            </Link>
            <Link href="/dashboard/company">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configuración de Empresa
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage 