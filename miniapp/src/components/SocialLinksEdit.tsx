import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Linkedin,
  Github,
  Gitlab,
  Instagram,
  Send,
  Globe,
  Briefcase,
  Palette,
  Dribbble,
  Link2,
  Plus,
  X,
  Check,
  Loader2,
  Trash2,
  Edit2,
} from 'lucide-react'
import { UserLink, LinkType, LINK_TYPE_CONFIG } from '@/types'
import { setUserLink, removeUserLink } from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'

// Icon mapping
const LINK_ICONS: Record<LinkType, React.ElementType> = {
  linkedin: Linkedin,
  github: Github,
  gitlab: Gitlab,
  behance: Palette,
  dribbble: Dribbble,
  instagram: Instagram,
  telegram_channel: Send,
  portfolio: Briefcase,
  website: Globe,
}

// URL validation patterns
const URL_PATTERNS: Record<LinkType, RegExp> = {
  linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i,
  github: /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/i,
  gitlab: /^(https?:\/\/)?(www\.)?gitlab\.com\/[\w-]+\/?$/i,
  behance: /^(https?:\/\/)?(www\.)?behance\.net\/[\w-]+\/?$/i,
  dribbble: /^(https?:\/\/)?(www\.)?dribbble\.com\/[\w-]+\/?$/i,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[\w.-]+\/?$/i,
  telegram_channel: /^(https?:\/\/)?(www\.)?t\.me\/[\w-]+\/?$/i,
  portfolio: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i,
  website: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i,
}

// Error messages for invalid URLs
const URL_ERROR_MESSAGES: Record<LinkType, string> = {
  linkedin: 'Введите ссылку вида linkedin.com/in/username',
  github: 'Введите ссылку вида github.com/username',
  gitlab: 'Введите ссылку вида gitlab.com/username',
  behance: 'Введите ссылку вида behance.net/username',
  dribbble: 'Введите ссылку вида dribbble.com/username',
  instagram: 'Введите ссылку вида instagram.com/username',
  telegram_channel: 'Введите ссылку вида t.me/channel',
  portfolio: 'Введите корректный URL',
  website: 'Введите корректный URL',
}

interface SocialLinksEditProps {
  userId: number
  links: UserLink[]
  onLinksChange: (links: UserLink[]) => void
  className?: string
}

interface EditingLink {
  linkType: LinkType
  url: string
  title: string
  isNew: boolean
}

