'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCw, Layers } from 'lucide-react'

interface Flashcard {
  question: string
  answer: string
}

interface FlashcardDisplayProps {
  cards: Flashcard[]
  onCreateDeck?: () => void
}

export function FlashcardDisplay({ cards, onCreateDeck }: FlashcardDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  if (!cards || cards.length === 0) return null

  const currentCard = cards[currentIndex]

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* Flashcard */}
      <div
        className="relative h-64 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front - Question */}
          <div
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-white/70 text-sm font-medium mb-3">KÉRDÉS</div>
            <p className="text-white text-lg font-semibold text-center leading-relaxed">
              {currentCard.question}
            </p>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/60 text-xs flex items-center justify-center gap-2">
                <RotateCw size={12} />
                Kattints a megfordításhoz
              </p>
            </div>
          </div>

          {/* Back - Answer */}
          <div
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-white/70 text-sm font-medium mb-3">VÁLASZ</div>
            <p className="text-white text-lg font-semibold text-center leading-relaxed">
              {currentCard.answer}
            </p>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/60 text-xs flex items-center justify-center gap-2">
                <RotateCw size={12} />
                Kattints a visszafordításhoz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={20} className="text-slate-700 dark:text-slate-300" />
        </button>

        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentIndex + 1} / {cards.length}
          </p>
          <div className="flex gap-1 justify-center mt-2">
            {cards.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-violet-500'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={20} className="text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Save to Deck Button */}
      {onCreateDeck && (
        <button
          onClick={onCreateDeck}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all active:scale-95"
        >
          <Layers size={18} />
          Pakli létrehozása ({cards.length} kártya)
        </button>
      )}
    </div>
  )
}
