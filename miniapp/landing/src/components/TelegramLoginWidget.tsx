'use client'

import React, { useEffect, useRef } from 'react'

interface TelegramLoginWidgetProps {
    botUsername: string
    onAuth: (user: TelegramUser) => void
    buttonSize?: 'large' | 'medium' | 'small'
    cornerRadius?: number
    requestAccess?: boolean
    usePic?: boolean
}

export interface TelegramUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
    // Extended fields from Supabase
    subscription_tier?: string | null
    created_at?: string | null
}

declare global {
    interface Window {
        TelegramLoginWidget: {
            dataOnauth: (user: TelegramUser) => void
        }
    }
}

export const TelegramLoginWidget: React.FC<TelegramLoginWidgetProps> = ({
    botUsername,
    onAuth,
    buttonSize = 'large',
    cornerRadius = 20,
    requestAccess = true,
    usePic = true,
}) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        // Define callback function in global scope
        // @ts-ignore
        window.onTelegramAuth = (user: TelegramUser) => {
            onAuth(user)
        }

        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-widget.js?22'
        script.setAttribute('data-telegram-login', botUsername)
        script.setAttribute('data-size', buttonSize)
        if (cornerRadius) script.setAttribute('data-radius', cornerRadius.toString())
        if (requestAccess) script.setAttribute('data-request-access', 'write')
        if (usePic === false) script.setAttribute('data-userpic', 'false')

        // Use the flat function name
        script.setAttribute('data-onauth', 'onTelegramAuth(user)')
        script.async = true

        ref.current.appendChild(script)

        return () => {
            if (ref.current) {
                ref.current.innerHTML = ''
            }
        }
    }, [botUsername, buttonSize, cornerRadius, requestAccess, usePic, onAuth])

    return <div ref={ref} className="telegram-login-widget" />
}
