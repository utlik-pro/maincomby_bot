import React, { useState, useEffect } from 'react'
import { useAppStore, useToastStore } from '@/lib/store'
import { isInviteRequired, updateAppSetting } from '@/lib/supabase'
import { Settings, X, Shield, Users, AlertCircle, UserCog } from 'lucide-react'
import { UserRoleManager } from './UserRoleManager'

interface AdminSettingsPanelProps {
    onClose: () => void
}

export const AdminSettingsPanel: React.FC<AdminSettingsPanelProps> = ({ onClose }) => {
    const { user, setInviteRequired } = useAppStore()
    const { addToast } = useToastStore()

    const [inviteRequired, setLocalInviteRequired] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showRoleManager, setShowRoleManager] = useState(false)

    // Verify superadmin status
    const isSuperAdmin = ['dmitryutlik', 'utlik_offer'].includes(user?.username || '')

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setIsLoading(true)
        const required = await isInviteRequired()
        setLocalInviteRequired(required)
        setIsLoading(false)
    }

    const handleToggleInvite = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            const newValue = !inviteRequired
            const success = await updateAppSetting('invite_required', newValue, user.id)

            if (success) {
                setLocalInviteRequired(newValue)
                setInviteRequired(newValue)
                addToast(`Система инвайтов ${newValue ? 'включена' : 'выключена'}`, 'success')
            } else {
                addToast('Ошибка сохранения', 'error')
            }
        } catch (e) {
            console.error(e)
            addToast('Ошибка', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isSuperAdmin) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-sm bg-bg-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-border flex justify-between items-center bg-red-500/10">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-red-500">
                        <Shield size={20} />
                        Admin Control
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="p-4 rounded-xl bg-bg border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${inviteRequired ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/50 text-gray-500'}`}>
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold">Система инвайтов</div>
                                    <div className="text-xs text-gray-400">Доступ только по кодам</div>
                                </div>
                            </div>

                            <button
                                onClick={handleToggleInvite}
                                disabled={isSaving || isLoading}
                                className={`w-14 h-8 rounded-full p-1 transition-colors ${inviteRequired ? 'bg-green-500' : 'bg-gray-700'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${inviteRequired ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                            Если включено, новые пользователи не смогут войти без валидного инвайт-кода. Существующие пользователи сохранят доступ.
                        </p>
                    </div>

                    {/* User Role Management */}
                    <button
                        onClick={() => setShowRoleManager(true)}
                        className="w-full p-4 rounded-xl bg-bg border border-border hover:border-accent/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                                    <UserCog size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Управление ролями</div>
                                    <div className="text-xs text-gray-400">Назначать core, volunteer и др.</div>
                                </div>
                            </div>
                            <div className="text-accent">→</div>
                        </div>
                    </button>

                    {/* Future settings placeholders */}
                    <div className="p-4 rounded-xl bg-bg border border-border opacity-50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-700/50 text-gray-500 flex items-center justify-center">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold">Тех. работы</div>
                                    <div className="text-xs text-gray-400">Скоро</div>
                                </div>
                            </div>
                            <div className="w-14 h-8 rounded-full bg-gray-700/50" />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-bg border-t border-border text-center text-xs text-gray-600 font-mono">
                    LOGGED AS: {user?.username} (SUPERADMIN)
                </div>
            </div>

            {/* User Role Manager Modal */}
            {showRoleManager && (
                <UserRoleManager onClose={() => setShowRoleManager(false)} />
            )}
        </div>
    )
}
