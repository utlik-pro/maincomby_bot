import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Send, X } from 'lucide-react'
import { Button } from './ui'

interface PhoneDialogProps {
  isOpen: boolean
  onSubmit: (phone: string) => void
  onCancel: () => void
  onUseTelegram: () => void
}

export const PhoneDialog: React.FC<PhoneDialogProps> = ({
  isOpen,
  onSubmit,
  onCancel,
  onUseTelegram,
}) => {
  const [phone, setPhone] = useState('')
  const [mode, setMode] = useState<'choice' | 'manual'>('choice')

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Format as +XXX XX XXX-XX-XX
    if (digits.length <= 3) return `+${digits}`
    if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 8) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8)}`
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length >= 10) {
      onSubmit(`+${digits}`)
    }
  }

  const isValidPhone = phone.replace(/\D/g, '').length >= 10

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[40%] -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div className="bg-bg-card rounded-2xl p-6 shadow-xl border border-white/10">
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Phone size={32} className="text-accent" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center mb-2">Номер телефона</h3>

              {mode === 'choice' ? (
                <>
                  {/* Message */}
                  <p className="text-gray-400 text-center mb-6">
                    Для регистрации на мероприятие нужен номер телефона
                  </p>

                  {/* Buttons */}
                  <div className="space-y-3">
                    <Button fullWidth onClick={onUseTelegram}>
                      <Send size={18} />
                      Поделиться из Telegram
                    </Button>
                    <button
                      onClick={() => setMode('manual')}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                    >
                      Ввести вручную
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Manual input */}
                  <p className="text-gray-400 text-center mb-4 text-sm">
                    Введите номер в международном формате
                  </p>

                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+375 XX XXX-XX-XX"
                    className="w-full bg-bg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-accent text-center text-lg font-mono mb-4"
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setMode('choice')}
                      className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                    >
                      Назад
                    </button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!isValidPhone}
                      className="flex-1"
                    >
                      Готово
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PhoneDialog
