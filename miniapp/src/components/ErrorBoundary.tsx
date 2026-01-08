import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    // TODO: Send to monitoring service (Sentry, LogRocket)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-bg text-white">
          <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
          <p className="text-gray-400 mb-6 text-center">Приложение столкнулось с ошибкой</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-3 bg-accent text-bg rounded-button font-semibold"
          >
            Попробовать снова
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
