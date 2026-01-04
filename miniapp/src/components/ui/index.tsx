import React from 'react'
import { motion } from 'framer-motion'
import type { AvatarSkin } from '@/types'

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
  className?: string
}

export const AvatarWithSkin: React.FC<AvatarWithSkinProps> = ({
  src,
  name,
  size = 'md',
  badge,
  skin,
  className = ''
}) => {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Build ring classes based on skin
  const getRingClasses = () => {
    if (!skin) return ''

    const classes: string[] = []

    // Ring width
    const ringWidthMap: Record<number, string> = {
      2: 'ring-2',
      3: 'ring-[3px]',
      4: 'ring-4',
    }
    classes.push(ringWidthMap[skin.ring_width] || 'ring-4')

    // Ring offset
    const offsetMap: Record<number, string> = {
      1: 'ring-offset-1',
      2: 'ring-offset-2',
    }
    classes.push(offsetMap[skin.ring_offset] || 'ring-offset-2')
    classes.push('ring-offset-bg')

    return classes.join(' ')
  }

  // Build inline styles for ring color and glow
  const getRingStyles = (): React.CSSProperties => {
    if (!skin) return {}

    const styles: React.CSSProperties = {
      '--tw-ring-color': skin.ring_color,
    } as React.CSSProperties

    if (skin.glow_enabled && skin.glow_color) {
      styles.boxShadow = `0 0 ${skin.glow_intensity || 20}px ${skin.glow_color}`
    }

    return styles
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full ${getRingClasses()}`}
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
      {badge && (
        <div className="absolute -bottom-1 -right-1 bg-accent text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">
          {badge}
        </div>
      )}
      {skin?.icon_emoji && (
        <div className="absolute -top-1 -right-1 text-sm z-10">
          {skin.icon_emoji}
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
        <div className="w-full h-full rounded-full flex items-center justify-center text-2xl">
          {skin.icon_emoji || '👤'}
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
