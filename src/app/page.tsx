import { PublicCVUpload } from '@/components/PublicCVUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Brain, Download } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">CV Evaluation System</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              Acceso RRHH
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Sube tu CV y obtén una evaluación inteligente
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Nuestro sistema de IA evalúa tu currículum y te proporciona un análisis detallado 
            de qué tan bien coincides con los requisitos del cargo.
          </p>
          
          {/* Upload Component */}
          <div className="max-w-md mx-auto">
            <PublicCVUpload />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Cómo funciona?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Sube tu CV</CardTitle>
                <CardDescription>
                  Formatos PDF o Word aceptados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Nuestro sistema extrae automáticamente la información relevante 
                  de tu currículum.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Análisis IA</CardTitle>
                <CardDescription>
                  Evaluación inteligente en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Comparamos tu perfil profesional, experiencia y habilidades 
                  con los requisitos del cargo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Resultados</CardTitle>
                <CardDescription>
                  Obtén tu puntuación de compatibilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Recibe un análisis detallado con tu porcentaje de compatibilidad 
                  y áreas de mejora.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 CV Evaluation System - Teletón. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}