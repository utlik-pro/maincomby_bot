import React from 'react'
import { motion } from 'framer-motion'
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
  ExternalLink,
} from 'lucide-react'
import { UserLink, LinkType, LINK_TYPE_CONFIG } from '@/types'
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

interface SocialLinksProps {
  links: UserLink[]
  title?: string
  compact?: boolean
  onEdit?: () => void
  showEmpty?: boolean
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  links,
  title = 'Ссылки',
  compact = false,
  onEdit,
  showEmpty = true,
}) => {
  const handleLinkClick = (link: UserLink) => {
    hapticFeedback.light()
    let url = link.url
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    window.open(url, '_blank')
  }

  if (links.length === 0 && !showEmpty) {
    return null
  }

  // Compact inline view - just icons
  if (compact) {
    if (links.length === 0) return null

    return (
      <div className="flex items-center gap-2">
        {links.map((link) => {
          const Icon = LINK_ICONS[link.link_type] || Link2
          const config = LINK_TYPE_CONFIG[link.link_type]

          return (
            <motion.button
              key={link.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleLinkClick(link)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              style={{ color: config?.color || '#fff' }}
              title={link.title || config?.label}
            >
              <Icon size={18} />
            </motion.button>
          )
        })}
      </div>
    )
  }

  // Full card view
  return (
    <div className="bg-card rounded-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Link2 size={18} className="text-purple-400" />
        <span className="font-semibold">{title}</span>
        {onEdit && (
          <button onClick={onEdit} className="ml-auto text-xs text-gray-500">
            Изменить
          </button>
        )}
      </div>

      {links.length === 0 ? (
        <div className="text-center py-3">
          <p className="text-gray-500 text-sm">Нет ссылок</p>
          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 px-4 py-1.5 text-xs text-accent border border-accent/30 rounded-button"
            >
              Добавить ссылки
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => {
            const Icon = LINK_ICONS[link.link_type] || Link2
            const config = LINK_TYPE_CONFIG[link.link_type]

            return (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleLinkClick(link)}
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-bg hover:bg-gray-800 transition-colors text-left group"
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
                <ExternalLink
                  size={16}
                  className="text-gray-500 group-hover:text-white transition-colors flex-shrink-0"
                />
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Single link button for inline use
interface LinkButtonProps {
  link: UserLink
  size?: 'sm' | 'md' | 'lg'
}

export const LinkButton: React.FC<LinkButtonProps> = ({ link, size = 'md' }) => {
  const Icon = LINK_ICONS[link.link_type] || Link2
  const config = LINK_TYPE_CONFIG[link.link_type]

  const iconSizes = { sm: 14, md: 18, lg: 22 }
  const paddings = { sm: 'p-1.5', md: 'p-2', lg: 'p-2.5' }

  const handleClick = () => {
    hapticFeedback.light()
    let url = link.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className={`${paddings[size]} rounded-full bg-gray-800 hover:bg-gray-700 transition-colors`}
      style={{ color: config?.color || '#fff' }}
      title={link.title || config?.label}
    >
      <Icon size={iconSizes[size]} />
    </button>
  )
}
