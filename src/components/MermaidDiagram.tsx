'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
}

let mermaidInitialized = false

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#7c3aed',
          primaryTextColor: '#fff',
          primaryBorderColor: '#6d28d9',
          lineColor: '#7c3aed',
          secondaryColor: '#a78bfa',
          tertiaryColor: '#ddd6fe',
        },
      })
      mermaidInitialized = true
    }

    const renderDiagram = async () => {
      if (!ref.current) return

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(id, chart)
        ref.current.innerHTML = svg
        setError(null)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError('Nem sikerült a diagramot megjeleníteni')
      }
    }

    renderDiagram()
  }, [chart])

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="my-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <div ref={ref} className="flex justify-center items-center min-h-[200px]" />
    </div>
  )
}
