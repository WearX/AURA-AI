'use client'

import { useAppStore } from '@/lib/store'
import { Send, Bot, User, Trash2, Sparkles, Loader2, Zap, Plus, Layers } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function ChatView() {
  const { messages, addMessage, clearMessages, userName, notes, decks, addDeck, addCardToDeck, subjects, setActiveTab } = useAppStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    const userMessage = input.trim()
    setInput('')
    addMessage({ role: 'user', content: userMessage })
    setIsTyping(true)

    try {
      const context = {
        notes: notes.map(n => n.title),
        decks: decks.map(d => d.title),
        totalCards: decks.reduce((acc, d) => acc + d.cards.length, 0)
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
    "Készíts 5 flashcardot a II. világháborúról!",
    "Készíts flashcardokat a fotoszintézisről!",
    "Magyarázd el a Pitagorasz-tételt!",
    "Milyen tanulási tippeket ajánlasz?"
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
              Kérd, hogy készítsek flashcardokat bármilyen témából! Vagy kérdezz bármit.
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
            const hasFlashcards = msg.role === 'assistant' && extractFlashcards(msg.content)
            
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
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div
                    className={`p-4 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-purple-500/20'
                        : 'glass-card rounded-2xl rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  
                  {/* Create flashcard button */}
                  {hasFlashcards && (
                    <button
                      onClick={() => createDeckFromMessage(msg.content)}
                      className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all active:scale-95"
                    >
                      <Layers size={16} />
                      Flashcard pakli létrehozása
                    </button>
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
        <div className="glass-card p-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Kérj flashcardokat vagy kérdezz bármit..."
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
