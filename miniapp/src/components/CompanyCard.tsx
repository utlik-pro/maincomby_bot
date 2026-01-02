import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Globe, CheckCircle, ExternalLink } from 'lucide-react'
import { UserCompany, INDUSTRY_LABELS, Industry } from '@/types'
import { hapticFeedback } from '@/lib/telegram'

interface CompanyCardProps {
  userCompany: UserCompany | null
  compact?: boolean
  onEdit?: () => void
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  userCompany,
  compact = false,
  onEdit,
}) => {
  const company = userCompany?.company

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (company?.website_url) {
      hapticFeedback.light()
      window.open(company.website_url, '_blank')
    }
  }

  if (!company) {
    if (compact) return null

    return (
      <div className="bg-card rounded-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={18} className="text-gray-500" />
          <span className="font-semibold">Компания</span>
        </div>
        <p className="text-gray-500 text-sm text-center py-3">
          Не указана
        </p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-full mt-2 py-2 text-sm text-accent border border-accent/30 rounded-button"
          >
            Добавить компанию
          </button>
        )}
      </div>
    )
  }

  // Compact view - just company name in profile header
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm"
      >
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-5 h-5 rounded object-cover"
          />
        ) : (
          <Building2 size={16} className="text-gray-500" />
        )}
        <span className="text-gray-400">{userCompany.role || ''}</span>
        <span className="text-gray-300">@</span>
        <span className="text-white font-medium">{company.name}</span>
        {company.is_verified && (
          <CheckCircle size={14} className="text-accent" />
        )}
      </motion.div>
    )
  }

  // Full card view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={18} className="text-blue-400" />
        <span className="font-semibold">Компания</span>
        {onEdit && (
          <button
            onClick={onEdit}
            className="ml-auto text-xs text-gray-500"
          >
            Изменить
          </button>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Company logo */}
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Building2 size={24} className="text-gray-500" />
          </div>
        )}

        {/* Company info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{company.name}</h4>
            {company.is_verified && (
              <CheckCircle size={16} className="text-accent flex-shrink-0" />
            )}
          </div>

          {userCompany.role && (
            <p className="text-sm text-gray-400">{userCompany.role}</p>
          )}

          {company.industry && (
            <p className="text-xs text-gray-500 mt-1">
              {INDUSTRY_LABELS[company.industry as Industry] || company.industry}
            </p>
          )}
        </div>

        {/* Website link */}
        {company.website_url && (
          <button
            onClick={handleWebsiteClick}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink size={18} />
          </button>
        )}
      </div>

      {/* Description */}
      {company.description && (
        <p className="text-sm text-gray-400 mt-3 line-clamp-2">
          {company.description}
        </p>
      )}
    </motion.div>
  )
}

// Inline company display for profile header
interface CompanyInlineProps {
  userCompany: UserCompany | null
}

export const CompanyInline: React.FC<CompanyInlineProps> = ({ userCompany }) => {
  const company = userCompany?.company
  if (!company) return null

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-400">
      {company.logo_url ? (
        <img
          src={company.logo_url}
          alt=""
          className="w-4 h-4 rounded object-cover"
        />
      ) : (
        <Building2 size={14} />
      )}
      <span>
        {userCompany.role && `${userCompany.role} @ `}
        <span className="text-white">{company.name}</span>
      </span>
      {company.is_verified && (
        <CheckCircle size={12} className="text-accent" />
      )}
    </div>
  )
}
