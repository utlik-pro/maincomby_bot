import React from 'react'
import { motion } from 'framer-motion'
import {
  Diamond,
  Mic2,
  Handshake,
  Star,
  HeartHandshake,
  Crown,
  Flame,
  Trophy,
  Target,
  Heart,
  User,
  LucideIcon,
} from 'lucide-react'
import { AvatarSkin, TeamRole, SubscriptionTier } from '@/types'

// Team Role Config for badges
const ROLE_CONFIG: Record<string, { label: string, color: string, icon: LucideIcon }> = {
  core: { label: 'MAIN TEAM', color: '#c8ff00', icon: Diamond },
  partner: { label: 'ПАРТНЁР', color: '#3b82f6', icon: Handshake },
  sponsor: { label: 'СПОНСОР', color: '#eab308', icon: Star },
  volunteer: { label: 'ВОЛОНТЁР', color: '#22c55e', icon: HeartHandshake },
  speaker: { label: 'СПИКЕР', color: '#a855f7', icon: Mic2 },
}

// Subscription Tier Config for badges
const TIER_CONFIG: Record<string, { label: string, color: string, icon: LucideIcon }> = {
  pro: { label: 'PRO', color: '#f59e0b', icon: Crown },
  light: { label: 'LIGHT', color: '#10b981', icon: Flame },
}

// Skin icon mapping - maps skin slug to lucide icon component
const SKIN_ICONS: Record<string, LucideIcon> = {
  core_team: Diamond,     // Diamond for core team
  speaker: Mic2,
  partner: Handshake,
  sponsor: Star,          // Star for sponsors
  volunteer: HeartHandshake,
  pro_member: Crown,
  early_bird: Flame,
  champion: Trophy,
  event_regular: Target,
  networker: Heart,
}

// Get icon component for a skin
export const getSkinIcon = (slug: string): LucideIcon => {
  return SKIN_ICONS[slug] || User
}

// Get contrast color (black or white) for text on colored background
const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Avatar component
interface AvatarProps {
  src?: string | null | undefined
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  badge?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
}

// Proportional badge sizes for skin badges
const badgeSizeClasses: Record<string, string> = {
  sm: 'px-1 py-0.5 text-[7px] gap-0.5 -bottom-1',
  md: 'px-1.5 py-0.5 text-[9px] gap-0.5 -bottom-1.5',
  lg: 'px-1.5 py-0.5 text-[9px] gap-0.5 -bottom-1.5',  // уменьшен
  xl: 'px-2.5 py-0.5 text-xs gap-1 -bottom-2.5',
}

const badgeIconSizes: Record<string, number> = {
  sm: 8,
  md: 10,
  lg: 10,  // уменьшен с 12
  xl: 14,
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', badge, className = '' }) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full bg-bg-card border-2 border-accent overflow-hidden flex items-center justify-center`}
      >
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-accent font-bold">{initials || '?'}</span>
        )}
      </div>
      {badge && (
        <div className="absolute -bottom-1 -right-1 bg-accent text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-md">
          {badge}
        </div>
      )}
    </div>
  )
}

// Avatar with Skin component - unified display of avatars with skin rings
interface AvatarWithSkinProps {
  src?: string | null | undefined
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  badge?: string
  skin?: AvatarSkin | null
  role?: TeamRole
  tier?: SubscriptionTier | null
  showSkinBadge?: boolean  // Show skin badge with icon + text (default: true for md/lg/xl)
  className?: string
}

