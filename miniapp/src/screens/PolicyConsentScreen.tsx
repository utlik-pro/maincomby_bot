import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, FileText, ChevronRight, Check, Loader2 } from 'lucide-react'
import { hapticFeedback } from '@/lib/telegram'
import { acceptPolicies } from '@/lib/supabase'
import { CURRENT_POLICIES_VERSION } from '@/lib/store'
import { useAppStore, useToastStore } from '@/lib/store'
import { Button, Card } from '@/components/ui'
import { LegalScreen } from './LegalScreen'

interface PolicyConsentScreenProps {
  onAccepted: () => void
}

export const PolicyConsentScreen: React.FC<PolicyConsentScreenProps> = ({ onAccepted }) => {
  const { user, setUser } = useAppStore()
  const { addToast } = useToastStore()

  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleAccept = async () => {
    if (!user || !isChecked) return

    setIsLoading(true)
    hapticFeedback.medium()

    try {
      const success = await acceptPolicies(user.id, CURRENT_POLICIES_VERSION)

      if (success) {
        // Update local user state
        setUser({
          ...user,
          policies_accepted: true,
          policies_accepted_at: new Date().toISOString(),
          policies_version: CURRENT_POLICIES_VERSION
        })

        hapticFeedback.success()
        onAccepted()
      } else {
        hapticFeedback.error()
        addToast('Ошибка сохранения. Попробуйте ещё раз.', 'error')
      }
    } catch (error) {
      console.error('Failed to accept policies:', error)
      hapticFeedback.error()
      addToast('Ошибка сохранения. Попробуйте ещё раз.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Show legal screens
  if (showPrivacy) {
    return <LegalScreen type="privacy" onClose={() => setShowPrivacy(false)} />
  }
  if (showTerms) {
    return <LegalScreen type="terms" onClose={() => setShowTerms(false)} />
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center mb-6"
        >
          <Shield className="w-10 h-10 text-accent" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-2xl font-bold text-white text-center mb-3"
        >
          MAIN Community
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-gray-400 text-center mb-8 max-w-xs"
        >
          Для использования приложения необходимо согласиться с условиями
        </motion.p>

        {/* Policy Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-full max-w-sm space-y-3 mb-8"
        >
          <Card
            className="flex items-center justify-between p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => {
              hapticFeedback.light()
              setShowPrivacy(true)
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium">Политика конфиденциальности</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Card>

          <Card
            className="flex items-center justify-between p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => {
              hapticFeedback.light()
              setShowTerms(true)
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <span className="font-medium">Пользовательское соглашение</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Card>
        </motion.div>

        {/* Checkbox */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="w-full max-w-sm mb-6"
        >
          <label
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => {
              hapticFeedback.light()
              setIsChecked(!isChecked)
            }}
          >
            <div
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                transition-all duration-200
                ${isChecked
                  ? 'bg-accent border-accent'
                  : 'bg-transparent border-gray-500'
                }
              `}
            >
              {isChecked && <Check className="w-4 h-4 text-black" />}
            </div>
            <span className="text-sm text-gray-300 leading-relaxed">
              Я согласен с{' '}
              <span className="text-accent">Политикой конфиденциальности</span>
              {' '}и{' '}
              <span className="text-accent">Пользовательским соглашением</span>
            </span>
          </label>
        </motion.div>
      </div>

      {/* Bottom Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="px-6 pb-8"
      >
        <Button
          fullWidth
          size="lg"
          disabled={!isChecked || isLoading}
          onClick={handleAccept}
          icon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
        >
          {isLoading ? 'Сохранение...' : 'Продолжить'}
        </Button>
      </motion.div>
    </div>
  )
}

export default PolicyConsentScreen
