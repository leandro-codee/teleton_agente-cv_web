import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, User, Briefcase, Award, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import CVDetailClient from './CVDetailClient'

interface CVDetailPageProps {
  params: Promise<{ uuid: string }>
}

export default async function CVDetailPage({ params }: CVDetailPageProps) {
  const { uuid } = await params
  
  return <CVDetailClient uuid={uuid} />
}