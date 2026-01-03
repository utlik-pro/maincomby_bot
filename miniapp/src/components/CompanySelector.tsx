import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
  Edit2,
  Trash2,
  CheckCircle,
  Search,
} from 'lucide-react'
import { Company, UserCompany, INDUSTRY_LABELS, Industry } from '@/types'
import {
  getCompanies,
  getUserCompany,
  setUserCompany,
  removeUserCompany,
} from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'
import { useToastStore } from '@/lib/store'

interface CompanySelectorProps {
  userId: number
  userCompany: UserCompany | null
  onCompanyChange: (company: UserCompany | null) => void
  className?: string
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  userId,
  userCompany,
  onCompanyChange,
  className = '',
}) => {
  const { addToast } = useToastStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    userCompany?.company_id || null
  )
  const [role, setRole] = useState(userCompany?.role || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load companies when expanded
  useEffect(() => {
    if (isExpanded && companies.length === 0) {
      loadCompanies()
    }
  }, [isExpanded])

  // Sync state when userCompany prop changes
  useEffect(() => {
    setSelectedCompanyId(userCompany?.company_id || null)
    setRole(userCompany?.role || '')
  }, [userCompany])

  const loadCompanies = async () => {
    setIsLoadingCompanies(true)
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (err) {
      setError('Не удалось загрузить список компаний')
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
    setIsEditing(false)
    setError(null)
    hapticFeedback.light()
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setIsExpanded(true)
    setError(null)
    hapticFeedback.light()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setIsExpanded(false)
    setSelectedCompanyId(userCompany?.company_id || null)
    setRole(userCompany?.role || '')
    setSearchQuery('')
    setError(null)
    hapticFeedback.light()
  }

  const handleSelectCompany = (company: Company) => {
    setSelectedCompanyId(company.id)
    setError(null)
    hapticFeedback.selection()
  }

  const sanitizeRole = (text: string): string => {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/[<>'"]/g, '')
      .slice(0, 100)
  }

  const handleSave = async () => {
    if (!selectedCompanyId) {
      setError('Выберите компанию')
      hapticFeedback.error()
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const sanitizedRole = sanitizeRole(role).trim() || null
      const saved = await setUserCompany(userId, selectedCompanyId, sanitizedRole)
      onCompanyChange(saved)
      setIsEditing(false)
      setIsExpanded(false)
      setSearchQuery('')
      hapticFeedback.success()
      addToast('Компания сохранена!', 'success')
    } catch (err) {
      setError('Не удалось сохранить компанию')
      hapticFeedback.error()
      addToast('Ошибка сохранения компании', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    setError(null)

    try {
      await removeUserCompany(userId)
      onCompanyChange(null)
      setSelectedCompanyId(null)
      setRole('')
      setIsEditing(false)
      setIsExpanded(false)
      hapticFeedback.success()
      addToast('Компания удалена', 'success')
    } catch (err) {
      setError('Не удалось удалить компанию')
      hapticFeedback.error()
      addToast('Ошибка удаления компании', 'error')
    } finally {
      setIsRemoving(false)
    }
  }

  // Filter companies by search query
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)
  const currentCompany = userCompany?.company

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={18} className="text-blue-400" />
        <span className="font-semibold">Компания</span>
      </div>

      {/* Current company display (when not editing) */}
      {!isEditing && userCompany?.company && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-bg"
        >
          <div className="flex items-start gap-3">
            {/* Company logo */}
            {currentCompany?.logo_url ? (
              <img
                src={currentCompany.logo_url}
                alt={currentCompany.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-gray-500" />
              </div>
            )}

            {/* Company info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{currentCompany?.name}</span>
                {currentCompany?.is_verified && (
                  <CheckCircle size={14} className="text-accent flex-shrink-0" />
                )}
              </div>
              {userCompany.role && (
                <p className="text-sm text-gray-400">{userCompany.role}</p>
              )}
              {currentCompany?.industry && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {INDUSTRY_LABELS[currentCompany.industry as Industry] || currentCompany.industry}
                </p>
              )}
            </div>

            {/* Edit/Remove buttons */}
            <div className="flex gap-1.5 flex-shrink-0">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleStartEdit}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                aria-label="Редактировать"
              >
                <Edit2 size={14} className="text-gray-400" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                disabled={isRemoving}
                className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/30 transition-colors"
                aria-label="Удалить"
              >
                {isRemoving ? (
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                ) : (
                  <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state / Add button (when no company selected) */}
      {!isEditing && !userCompany?.company && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleExpand}
          className="w-full p-3 rounded-xl bg-bg border border-dashed border-gray-700 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
        >
          <Building2 size={18} />
          <span className="text-sm">Добавить компанию</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </motion.button>
      )}

      {/* Edit/Selection mode */}
      <AnimatePresence>
        {(isEditing || (isExpanded && !userCompany?.company)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 rounded-xl bg-bg border border-accent/30 overflow-hidden"
          >
            {/* Search input */}
            <div className="relative mb-3">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск компании..."
                className="w-full bg-bg-card text-white pl-10 pr-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-500 text-sm"
              />
            </div>

            {/* Company list */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 mb-3">
              {isLoadingCompanies ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={24} className="animate-spin text-gray-500" />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchQuery ? 'Компании не найдены' : 'Нет доступных компаний'}
                </p>
              ) : (
                filteredCompanies.map((company) => (
                  <motion.button
                    key={company.id}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectCompany(company)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      selectedCompanyId === company.id
                        ? 'bg-accent/20 border border-accent/50'
                        : 'bg-bg-card hover:bg-gray-800'
                    }`}
                  >
                    {/* Logo */}
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-gray-500" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">
                          {company.name}
                        </span>
                        {company.is_verified && (
                          <CheckCircle size={12} className="text-accent flex-shrink-0" />
                        )}
                      </div>
                      {company.industry && (
                        <p className="text-xs text-gray-500 truncate">
                          {INDUSTRY_LABELS[company.industry as Industry] || company.industry}
                        </p>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {selectedCompanyId === company.id && (
                      <Check size={16} className="text-accent flex-shrink-0" />
                    )}
                  </motion.button>
                ))
              )}
            </div>

            {/* Role input */}
            {selectedCompanyId && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3"
              >
                <label className="block text-xs text-gray-400 mb-1.5">
                  Ваша должность (необязательно)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Например: Product Manager"
                  maxLength={100}
                  className="w-full bg-bg-card text-white px-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-500 text-sm"
                />
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">{role.length}/100</span>
                </div>
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <p className="text-danger text-xs mb-3">{error}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving || !selectedCompanyId}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent text-bg rounded-xl font-medium text-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Сохранить
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-gray-700 text-white rounded-xl text-sm"
              >
                Отмена
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CompanySelector
