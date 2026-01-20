/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main theme colors (Cashew-style dark theme)
        bg: {
          DEFAULT: '#0a0a0a',
          card: '#1a1a1a',
          hover: '#252525',
        },
        accent: {
          DEFAULT: '#c8ff00',
          dark: '#a8d900',
        },
        success: '#00d26a',
        danger: '#ff4757',
        warning: '#ffa502',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'button': '14px',
      },
      animation: {
        'swipe-left': 'swipeLeft 0.3s ease-out forwards',
        'swipe-right': 'swipeRight 0.3s ease-out forwards',
        'pop': 'pop 0.2s ease-out',
        'flame-glow': 'flameGlow 2s ease-in-out infinite',
        'flame-pulse': 'flamePulse 1.5s ease-in-out infinite',
        'purple-glow': 'purpleGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateX(-120%) rotate(-15deg)', opacity: '0' },
        },
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateX(120%) rotate(15deg)', opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        flameGlow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'scale(1)',
          },
          '50%': {
            filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 20px rgba(251, 146, 60, 0.5))',
            transform: 'scale(1.05)',
          },
        },
        flamePulse: {
          '0%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
          },
          '50%': {
            opacity: '0.85',
            filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 24px rgba(239, 68, 68, 0.6))',
          },
        },
        purpleGlow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))',
            transform: 'scale(1)',
          },
          '50%': {
            filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 18px rgba(192, 132, 252, 0.4))',
            transform: 'scale(1.03)',
          },
        },
      },
    },
  },
  plugins: [],
}
