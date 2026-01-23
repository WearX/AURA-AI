'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { MermaidDiagram } from './MermaidDiagram'

interface TypingMessageProps {
  content: string
  isLatest: boolean
}

export function TypingMessage({ content, isLatest }: TypingMessageProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(!isLatest)
  const [mermaidCharts, setMermaidCharts] = useState<{code: string, index: number}[]>([])

  useEffect(() => {
    // Extract Mermaid diagrams from content
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
    const charts: {code: string, index: number}[] = []
    let match
    let matchIndex = 0

    while ((match = mermaidRegex.exec(content)) !== null) {
      charts.push({ code: match[1], index: matchIndex++ })
    }

    setMermaidCharts(charts)

    if (!isLatest) {
      setDisplayedText(content)
      setIsComplete(true)
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    let currentIndex = 0

    const timer = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedText(content.slice(0, currentIndex))
        currentIndex += 2 // Speed: 2 characters at a time for faster typing
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, 20) // 20ms per step

    return () => clearInterval(timer)
  }, [content, isLatest])

  // Split content by mermaid blocks
  const parts = displayedText.split(/```mermaid\n[\s\S]*?```/)

  return (
    <div className="text-base leading-relaxed prose max-w-none">
      {parts.map((part, index) => (
        <div key={index}>
          {part && <ReactMarkdown>{part}</ReactMarkdown>}
          {index < mermaidCharts.length && isComplete && (
            <MermaidDiagram chart={mermaidCharts[index].code} />
          )}
        </div>
      ))}
      {!isComplete && <span className="typing-cursor"></span>}
    </div>
  )
}
