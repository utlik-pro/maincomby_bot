import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './ui'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  const variantStyles = {
    danger: {
      icon: <AlertTriangle size={32} className="text-red-400" />,
      confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: <AlertTriangle size={32} className="text-yellow-400" />,
      confirmClass: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    },
    default: {
      icon: null,
      confirmClass: 'bg-accent hover:bg-accent/90 text-bg',
    },
  }

  const styles = variantStyles[variant]

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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
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
              {styles.icon && (
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    {styles.icon}
                  </div>
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-center mb-2">{title}</h3>

              {/* Message */}
              <p className="text-gray-400 text-center mb-6">{message}</p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${styles.confirmClass}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmDialog
