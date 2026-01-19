/**
 * Custom HTML Block - Arbitrary HTML content
 */

import React, { useRef, useEffect } from 'react'
import type { AppBlock, CustomHtmlBlockConfig } from '@shared/types'

interface CustomHtmlBlockProps {
  block: AppBlock<'custom_html'>
}

export function CustomHtmlBlock({ block }: CustomHtmlBlockProps) {
  const config = block.config as CustomHtmlBlockConfig
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (config.sandbox && iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #fff;
                background: transparent;
              }
              ${config.css || ''}
            </style>
          </head>
          <body>${config.html}</body>
          </html>
        `)
        doc.close()
      }
    }
  }, [config.html, config.css, config.sandbox])

  if (config.sandbox) {
    return (
      <div className="px-4 mb-6">
        <iframe
          ref={iframeRef}
          className="w-full border-0 rounded-xl bg-bg-card"
          style={{ height: config.maxHeight || '200px' }}
          sandbox="allow-scripts"
          title="Custom content"
        />
      </div>
    )
  }

  // Direct HTML injection (use with caution)
  return (
    <div className="px-4 mb-6">
      <div
        className="rounded-xl bg-bg-card p-4 overflow-hidden"
        style={{ maxHeight: config.maxHeight }}
        dangerouslySetInnerHTML={{ __html: config.html }}
      />
      {config.css && (
        <style dangerouslySetInnerHTML={{ __html: config.css }} />
      )}
    </div>
  )
}
