'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { TelegramUser } from '@/components/TelegramLoginWidget'
import { AccessTier } from '@/data/courses'

export interface CourseAccessInfo {
    courseId: string
    hasAccess: boolean
    accessType: 'subscription' | 'purchased' | 'gifted' | null
    requiredTier: AccessTier
}

interface AuthContextType {
    user: TelegramUser | null
    isLoading: boolean
    subscriptionTier: string
    courseAccess: CourseAccessInfo[]
    login: (user: TelegramUser) => Promise<void>
    loginFromToken: (user: TelegramUser) => Promise<void> // For token-based auth (no hash verification)
    logout: () => void
    devLogin: () => void
    checkCourseAccess: (courseId: string) => CourseAccessInfo | undefined
    refreshCourseAccess: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<TelegramUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [subscriptionTier, setSubscriptionTier] = useState<string>('free')
    const [courseAccess, setCourseAccess] = useState<CourseAccessInfo[]>([])

    // Fetch course access for a user
    const fetchCourseAccess = useCallback(async (userId: number) => {
        try {
            const response = await fetch(`/api/courses/access?user_id=${userId}`)
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setSubscriptionTier(data.subscriptionTier || 'free')
                    setCourseAccess(data.courses || [])
                }
            }
        } catch (error) {
            console.error('Failed to fetch course access:', error)
        }
    }, [])

    // Refresh course access for current user
    const refreshCourseAccess = useCallback(async () => {
        if (user?.id) {
            await fetchCourseAccess(user.id)
        }
    }, [user?.id, fetchCourseAccess])

    // Check access for a specific course
    const checkCourseAccess = useCallback((courseId: string): CourseAccessInfo | undefined => {
        return courseAccess.find(ca => ca.courseId === courseId)
    }, [courseAccess])

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('telegram_user')
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser)
                setUser(parsedUser)
                // Fetch course access for stored user
                if (parsedUser.id) {
                    fetchCourseAccess(parsedUser.id)
                }
            } catch (e) {
                console.error('Failed to parse stored user', e)
                localStorage.removeItem('telegram_user')
            }
        }
        setIsLoading(false)
    }, [fetchCourseAccess])

    const login = async (userData: TelegramUser) => {
        try {
            const response = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })

            if (!response.ok) {
                const errText = await response.text()
                throw new Error(`Server Error: ${response.status} - ${errText}`)
            }

            const data = await response.json()

            if (data.success && data.user) {
                setUser(data.user)
                localStorage.setItem('telegram_user', JSON.stringify(data.user))
                // Fetch course access
                if (data.user.id) {
                    await fetchCourseAccess(data.user.id)
                }
            } else {
                throw new Error('Invalid response from server')
            }
        } catch (error: any) {
            console.error('Login error:', error)
        }
    }

    // Login from token-based auth (already verified by validate-token endpoint)
    const loginFromToken = async (userData: TelegramUser) => {
        try {
            // User is already verified by token, just save and fetch course access
            setUser(userData)
            setSubscriptionTier(userData.subscription_tier || 'free')
            localStorage.setItem('telegram_user', JSON.stringify(userData))

            // Fetch course access
            if (userData.id) {
                await fetchCourseAccess(userData.id)
            }
        } catch (error: any) {
            console.error('Login from token error:', error)
        }
    }

    const logout = () => {
        setUser(null)
        setSubscriptionTier('free')
        setCourseAccess([])
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
        <AuthContext.Provider value={{
            user,
            isLoading,
            subscriptionTier,
            courseAccess,
            login,
            loginFromToken,
            logout,
            devLogin,
            checkCourseAccess,
            refreshCourseAccess,
        }}>
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
