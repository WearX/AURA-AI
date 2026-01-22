'use client'

import { useAppStore } from '@/lib/store'
import { Plus, X, ChevronLeft, Trash2, RotateCcw, Check, X as XIcon, Edit3 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { FlashcardDeck, Flashcard } from '@/lib/types'

export function DecksView() {
  const { decks, subjects, addDeck, deleteDeck, addCardToDeck, deleteCard, recordCardResult } = useAppStore()
  const [isCreating, setIsCreating] = useState(false)
  const [studyingDeck, setStudyingDeck] = useState<FlashcardDeck | null>(null)
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyComplete, setStudyComplete] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 })
  
  const [form, setForm] = useState({
    title: '',
    subject_id: '',
  })

  const [newCard, setNewCard] = useState({
    question: '',
    answer: ''
  })

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.subject_id) return

    const deckId = addDeck({
      title: form.title,
      subject_id: form.subject_id,
      cards: [],
      subject: subjects.find(s => s.id === form.subject_id)
    })

    setForm({ title: '', subject_id: '' })
    setIsCreating(false)
    
    // Open the deck for adding cards
    const newDeck = decks.find(d => d.id === deckId) || {
      id: deckId,
      title: form.title,
      subject_id: form.subject_id,
      cards: [],
      user_id: '',
      created_at: new Date().toISOString(),
      subject: subjects.find(s => s.id === form.subject_id)
    }
    setEditingDeck(newDeck)
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCard.question || !newCard.answer || !editingDeck) return

    addCardToDeck(editingDeck.id, {
      question: newCard.question,
      answer: newCard.answer,
      difficulty: 'medium'
    })

    setNewCard({ question: '', answer: '' })
    
    // Refresh editingDeck
    const updated = decks.find(d => d.id === editingDeck.id)
    if (updated) setEditingDeck(updated)
  }

  const startStudying = (deck: FlashcardDeck) => {
    if (deck.cards.length === 0) {
      alert('A pakli üres! Adj hozzá kártyákat először.')
      return
    }
    setStudyingDeck(deck)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setStudyComplete(false)
    setSessionStats({ correct: 0, wrong: 0 })
  }

  const handleAnswer = (correct: boolean) => {
    if (!studyingDeck) return
    
    const card = studyingDeck.cards[currentCardIndex]
    recordCardResult(studyingDeck.id, card.id, correct)
    
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1)
    }))

    if (currentCardIndex < studyingDeck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      setStudyComplete(true)
    }
  }

  // Study mode
  if (studyingDeck) {
    if (studyComplete) {
      const total = sessionStats.correct + sessionStats.wrong
      const percentage = Math.round((sessionStats.correct / total) * 100)
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="glass-card p-8 text-center max-w-sm w-full">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="text-2xl font-bold mb-2">Kész!</h2>
            <p className="text-slate-500 mb-6">
              {studyingDeck.cards.length} kártya átnézve
            </p>
            
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">{sessionStats.correct}</p>
                <p className="text-sm text-slate-500">Helyes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{sessionStats.wrong}</p>
                <p className="text-sm text-slate-500">Hibás</p>
              </div>
            </div>
            
            <div className="text-4xl font-bold mb-6">{percentage}%</div>
            
            <div className="space-y-2">
              <button
                onClick={() => startStudying(studyingDeck)}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold"
              >
                <RotateCcw size={18} className="inline mr-2" />
                Újra
              </button>
              <button
                onClick={() => setStudyingDeck(null)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
              >
                Vissza
              </button>
            </div>
          </div>
        </div>
      )
    }

    const card = studyingDeck.cards[currentCardIndex]
    
    return (
      <div className="min-h-screen flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setStudyingDeck(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm font-medium text-slate-500">
            {currentCardIndex + 1} / {studyingDeck.cards.length}
          </span>
          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-violet-600 rounded-full h-2 transition-all"
            style={{ width: `${((currentCardIndex + 1) / studyingDeck.cards.length) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-sm aspect-[3/4] cursor-pointer perspective-1000"
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 glass-card p-6 flex flex-col items-center justify-center backface-hidden">
                <p className="text-xs font-medium text-violet-600 mb-4">KÉRDÉS</p>
                <p className="text-xl font-semibold text-center">{card.question}</p>
                <p className="text-sm text-slate-400 mt-auto">Koppints a megfordításhoz</p>
              </div>
              
              {/* Back */}
              <div className="absolute inset-0 glass-card p-6 flex flex-col items-center justify-center backface-hidden rotate-y-180 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <p className="text-xs font-medium text-purple-600 mb-4">VÁLASZ</p>
                <p className="text-xl font-semibold text-center">{card.answer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Answer buttons */}
        {isFlipped && (
          <div className="flex gap-4 mt-6 pb-6">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              <XIcon size={20} />
              Nem tudtam
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Tudtam
            </button>
          </div>
        )}
      </div>
    )
  }

  // Edit deck mode
  if (editingDeck) {
    const currentDeck = decks.find(d => d.id === editingDeck.id) || editingDeck
    
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 glass-card mx-3 mt-3 p-3 flex items-center justify-between">
          <button
            onClick={() => setEditingDeck(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-semibold truncate flex-1 mx-4">{currentDeck.title}</h2>
          <button
            onClick={() => {
              if (confirm('Biztosan törlöd ezt a paklit?')) {
                deleteDeck(currentDeck.id)
                setEditingDeck(null)
              }
            }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="p-4 pb-28">
          {/* Add new card form */}
          <form onSubmit={handleAddCard} className="glass-card p-4 mb-6">
            <h3 className="font-semibold mb-4">Új kártya hozzáadása</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newCard.question}
                onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                placeholder="Kérdés"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500"
              />
              <textarea
                value={newCard.answer}
                onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                placeholder="Válasz"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 resize-none"
              />
              <button
                type="submit"
                disabled={!newCard.question || !newCard.answer}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                Kártya hozzáadása
              </button>
            </div>
          </form>

          {/* Cards list */}
          <h3 className="font-semibold mb-3">Kártyák ({currentDeck.cards.length})</h3>
          {currentDeck.cards.length > 0 ? (
            <div className="space-y-2">
              {currentDeck.cards.map((card, idx) => (
                <div key={card.id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">#{idx + 1}</p>
                      <p className="font-medium">{card.question}</p>
                      <p className="text-sm text-slate-500 mt-1">{card.answer}</p>
                    </div>
                    <button
                      onClick={() => deleteCard(currentDeck.id, card.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Még nincsenek kártyák</p>
          )}

          {/* Start studying button */}
          {currentDeck.cards.length > 0 && (
            <button
              onClick={() => startStudying(currentDeck)}
              className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25"
            >
              Tanulás ({currentDeck.cards.length} kártya)
            </button>
          )}
        </div>
      </div>
    )
  }

  // Create deck form
  if (isCreating) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 glass-card mx-3 mt-3 p-3 flex items-center justify-between">
          <button
            onClick={() => setIsCreating(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <X size={24} />
          </button>
          <h2 className="font-semibold">Új pakli</h2>
          <div className="w-10" />
        </div>

        <form onSubmit={handleCreateDeck} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Pakli neve</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="pl. Történelem - II. világháború"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Tantárgy</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm({ ...form, subject_id: s.id })}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.subject_id === s.id ? 'ring-2 ring-offset-2 ring-violet-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: form.subject_id === s.id ? s.color : s.color + '20',
                    color: form.subject_id === s.id ? 'white' : s.color
                  }}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!form.title || !form.subject_id}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            Pakli létrehozása
          </button>
        </form>
      </div>
    )
  }

  // Decks list
  return (
    <div className="p-4 pb-28 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-bold">Flashcard paklik</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 active:scale-95"
        >
          <Plus size={18} />
          Új
        </button>
      </div>

      {decks.length > 0 ? (
        <div className="space-y-3">
          {decks.map(deck => {
            const totalAttempts = deck.cards.reduce((a, c) => a + c.times_correct + c.times_wrong, 0)
            const totalCorrect = deck.cards.reduce((a, c) => a + c.times_correct, 0)
            const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null
            
            return (
              <div key={deck.id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: deck.subject?.color + '20' }}
                  >
                    {deck.subject?.icon || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{deck.title}</h3>
                    <p className="text-sm text-slate-500">
                      {deck.cards.length} kártya
                      {accuracy !== null && ` • ${accuracy}% pontosság`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingDeck(deck)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} />
                    Szerkesztés
                  </button>
                  <button
                    onClick={() => startStudying(deck)}
                    className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium"
                  >
                    Tanulás
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <Layers className="text-violet-500" size={36} />
          </div>
          <h3 className="text-xl font-bold mb-2">Még nincsenek paklijaid</h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">
            Hozz létre flashcard paklikat és tanulj velük!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25"
          >
            <Plus size={20} />
            Első pakli
          </button>
        </div>
      )}
    </div>
  )
}

// Add this to globals.css for the flip animation
const Layers = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
)
