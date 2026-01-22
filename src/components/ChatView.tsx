'use client'

import { useAppStore } from '@/lib/store'
import { Send, Bot, User, Trash2, Sparkles, Loader2, Zap, Paperclip, FileText, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { FlashcardDisplay } from './FlashcardDisplay'
import ReactMarkdown from 'react-markdown'

export function ChatView() {
  const { messages, addMessage, clearMessages, userName, notes, decks, addDeck, addCardToDeck, subjects, setActiveTab } = useAppStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check if message contains flashcards
  const extractFlashcards = (content: string) => {
    // Try to find JSON array in the message
    const jsonMatch = content.match(/\[[\s\S]*?\{[\s\S]*?"(?:question|kerdes|kérdés)"[\s\S]*?\}[\s\S]*?\]/i)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(item => ({
            question: item.question || item.kerdes || item.kérdés || item.Kerdes || item.Kérdés || '',
            answer: item.answer || item.valasz || item.válasz || item.Valasz || item.Válasz || ''
          })).filter(card => card.question && card.answer)
        }
      } catch (e) {
        console.log('JSON parse failed, trying text extraction')
      }
    }

    // Try to extract from formatted text like "Kérdés: ... Válasz: ..."
    const cards: { question: string; answer: string }[] = []
    const patterns = [
      /(?:\d+[\.\)]\s*)?(?:Kérd(?:ezés|és)):\s*(.+?)(?:\n|$)\s*Válasz:\s*(.+?)(?=\n\n|\n\d+[\.\)]|$)/gi,
      /(?:\d+[\.\)]\s*)?(?:K(?:érdés)?):\s*(.+?)(?:\n|$)\s*(?:V(?:álasz)?):\s*(.+?)(?=\n\n|\n\d+[\.\)]|$)/gi,
      /\*\*(?:Kérdés|Q)\*\*:\s*(.+?)\n\s*\*\*(?:Válasz|A)\*\*:\s*(.+?)(?=\n\n|\n\*\*|$)/gi
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && match[2]) {
          cards.push({
            question: match[1].trim().replace(/^\*\*|\*\*$/g, ''),
            answer: match[2].trim().replace(/^\*\*|\*\*$/g, '')
          })
        }
      }
      if (cards.length > 0) break
    }

    return cards.length > 0 ? cards : null
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Only allow text-based files
    const allowedTypes = ['.txt', '.md', '.pdf']
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!allowedTypes.includes(fileExt)) {
      alert('Csak .txt, .md vagy .pdf fájlokat tölthetsz fel!')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('A fájl túl nagy! Maximum 5MB lehet.')
      return
    }

    // Handle PDF files client-side
    if (fileExt === '.pdf') {
      try {
        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

        // Set worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise

        let fullText = ''
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
          fullText += pageText + '\n\n'
        }

        setUploadedFile({ name: file.name, content: fullText.trim() })
      } catch (error) {
        console.error('PDF parse error:', error)
        alert('Hiba történt a PDF feldolgozása során. Ellenőrizd, hogy érvényes PDF fájl-e!')
      }
    } else {
      // Handle text files
      const reader = new FileReader()
      reader.onload = async (event) => {
        const content = event.target?.result as string
        setUploadedFile({ name: file.name, content })
      }
      reader.readAsText(file)
    }
  }

  const createDeckFromMessage = (content: string) => {
    const cards = extractFlashcards(content)
    if (!cards || cards.length === 0) {
      alert('Nem találtam flashcardokat az üzenetben!')
      return
    }

    // Create a new deck
    const deckId = addDeck({
      title: `AI Flashcardok - ${new Date().toLocaleDateString('hu-HU')}`,
      subject_id: subjects[9]?.id || '10', // "Egyéb" category
      cards: [],
      subject: subjects[9]
    })

    // Add cards to the deck
    cards.forEach(card => {
      addCardToDeck(deckId, {
        question: card.question,
        answer: card.answer,
        difficulty: 'medium'
      })
    })

    alert(`✅ ${cards.length} flashcard létrehozva!`)
    setActiveTab('decks')
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    let userMessage = input.trim()

    // If file is uploaded, add it to the message
    if (uploadedFile) {
      userMessage += `\n\n[Feltöltött fájl: ${uploadedFile.name}]\n${uploadedFile.content.substring(0, 3000)}${uploadedFile.content.length > 3000 ? '...' : ''}`
    }

    setInput('')
    addMessage({ role: 'user', content: input.trim() + (uploadedFile ? ` 📎 ${uploadedFile.name}` : '') })
    setIsTyping(true)

    try {
      const context = {
        notes: notes.map(n => n.title),
        decks: decks.map(d => d.title),
        totalCards: decks.reduce((acc, d) => acc + d.cards.length, 0),
        uploadedFile: uploadedFile ? {
          name: uploadedFile.name,
          content: uploadedFile.content.substring(0, 5000) // Limit to 5000 chars
        } : null
      }

      const conversationHistory = [...messages, { role: 'user', content: userMessage }]
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          context
        }),
      })

      const data = await response.json()
      addMessage({ role: 'assistant', content: data.content })

      // Clear uploaded file after sending
      setUploadedFile(null)
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        role: 'assistant',
        content: '❌ Hiba történt a kapcsolódáskor. Ellenőrizd az internet kapcsolatot!'
      })
    } finally {
      setIsTyping(false)
    }
  }

  const quickPrompts = [
    "Taníts meg a fotoszintézisre! 🌱",
    "Készíts flashcardokat a II. világháborúról!",
    "Hogyan tanulhatnék hatékonyabban?",
    "Magyarázd el a Pitagorasz-tételt lépésről lépésre!"
  ]

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="glass-card m-3 mb-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI Mentor</h1>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Groq • Llama 3.3
              </span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
              <Bot className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Szia{userName ? `, ${userName}` : ''}! 👋
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Tölts fel jegyzeteket, kérj flashcardokat, vagy kérdezz bármit! Tanítok neked. 📚
            </p>
            
            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="p-3 text-sm text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const flashcards = msg.role === 'assistant' ? extractFlashcards(msg.content) : null

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                    <Bot className="text-white" size={18} />
                  </div>
                )}
                <div className="flex flex-col gap-3 max-w-[85%]">
                  <div
                    className={`p-4 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-purple-500/20'
                        : 'glass-card rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed prose max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {/* Interactive Flashcard Display */}
                  {flashcards && (
                    <FlashcardDisplay
                      cards={flashcards}
                      onCreateDeck={() => createDeckFromMessage(msg.content)}
                    />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="text-slate-600 dark:text-slate-300" size={18} />
                  </div>
                )}
              </div>
            )
          })
        )}
        
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
              <Bot className="text-white" size={18} />
            </div>
            <div className="glass-card p-4 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 pt-0">
        {/* Uploaded file indicator */}
        {uploadedFile && (
          <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
            <FileText size={16} className="text-violet-600 dark:text-violet-400" />
            <span className="text-sm text-violet-700 dark:text-violet-300 flex-1 truncate">
              {uploadedFile.name}
            </span>
            <button
              onClick={() => setUploadedFile(null)}
              className="p-1 hover:bg-violet-200 dark:hover:bg-violet-800 rounded-lg transition-colors"
            >
              <X size={14} className="text-violet-600 dark:text-violet-400" />
            </button>
          </div>
        )}

        <div className="glass-card p-2 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            title="Jegyzet feltöltése"
          >
            <Paperclip size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={uploadedFile ? "Kérdezz a feltöltött jegyzetről..." : "Tölts fel jegyzetet vagy kérdezz bármit..."}
            disabled={isTyping}
            className="flex-1 px-4 py-3 bg-transparent outline-none placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
