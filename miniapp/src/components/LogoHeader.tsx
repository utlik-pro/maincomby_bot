import React from 'react'

export const LogoHeader: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[90px] bg-bg flex items-center justify-center pt-8">
      <img
        src="/logo.png"
        alt="MAIN"
        className="h-8 w-auto"
      />
    </div>
  )
}
