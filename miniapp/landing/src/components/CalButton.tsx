'use client'

import { useEffect } from 'react'
import { getCalApi } from '@calcom/embed-react'

interface CalButtonProps {
    children: React.ReactNode
    className?: string
}

export function CalButton({ children, className }: CalButtonProps) {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi()
            cal('ui', {
                theme: 'dark',
                hideEventTypeDetails: false,
                layout: 'month_view'
            })
        })()
    }, [])

    return (
        <button
            data-cal-link="utlik/secret"
            data-cal-config='{"theme":"dark"}'
            className={className}
        >
            {children}
        </button>
    )
}
