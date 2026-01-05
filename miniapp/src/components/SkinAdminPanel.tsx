import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Search,
  X,
  Check,
  Palette,
  User,
} from 'lucide-react'
import { searchUsersForAdmin, getAllSkins, adminAssignSkin, createNotification } from '@/lib/supabase'
import { AvatarWithSkin, Card, Input, Button, Badge } from '@/components/ui'
import { useAppStore, useToastStore } from '@/lib/store'
import type { AvatarSkin } from '@/types'

interface SkinAdminPanelProps {
  onClose: () => void
}

const SkinAdminPanel: React.FC<SkinAdminPanelProps> = ({ onClose }) => {
  const { user: adminUser } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Search users
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['adminSearchUsers', searchQuery],
    queryFn: () => searchUsersForAdmin(searchQuery),
    enabled: searchQuery.length >= 2,
  })

  // Get all skins
  const { data: allSkins = [] } = useQuery({
    queryKey: ['allSkins'],
    queryFn: getAllSkins,
  })

  // Assign skin mutation
  const assignSkinMutation = useMutation({
    mutationFn: async ({ userId, skinId, skinName }: { userId: number; skinId: string | null; skinName: string | null }) => {
      const success = await adminAssignSkin(userId, skinId)
      if (success) {
        // Send notification to user
        const adminName = adminUser?.first_name || 'Админ'
        if (skinId && skinName) {
          await createNotification(
            userId,
            'system',
            `${skinName} получен!`,
            `${adminName} назначил тебе скин "${skinName}"`,
            { skinId }
          )
        } else {
          await createNotification(
            userId,
            'system',
            'Скин снят',
            `${adminName} снял с тебя скин`,
            {}
          )
        }
      }
      return success
    },
    onSuccess: () => {
      addToast('Скин назначен!', 'success')
      queryClient.invalidateQueries({ queryKey: ['adminSearchUsers'] })
    },
    onError: () => {
      addToast('Ошибка назначения скина', 'error')
    },
  })

  const handleAssignSkin = (skinId: string | null) => {
    if (!selectedUser) return
    const skin = skinId ? allSkins.find((s: AvatarSkin) => s.id === skinId) : null
    assignSkinMutation.mutate({
      userId: selectedUser.id,
      skinId,
      skinName: skin?.name || null
    })
    // Update local state immediately
    setSelectedUser({
      ...selectedUser,
      active_skin_id: skinId,
      active_skin: skin || null,
    })
  }

  const getProfileData = (user: any) => {
    return Array.isArray(user.profile) ? user.profile[0] : user.profile
  }

  const getSkinData = (user: any) => {
    return Array.isArray(user.active_skin) ? user.active_skin[0] : user.active_skin
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-bg-card">
        <button onClick={onClose} className="text-gray-400">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Управление скинами</h1>
          <p className="text-sm text-gray-400">Назначение скинов пользователям</p>
        </div>
      </div>

      <div className="p-4">
        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Поиск по username или имени..."
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-2">
              {isSearching ? 'Поиск...' : `Найдено: ${searchResults.length}`}
            </h3>
            <div className="space-y-2">
              {searchResults.map((user: any) => {
                const profileData = getProfileData(user)
                const skinData = getSkinData(user)
                const isSelected = selectedUser?.id === user.id

                return (
                  <Card
                    key={user.id}
                    onClick={() => setSelectedUser(isSelected ? null : user)}
                    highlighted={isSelected}
                    className="flex items-center gap-3"
                  >
                    <AvatarWithSkin
                      src={profileData?.photo_url}
                      name={user.first_name}
                      size="md"
                      skin={skinData}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        @{user.username || 'no username'}
                      </div>
                    </div>
                    {skinData && (
                      <Badge variant="accent">{skinData.name}</Badge>
                    )}
                    {isSelected && (
                      <Check size={20} className="text-accent" />
                    )}
                  </Card>
                )
              })}
              {searchResults.length === 0 && !isSearching && (
                <div className="text-center text-gray-400 py-4">
                  Пользователи не найдены
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected User - Skin Selection */}
        {selectedUser && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={20} className="text-accent" />
              <h3 className="font-semibold">
                Выбери скин для {selectedUser.first_name}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* No Skin Option */}
              <Card
                onClick={() => handleAssignSkin(null)}
                highlighted={!selectedUser.active_skin_id}
                className="text-center py-4"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-bg flex items-center justify-center">
                  <User size={24} className="text-gray-500" />
                </div>
                <div className="font-medium text-sm">Без скина</div>
                <div className="text-xs text-gray-500">Обычный аватар</div>
                {!selectedUser.active_skin_id && (
                  <div className="mt-2">
                    <Badge variant="success">Текущий</Badge>
                  </div>
                )}
              </Card>

              {/* Skin Options */}
              {allSkins.map((skin: AvatarSkin) => {
                const isActive = selectedUser.active_skin_id === skin.id

                return (
                  <Card
                    key={skin.id}
                    onClick={() => handleAssignSkin(skin.id)}
                    highlighted={isActive}
                    className="text-center py-4"
                  >
                    <div
                      className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{
                        boxShadow: `0 0 0 3px ${skin.ring_color}`,
                        backgroundColor: '#1a1a1a',
                      }}
                    >
                      <span className="text-lg">{skin.icon_emoji}</span>
                    </div>
                    <div className="font-medium text-sm">{skin.name}</div>
                    <div className="text-xs text-gray-500 truncate px-2">
                      {skin.description}
                    </div>
                    {isActive && (
                      <div className="mt-2">
                        <Badge variant="success">Текущий</Badge>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && !selectedUser && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">
              Введи username или имя пользователя для поиска
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SkinAdminPanel
