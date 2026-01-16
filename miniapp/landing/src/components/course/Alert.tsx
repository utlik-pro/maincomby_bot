'use client'

import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface AlertProps {
    variant: 'info' | 'warning' | 'danger' | 'success'
    title?: string
    children: React.ReactNode
}

const variantStyles = {
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: Info,
        iconColor: 'text-blue-400'
    },
    warning: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        icon: AlertTriangle,
        iconColor: 'text-yellow-400'
    },
    danger: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: AlertCircle,
        iconColor: 'text-red-400'
    },
    success: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        icon: CheckCircle,
        iconColor: 'text-green-400'
    }
}

export function Alert({ variant, title, children }: AlertProps) {
    const styles = variantStyles[variant]
    const Icon = styles.icon

    return (
        <div className={`${styles.bg} ${styles.border} border rounded-xl p-4 my-4`}>
            <div className="flex gap-3">
                <Icon className={`${styles.iconColor} shrink-0 mt-0.5`} size={20} />
                <div>
                    {title && (
                        <div className="font-semibold text-white mb-1">{title}</div>
                    )}
                    <div className="text-gray-300 text-sm leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
