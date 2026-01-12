import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { X } from 'lucide-react'

interface QRShareModalProps {
  url: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export const QRShareModal: React.FC<QRShareModalProps> = ({
  url,
  title,
  isOpen,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-bg-card rounded-card p-6 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Title */}
            <h3 className="text-white font-semibold text-center mb-4 pr-8">
              {title}
            </h3>

            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG
                  value={url}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Instruction */}
            <p className="text-gray-400 text-sm text-center">
              Сканируйте для перехода
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
