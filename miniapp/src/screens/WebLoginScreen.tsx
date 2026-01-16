import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Loader2, CheckCircle, XCircle, Keyboard, Camera } from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, backButton, showQrScanner, isQrScannerSupported } from '@/lib/telegram'
import { Button, Input } from '@/components/ui'

interface WebLoginScreenProps {
  onBack: () => void
}

const WebLoginScreen: React.FC<WebLoginScreenProps> = ({ onBack }) => {
  const { user } = useAppStore()
  const { addToast } = useToastStore()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [qrSupported] = useState(isQrScannerSupported())

  // Setup Telegram back button
  useEffect(() => {
    backButton.show(onBack)
    return () => {
      backButton.hide()
    }
  }, [onBack])

  const handleScanQr = async () => {
    hapticFeedback.light()
    try {
      const scannedCode = await showQrScanner('Сканируйте QR-код с экрана сайта')
      if (scannedCode) {
        // Extract 6-digit code from QR
        const codeMatch = scannedCode.match(/\d{6}/)
        if (codeMatch) {
          hapticFeedback.success()
          setCode(codeMatch[0])
          // Auto-submit
          handleSubmitWithCode(codeMatch[0])
        } else {
          hapticFeedback.error()
          addToast('QR-код не содержит код авторизации', 'error')
        }
      }
    } catch (error) {
      console.error('QR Scanner error:', error)
    }
  }

  const handleSubmitWithCode = async (submitCode: string) => {
    if (!submitCode || submitCode.replace(/\s/g, '').length !== 6) {
      hapticFeedback.error()
      addToast('Введите 6-значный код', 'error')
      return
    }

    if (!user?.tg_user_id) {
      hapticFeedback.error()
      addToast('Ошибка авторизации', 'error')
      return
    }

    setStatus('loading')
    hapticFeedback.light()

    try {
      const response = await fetch('https://maincombybot.vercel.app/api/auth/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: submitCode.replace(/\s/g, ''),
          tg_user_id: user.tg_user_id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        hapticFeedback.success()
        addToast('Вход на сайт подтверждён!', 'success')

        setTimeout(() => {
          onBack()
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Ошибка подтверждения')
        hapticFeedback.error()
      }
    } catch (error) {
      console.error('Web login error:', error)
      setStatus('error')
      setErrorMessage('Ошибка соединения')
      hapticFeedback.error()
    }
  }

  const handleSubmit = () => handleSubmitWithCode(code)

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    if (digits.length > 3) {
      setCode(`${digits.slice(0, 3)} ${digits.slice(3)}`)
    } else {
      setCode(digits)
    }
  }

  const handleReset = () => {
    setCode('')
    setStatus('idle')
    setErrorMessage('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen pb-24 pt-4"
    >
      <div className="px-4 py-6">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
            {status === 'success' ? (
              <CheckCircle size={40} className="text-green-500" />
            ) : status === 'error' ? (
              <XCircle size={40} className="text-red-500" />
            ) : (
              <QrCode size={40} className="text-accent" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-2">
          {status === 'success'
            ? 'Вход подтверждён!'
            : status === 'error'
            ? 'Ошибка'
            : 'Войти на сайт'}
        </h2>

        <p className="text-gray-400 text-center mb-6">
          {status === 'success'
            ? 'Вы успешно вошли на сайт maincombybot.vercel.app'
            : status === 'error'
            ? errorMessage
            : 'Введите или отсканируйте код с сайта'}
        </p>

        {status === 'idle' || status === 'loading' ? (
          <>
            {/* Code Input */}
            <div className="mb-4">
              <Input
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="000 000"
                className="text-center text-3xl font-mono tracking-widest h-16"
                maxLength={7}
                inputMode="numeric"
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleSubmit}
                disabled={code.replace(/\s/g, '').length !== 6 || status === 'loading'}
                className="flex-1"
                size="lg"
              >
                {status === 'loading' ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Keyboard size={18} />
                    Подтвердить
                  </>
                )}
              </Button>

              {qrSupported && (
                <Button
                  onClick={handleScanQr}
                  disabled={status === 'loading'}
                  variant="secondary"
                  size="lg"
                  className="px-4"
                >
                  <Camera size={20} />
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400">
                <span className="font-medium text-white block mb-2">Как это работает:</span>
                1. Откройте сайт maincombybot.vercel.app<br />
                2. Нажмите «Войти»<br />
                3. {qrSupported ? 'Отсканируйте QR или введите код' : 'Введите код с экрана'}<br />
                4. Вы автоматически войдёте на сайт
              </p>
            </div>
          </>
        ) : status === 'error' ? (
          <Button
            onClick={handleReset}
            className="w-full"
            size="lg"
          >
            Попробовать снова
          </Button>
        ) : null}
      </div>
    </motion.div>
  )
}

export default WebLoginScreen