export const AvatarWithSkin: React.FC<AvatarWithSkinProps> = ({
  src,
  name,
  size = 'md',
  badge,
  skin,
  role,
  tier,
  showSkinBadge,
  className = ''
}) => {
  // Default: show skin badge for all sizes (proportionally scaled)
  const shouldShowSkinBadge = showSkinBadge ?? true

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Build inline styles for ring and glow (more reliable than Tailwind CSS vars)
  const getRingStyles = (): React.CSSProperties => {
    if (!skin) return {}

    const ringWidth = skin.ring_width || 4
    const ringOffset = skin.ring_offset || 2
    const ringColor = skin.ring_color || '#c8ff00'
    const bgColor = '#0a0a0a' // bg.DEFAULT from tailwind config

    // Build boxShadow: offset ring (bg color), main ring, optional glow
    const shadows: string[] = []

    // Offset ring (creates gap between avatar and ring)
    shadows.push(`0 0 0 ${ringOffset}px ${bgColor}`)

    // Main colored ring
    shadows.push(`0 0 0 ${ringOffset + ringWidth}px ${ringColor}`)

    // Optional glow effect
    if (skin.glow_enabled && skin.glow_color) {
      shadows.push(`0 0 ${skin.glow_intensity || 20}px ${skin.glow_color}`)
    }

    return { boxShadow: shadows.join(', ') }
  }

  // Determine what badge to show
  const getBadgeData = () => {
    // 1. If skin exists, use skin
    if (skin) {
      const Icon = getSkinIcon(skin.slug)
      return {
        label: skin.name.toUpperCase(),
        color: skin.ring_color,
        icon: Icon
      }
    }

    // 2. If role exists, use role
    if (role && ROLE_CONFIG[role]) {
      return ROLE_CONFIG[role]
    }

    // 3. If tier exists, use tier
    if (tier && TIER_CONFIG[tier]) {
      return TIER_CONFIG[tier]
    }

    // 4. Fallback to manual badge
    if (badge) {
      return {
        label: badge.toUpperCase(),
        color: '#c8ff00',
        icon: Star // Default icon for manual badges
      }
    }

    return null
  }

  const badgeData = getBadgeData()

  return (
    <div className={`relative ${className}`} style={{ overflow: 'visible' }}>
      <div
        className={`${sizeClasses[size]} rounded-full`}
        style={getRingStyles()}
      >
        <div
          className={`w-full h-full rounded-full bg-bg-card overflow-hidden flex items-center justify-center`}
        >
          {src ? (
            <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-accent font-bold">{initials || '?'}</span>
          )}
        </div>
      </div>
      {badgeData && shouldShowSkinBadge && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full flex items-center font-bold whitespace-nowrap z-10 ${badgeSizeClasses[size]}`}
          style={{
            backgroundColor: badgeData.color,
            color: getContrastColor(badgeData.color)
          }}
        >
          <badgeData.icon size={badgeIconSizes[size]} />
          {badgeData.label}
        </div>
      )}
    </div>
  )
}

// Skin preview component for skin selector
interface SkinPreviewProps {
  skin: AvatarSkin
  isActive?: boolean
  isLocked?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export const SkinPreview: React.FC<SkinPreviewProps> = ({
  skin,
  isActive = false,
  isLocked = false,
  onClick,
  size = 'md'
}) => {
  const sizeClass = size === 'sm' ? 'w-16 h-16' : 'w-20 h-20'
  const ringClass = size === 'sm' ? 'ring-2' : 'ring-4'

  const ringStyles: React.CSSProperties = {
    '--tw-ring-color': skin.ring_color,
  } as React.CSSProperties

  if (skin.glow_enabled && skin.glow_color) {
    ringStyles.boxShadow = `0 0 ${skin.glow_intensity || 20}px ${skin.glow_color}`
  }

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-3 rounded-xl
        ${onClick ? 'cursor-pointer' : ''}
        ${isActive ? 'bg-accent/20 border border-accent' : 'bg-bg-card'}
        ${isLocked ? 'opacity-50' : ''}
        transition-all
      `}
    >
      <div
        className={`${sizeClass} rounded-full ${ringClass} ring-offset-2 ring-offset-bg bg-gradient-to-br from-gray-600 to-gray-800`}
        style={ringStyles}
      >
        <div className="w-full h-full rounded-full flex items-center justify-center">
          {(() => {
            const IconComponent = getSkinIcon(skin.slug)
            const iconSize = size === 'sm' ? 24 : 32
            return <IconComponent size={iconSize} className="text-white/80" />
          })()}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-medium truncate max-w-[80px]">{skin.name}</div>
        {isLocked && <div className="text-[10px] text-gray-500">Заблокирован</div>}
        {isActive && <div className="text-[10px] text-accent">Активен</div>}
      </div>
    </motion.div>
  )
}

