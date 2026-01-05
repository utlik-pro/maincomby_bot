import React from 'react'
import { Avatar } from '@/components/ui'
import { getSkinStyles } from '@/types'
import { Check } from 'lucide-react'

// Actually, I should check if utils exists. If not, I'll avoid cn.
// Let's assume standard tailwind utils or just use template literals.

interface AvatarWithSkinProps {
    src?: string | null
    name: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    skin?: any // UserAvatarSkin or AvatarSkin
    className?: string
    onClick?: () => void
}

export const AvatarWithSkin: React.FC<AvatarWithSkinProps> = ({
    src,
    name,
    size = 'md',
    skin,
    className = '',
    onClick
}) => {
    const styles = skin ? getSkinStyles(skin) : {}
    const hasGlow = skin?.glow_enabled && skin?.glow_color

    return (
        <div
            className={`relative inline-block ${className}`}
            onClick={onClick}
        >
            <div
                className={`rounded-full transition-shadow duration-300 ${skin ? 'ring-2 ring-offset-2 ring-offset-bg' : ''}`}
                style={styles}
            >
                <Avatar
                    src={src}
                    name={name}
                    className={`
            ${size === 'sm' ? 'w-8 h-8' : ''}
            ${size === 'md' ? 'w-10 h-10' : ''}
            ${size === 'lg' ? 'w-16 h-16' : ''}
            ${size === 'xl' ? 'w-24 h-24' : ''}
            ${size === '2xl' ? 'w-32 h-32' : ''}
          `}
                />
            </div>

            {/* Skin decoration badge if needed */}
            {skin?.icon_emoji && (
                <div className="absolute -top-1 -right-1 bg-bg-card rounded-full p-1 text-xs shadow-sm border border-border">
                    {skin.icon_emoji}
                </div>
            )}
        </div>
    )
}

interface SkinPreviewProps {
    skin: any
    isActive?: boolean
    isLocked?: boolean
    onClick?: () => void
    size?: 'sm' | 'md' | 'lg'
}

export const SkinPreview: React.FC<SkinPreviewProps> = ({
    skin,
    isActive,
    isLocked,
    onClick,
    size = 'md'
}) => {
    const styles = getSkinStyles(skin)

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={`
        relative group p-1 rounded-full transition-all duration-200
        ${isActive ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg scale-105' : 'hover:scale-105'}
        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <div
                className="rounded-full ring-2 ring-offset-1 ring-offset-bg"
                style={styles}
            >
                <div className={`
          bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center
          ${size === 'sm' ? 'w-12 h-12' : ''}
          ${size === 'md' ? 'w-16 h-16' : ''}
          ${size === 'lg' ? 'w-24 h-24' : ''}
        `}>
                    <span className="text-2xl">{skin.icon_emoji || '🎨'}</span>
                </div>
            </div>

            {isActive && (
                <div className="absolute top-0 right-0 bg-accent text-bg rounded-full p-0.5 shadow-md">
                    <Check size={12} strokeWidth={3} />
                </div>
            )}
        </button>
    )
}
