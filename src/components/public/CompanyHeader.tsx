import React from 'react'
import { Company } from '@/types'
import { Building, Globe, Mail } from 'lucide-react'

interface CompanyHeaderProps {
  company?: Company
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  const primaryColor = company?.primary_color || '#3B82F6'
  const secondaryColor = company?.secondary_color || '#1E40AF'

  return (
    <header 
      className="bg-white border-b shadow-sm"
      style={{ borderBottomColor: primaryColor + '20' }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {company?.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={`${company.name} logo`}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div 
                className="h-10 w-10 rounded flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Building className="h-5 w-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {company?.name || 'Empresa'}
              </h1>
              {company?.description && (
                <p className="text-sm text-gray-600">
                  {company.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {company?.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Globe className="h-4 w-4 mr-1" />
                Sitio web
              </a>
            )}
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: secondaryColor }}
            >
              Proceso de Selección
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default CompanyHeader 