// Badge component
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'danger'
  className?: string
}

const badgeVariants = {
  default: 'bg-bg-card text-white',
  accent: 'bg-accent text-bg',
  success: 'bg-success text-bg',
  danger: 'bg-danger text-white',
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${badgeVariants[variant]} ${className}`}>
    {children}
  </span>
)

// Button component
interface ButtonProps {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  icon?: React.ReactNode
  isLoading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const buttonVariants = {
  primary: 'bg-accent text-bg hover:bg-accent-dark',
  secondary: 'bg-bg-card text-white hover:bg-bg-hover',
  outline: 'border border-accent text-accent hover:bg-accent hover:text-bg',
  ghost: 'text-white hover:bg-bg-card',
  danger: 'bg-danger text-white hover:opacity-90',
}

const buttonSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  isLoading = false,
  className = '',
  disabled,
  onClick,
  type = 'button',
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    type={type}
    className={`
      ${buttonVariants[variant]}
      ${buttonSizes[size]}
      ${fullWidth ? 'w-full' : ''}
      rounded-button font-semibold
      flex items-center justify-center gap-2
      transition-colors duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
    disabled={disabled || isLoading}
    onClick={onClick}
  >
    {isLoading ? (
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <>
        {icon && <span>{icon}</span>}
        {children}
      </>
    )}
  </motion.button>
)

// Card component
interface CardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  highlighted?: boolean
}

export const Card: React.FC<CardProps> = ({ children, onClick, className = '', highlighted = false }) => (
  <motion.div
    whileTap={onClick ? { scale: 0.98 } : undefined}
    onClick={onClick}
    className={`
      bg-bg-card rounded-card p-4
      ${onClick ? 'cursor-pointer card-hover' : ''}
      ${highlighted ? 'border border-accent' : ''}
      ${className}
    `}
  >
    {children}
  </motion.div>
)

// Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
      <input
        className={`
          w-full bg-bg-card text-white
          px-4 py-3 ${icon ? 'pl-12' : ''}
          rounded-button border-none
          outline-none focus:ring-2 focus:ring-accent
          placeholder:text-gray-500
        `}
        {...props}
      />
    </div>
    {error && <p className="text-danger text-sm mt-1">{error}</p>}
  </div>
)

// Progress bar
interface ProgressProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, className = '', showLabel = false }) => {
  const percentage = Math.min(100, (value / max) * 100)

  return (
    <div className={className}>
      <div className="h-2 bg-bg rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-accent rounded-full"
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {value} / {max}
        </div>
      )}
    </div>
  )
}

// Skeleton loader
interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-bg-card animate-pulse rounded-lg ${className}`} />
)

// Empty state
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
    {action}
  </div>
)

// Toast component
interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'xp'
  xpAmount?: number
  onClose: () => void
}

const toastStyles = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-bg-card border border-gray-700',
  xp: 'bg-gradient-to-r from-accent to-success',
}

export const Toast: React.FC<ToastProps> = ({ message, type, xpAmount, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`
      ${toastStyles[type]}
      px-4 py-3 rounded-card shadow-lg
      flex items-center gap-3
      ${type === 'xp' ? 'text-bg' : 'text-white'}
    `}
    onClick={onClose}
  >
    {type === 'xp' && <span className="text-2xl">⚡</span>}
    {type === 'success' && <span>✓</span>}
    {type === 'error' && <span>✕</span>}
    <div>
      {type === 'xp' && xpAmount && <div className="font-bold">+{xpAmount} XP</div>}
      <div className={type === 'xp' ? 'text-sm opacity-90' : ''}>{message}</div>
    </div>
  </motion.div>
)
