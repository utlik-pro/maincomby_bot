import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, QrCode, Loader2, CheckCircle, XCircle, Keyboard, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
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
  const [mode, setMode] = useState<'manual' | 'scanner'>('manual')
  const [scannerReady, setScannerReady] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = 'qr-reader'

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  // Start/stop scanner when mode changes
  useEffect(() => {
    if (mode === 'scanner' && status === 'idle') {
      startScanner()
    } else {
      stopScanner()
    }
  }, [mode, status])

  const startScanner = async () => {
    try {
      // Wait for container to be rendered
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = document.getElementById(scannerContainerId)
      if (!container) return

      scannerRef.current = new Html5Qrcode(scannerContainerId)

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Extract 6-digit code from QR
          const codeMatch = decodedText.match(/\d{6}/)
          if (codeMatch) {
            hapticFeedback.success()
            setCode(codeMatch[0])
            stopScanner()
            setMode('manual')
            // Auto-submit
            handleSubmitWithCode(codeMatch[0])
          }
        },
        () => {} // Ignore scan failures
      )

      setScannerReady(true)
    } catch (error) {
      console.error('Scanner error:', error)
      addToast('Не удалось запустить камеру', 'error')
      setMode('manual')
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch (e) {
        // Ignore
      }
    }
    setScannerReady(false)
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

  const toggleMode = () => {
    hapticFeedback.light()
    setMode(mode === 'manual' ? 'scanner' : 'manual')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Войти на сайт</h1>
        </div>
      </div>

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
            : mode === 'scanner'
            ? 'Сканируйте QR-код'
            : 'Подтвердите вход на сайт'}
        </h2>

        <p className="text-gray-400 text-center mb-6">
          {status === 'success'
            ? 'Вы успешно вошли на сайт maincombybot.vercel.app'
            : status === 'error'
            ? errorMessage
            : mode === 'scanner'
            ? 'Наведите камеру на QR-код с экрана сайта'
            : 'Введите или отсканируйте код с сайта'}
        </p>

        {status === 'idle' || status === 'loading' ? (
          <>
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMode('manual'); hapticFeedback.light() }}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  mode === 'manual'
                    ? 'bg-accent text-black font-semibold'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <Keyboard size={18} />
                Ввести код
              </button>
              <button
                onClick={() => { setMode('scanner'); hapticFeedback.light() }}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  mode === 'scanner'
                    ? 'bg-accent text-black font-semibold'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <Camera size={18} />
                Сканер
              </button>
            </div>

            {mode === 'manual' ? (
              <>
                {/* Code Input */}
                <div className="mb-6">
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

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={code.replace(/\s/g, '').length !== 6 || status === 'loading'}
                  className="w-full"
                  size="lg"
                >
                  {status === 'loading' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    'Подтвердить'
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* QR Scanner */}
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-square relative">
                  <div id={scannerContainerId} className="w-full h-full" />
                  {!scannerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <Loader2 size={32} className="animate-spin text-accent" />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400">
                <span className="font-medium text-white block mb-2">Как это работает:</span>
                1. Откройте сайт maincombybot.vercel.app<br />
                2. Нажмите «Войти»<br />
                3. {mode === 'scanner' ? 'Отсканируйте QR-код' : 'Введите код с экрана сюда'}<br />
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
