'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TelegramUser } from '@/components/TelegramLoginWidget'

interface AuthContextType {
    user: TelegramUser | null
    isLoading: boolean
    login: (user: TelegramUser) => Promise<void>
    logout: () => void
    devLogin: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<TelegramUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('telegram_user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                console.error('Failed to parse stored user', e)
                localStorage.removeItem('telegram_user')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (userData: TelegramUser) => {
        try {
            // Validate with backend
            const response = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })

            if (!response.ok) {
                throw new Error('Verification failed')
            }

            const data = await response.json()

            if (data.success && data.user) {
                // Store verified and enriched user data
                setUser(data.user)
                localStorage.setItem('telegram_user', JSON.stringify(data.user))
            } else {
                throw new Error('Invalid server response')
            }
        } catch (error) {
            console.error('Login error:', error)
            alert('Login verification failed')
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('telegram_user')
    }

    const devLogin = () => {
        const mockUser: TelegramUser = {
            id: 123456789,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            photo_url: "",
            auth_date: Math.floor(Date.now() / 1000),
            hash: "mock_hash"
        }
        setUser(mockUser)
        localStorage.setItem('telegram_user', JSON.stringify(mockUser))
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, devLogin }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
