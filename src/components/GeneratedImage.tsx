'use client'

import { useState } from 'react'
import { Download, Maximize2, X } from 'lucide-react'
import Image from 'next/image'

interface GeneratedImageProps {
  imageUrl: string
  prompt: string
}

export function GeneratedImage({ imageUrl, prompt }: GeneratedImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tanulasai-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert('Nem sikerült letölteni a képet')
    }
  }

  return (
    <>
      <div className="my-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
        {/* Image Container */}
        <div className="relative group">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={prompt}
            className="w-full h-auto"
            onLoad={() => setIsLoading(false)}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
              title="Nagyítás"
            >
              <Maximize2 size={20} className="text-slate-800" />
            </button>
            <button
              onClick={handleDownload}
              className="p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
              title="Letöltés"
            >
              <Download size={20} className="text-slate-800" />
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold">Prompt:</span> {prompt}
          </p>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setIsFullscreen(false)}
          >
            <X size={24} className="text-white" />
          </button>
          <img
            src={imageUrl}
            alt={prompt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