export const SocialLinksEdit: React.FC<SocialLinksEditProps> = ({
  userId,
  links,
  onLinksChange,
  className = '',
}) => {
  const [editingLink, setEditingLink] = useState<EditingLink | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingType, setDeletingType] = useState<LinkType | null>(null)

  // Get available link types (not yet used)
  const usedTypes = new Set(links.map(l => l.link_type))
  const availableTypes = (Object.keys(LINK_TYPE_CONFIG) as LinkType[]).filter(
    type => !usedTypes.has(type)
  )

  const validateUrl = (linkType: LinkType, url: string): boolean => {
    if (!url.trim()) return false
    const pattern = URL_PATTERNS[linkType]
    return pattern.test(url)
  }

  const sanitizeUrl = (url: string): string => {
    // Remove potentially dangerous characters
    return url
      .replace(/<[^>]*>/g, '')
      .replace(/[<>'"]/g, '')
      .trim()
  }

  const handleStartAdd = (linkType: LinkType) => {
    setEditingLink({
      linkType,
      url: '',
      title: '',
      isNew: true,
    })
    setError(null)
    hapticFeedback.light()
  }

  const handleStartEdit = (link: UserLink) => {
    setEditingLink({
      linkType: link.link_type,
      url: link.url,
      title: link.title || '',
      isNew: false,
    })
    setError(null)
    hapticFeedback.light()
  }

  const handleCancelEdit = () => {
    setEditingLink(null)
    setError(null)
    hapticFeedback.light()
  }

  const handleSaveLink = async () => {
    if (!editingLink) return

    const sanitizedUrl = sanitizeUrl(editingLink.url)

    if (!validateUrl(editingLink.linkType, sanitizedUrl)) {
      setError(URL_ERROR_MESSAGES[editingLink.linkType])
      hapticFeedback.error()
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const savedLink = await setUserLink(
        userId,
        editingLink.linkType,
        sanitizedUrl,
        editingLink.title.trim() || undefined
      )

      // Update local state
      const existingIndex = links.findIndex(l => l.link_type === editingLink.linkType)
      if (existingIndex >= 0) {
        const updatedLinks = [...links]
        updatedLinks[existingIndex] = savedLink
        onLinksChange(updatedLinks)
      } else {
        onLinksChange([...links, savedLink])
      }

      setEditingLink(null)
      hapticFeedback.success()
    } catch (err) {
      setError('Не удалось сохранить ссылку')
      hapticFeedback.error()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveLink = async (linkType: LinkType) => {
    setDeletingType(linkType)

    try {
      await removeUserLink(userId, linkType)
      onLinksChange(links.filter(l => l.link_type !== linkType))
      hapticFeedback.success()
    } catch (err) {
      hapticFeedback.error()
    } finally {
      setDeletingType(null)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={18} className="text-purple-400" />
        <span className="font-semibold">Социальные ссылки</span>
      </div>

      {/* Existing links */}
      <div className="space-y-2 mb-3">
        <AnimatePresence mode="popLayout">
          {links.map((link) => {
            const Icon = LINK_ICONS[link.link_type] || Link2
            const config = LINK_TYPE_CONFIG[link.link_type]
            const isEditing = editingLink?.linkType === link.link_type && !editingLink.isNew
            const isDeleting = deletingType === link.link_type

            if (isEditing) {
              return (
                <motion.div
                  key={link.link_type}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-bg border border-accent/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: `${config?.color || '#6B7280'}20` }}
                    >
                      <Icon size={16} style={{ color: config?.color || '#6B7280' }} />
                    </div>
                    <span className="text-sm font-medium">{config?.label}</span>
                  </div>

                  <input
                    type="text"
                    value={editingLink.url}
                    onChange={(e) => {
                      setEditingLink({ ...editingLink, url: e.target.value })
                      setError(null)
                    }}
                    placeholder={config?.placeholder}
                    className="w-full bg-bg-card text-white px-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-500 text-sm mb-2"
                    autoFocus
                  />

                  <input
                    type="text"
                    value={editingLink.title}
                    onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                    placeholder="Заголовок (необязательно)"
                    maxLength={50}
                    className="w-full bg-bg-card text-white px-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-500 text-sm mb-2"
                  />

                  {error && (
                    <p className="text-danger text-xs mb-2">{error}</p>
                  )}

                  <div className="flex gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveLink}
                      disabled={isSaving || !editingLink.url.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-bg rounded-xl font-medium text-sm disabled:opacity-50"
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
                      className="px-4 py-2 bg-gray-700 text-white rounded-xl text-sm"
                    >
                      Отмена
                    </motion.button>
                  </div>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={link.link_type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-bg group"
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${config?.color || '#6B7280'}20` }}
                >
                  <Icon size={18} style={{ color: config?.color || '#6B7280' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {link.title || config?.label || link.link_type}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                </div>
                <div className="flex gap-1.5">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleStartEdit(link)}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label="Редактировать"
                  >
                    <Edit2 size={14} className="text-gray-400" />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveLink(link.link_type)}
                    disabled={isDeleting}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/30 transition-colors"
                    aria-label="Удалить"
                  >
                    {isDeleting ? (
                      <Loader2 size={14} className="animate-spin text-gray-400" />
                    ) : (
                      <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Add new link form */}
      {editingLink?.isNew && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-3 rounded-xl bg-bg border border-accent/30 mb-3"
        >
          {(() => {
            const Icon = LINK_ICONS[editingLink.linkType] || Link2
            const config = LINK_TYPE_CONFIG[editingLink.linkType]

            return (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: `${config?.color || '#6B7280'}20` }}
                  >
                    <Icon size={16} style={{ color: config?.color || '#6B7280' }} />
                  </div>
                  <span className="text-sm font-medium">{config?.label}</span>
                </div>

                <input
                  type="text"
                  value={editingLink.url}
                  onChange={(e) => {
                    setEditingLink({ ...editingLink, url: e.target.value })
                    setError(null)
                  }}
                  placeholder={config?.placeholder}
                  className="w-full bg-bg-card text-white px-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-500 text-sm mb-2"
                  autoFocus
                />

                <input
                  type="text"
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  placeholder="Заголовок (необязательно)"
                  maxLength={50}
                  className="w-full bg-bg-card text-white px-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-500 text-sm mb-2"
                />

                {error && (
                  <p className="text-danger text-xs mb-2">{error}</p>
                )}

                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveLink}
                    disabled={isSaving || !editingLink.url.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-accent text-bg rounded-xl font-medium text-sm disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Добавить
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-700 text-white rounded-xl text-sm"
                  >
                    Отмена
                  </motion.button>
                </div>
              </>
            )
          })()}
        </motion.div>
      )}

      {/* Add link buttons */}
      {availableTypes.length > 0 && !editingLink && (
        <div className="flex flex-wrap gap-2">
          {availableTypes.map((linkType) => {
            const Icon = LINK_ICONS[linkType] || Link2
            const config = LINK_TYPE_CONFIG[linkType]

            return (
              <motion.button
                key={linkType}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStartAdd(linkType)}
                className="flex items-center gap-2 px-3 py-2 bg-bg hover:bg-gray-800 rounded-xl text-sm transition-colors border border-gray-700/50"
              >
                <Icon size={14} style={{ color: config?.color || '#6B7280' }} />
                <span className="text-gray-400">{config?.label}</span>
                <Plus size={14} className="text-gray-500" />
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {links.length === 0 && !editingLink && (
        <p className="text-sm text-gray-500 text-center py-2">
          Добавьте ссылки на свои профили
        </p>
      )}
    </div>
  )
}

export default SocialLinksEdit
