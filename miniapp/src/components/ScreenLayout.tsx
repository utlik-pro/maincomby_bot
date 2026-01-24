import React, { useEffect } from 'react'
import { useNavigationStore } from '@/lib/store'
import { backButton } from '@/lib/telegram'

interface ScreenLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  rightAction?: React.ReactNode
  onBack?: () => void // Custom back handler, defaults to popAdmin
  hideBackButton?: boolean
}

/**
 * Standard layout for admin/overlay screens
 * - Handles Telegram BackButton integration
 * - Provides consistent header with title and optional action button
 * - Accounts for Telegram WebApp safe area
 */
export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  subtitle,
  children,
  rightAction,
  onBack,
  hideBackButton = false,
}) => {
  const { popAdmin, adminStack } = useNavigationStore()

  // Handle back button
  useEffect(() => {
    if (hideBackButton) {
      backButton.hide()
      return
    }

    const handleBack = () => {
      if (onBack) {
        onBack()
      } else {
        popAdmin()
      }
    }

    backButton.show(handleBack)

    return () => {
      // Only hide if this component is unmounting and stack is empty
      if (adminStack.length <= 1) {
        backButton.hide()
      }
    }
  }, [onBack, popAdmin, adminStack.length, hideBackButton])

  return (
    <div className="fixed inset-0 z-[60] bg-bg flex flex-col">
      {/* Header - below Telegram's native header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-border shrink-0 bg-bg">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-400 truncate">{subtitle}</p>
          )}
        </div>
        {rightAction && (
          <div className="shrink-0">
            {rightAction}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  )
}

/**
 * Action button for ScreenLayout header
 */
interface ActionButtonProps {
  onClick: () => void
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  variant = 'primary',
  disabled = false,
}) => {
  const variants = {
    primary: 'bg-accent text-bg',
    secondary: 'bg-bg-card text-white border border-border',
    danger: 'bg-red-500/20 text-red-500',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-opacity ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {icon}
    </button>
  )
}
