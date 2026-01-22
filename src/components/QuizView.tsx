'use client'

import { useAppStore } from '@/lib/store'
import { useState, useMemo } from 'react'
import { Sparkles, Play, ChevronLeft, Check, X, Trophy, RotateCcw } from 'lucide-react'
import { FlashcardDeck, QuizQuestion } from '@/lib/types'

export function QuizView() {
  const { decks, notes, addQuiz, quizzes } = useAppStore()
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  const generateQuiz = async (deck: FlashcardDeck) => {
    if (deck.cards.length < 3) {
      alert('Legalább 3 kártya kell a kvízhez!')
      return
    }

    setIsGenerating(true)
    setSelectedDeck(deck)

    try {
      // Create quiz questions from flashcards
      const questions: QuizQuestion[] = deck.cards.slice(0, 10).map((card, idx) => {
        // Get wrong answers from other cards
        const otherCards = deck.cards.filter(c => c.id !== card.id)
        const wrongAnswers = otherCards
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(c => c.answer)

        // If not enough other cards, add generic wrong answers
        while (wrongAnswers.length < 3) {
          wrongAnswers.push(`Helytelen válasz ${wrongAnswers.length + 1}`)
        }

        // Shuffle all answers
        const allAnswers = [card.answer, ...wrongAnswers].sort(() => Math.random() - 0.5)
        const correctIndex = allAnswers.indexOf(card.answer)

        return {
          id: crypto.randomUUID(),
          question: card.question,
          options: allAnswers,
          correct_answer: correctIndex,
          explanation: card.answer
        }
      })

      setQuizQuestions(questions)
      setCurrentQuestion(0)
      setScore(0)
      setQuizComplete(false)
      setSelectedAnswer(null)
      setShowResult(false)

    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Hiba történt a kvíz generálásakor')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
    setShowResult(true)

    if (index === quizQuestions[currentQuestion].correct_answer) {
      setScore(prev => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  // Quiz complete screen
  if (quizComplete && selectedDeck) {
    const percentage = Math.round((score / quizQuestions.length) * 100)
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="glass-card p-8 text-center max-w-sm w-full">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Trophy className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Kvíz vége!</h2>
          <p className="text-slate-500 mb-6">{selectedDeck.title}</p>
          
          <div className="text-5xl font-bold mb-2">{percentage}%</div>
          <p className="text-slate-500 mb-6">{score} / {quizQuestions.length} helyes válasz</p>
          
          <div className="text-4xl mb-6">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : percentage >= 40 ? '💪' : '📚'}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => generateQuiz(selectedDeck)}
              className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Újra
            </button>
            <button
              onClick={() => {
                setSelectedDeck(null)
                setQuizQuestions([])
              }}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold"
            >
              Vissza
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz in progress
  if (quizQuestions.length > 0 && selectedDeck) {
    const question = quizQuestions[currentQuestion]
    
    return (
      <div className="min-h-screen flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setSelectedDeck(null)
              setQuizQuestions([])
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm font-medium text-slate-500">
            {currentQuestion + 1} / {quizQuestions.length}
          </span>
          <span className="text-sm font-bold text-violet-600">{score} pont</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-violet-600 rounded-full h-2 transition-all"
            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="glass-card p-6 mb-6">
          <p className="text-xs font-medium text-violet-600 mb-2">KÉRDÉS {currentQuestion + 1}</p>
          <h2 className="text-xl font-semibold">{question.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {question.options.map((option, idx) => {
            let buttonClass = 'w-full p-4 rounded-xl text-left font-medium transition-all '
            
            if (showResult) {
              if (idx === question.correct_answer) {
                buttonClass += 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300'
              } else if (idx === selectedAnswer) {
                buttonClass += 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300'
              } else {
                buttonClass += 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent opacity-50'
              }
            } else {
              buttonClass += 'glass-card border-2 border-transparent hover:border-violet-300 dark:hover:border-violet-700 active:scale-[0.98]'
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                  {showResult && idx === question.correct_answer && (
                    <Check className="ml-auto text-emerald-500" size={20} />
                  )}
                  {showResult && idx === selectedAnswer && idx !== question.correct_answer && (
                    <X className="ml-auto text-red-500" size={20} />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Next button */}
        {showResult && (
          <button
            onClick={nextQuestion}
            className="mt-6 w-full py-4 bg-violet-600 text-white rounded-xl font-bold"
          >
            {currentQuestion < quizQuestions.length - 1 ? 'Következő kérdés' : 'Eredmények'}
          </button>
        )}
      </div>
    )
  }

  // Deck selection
  return (
    <div className="p-4 pb-28 max-w-lg mx-auto">
      <div className="mb-6 pt-2">
        <h1 className="text-2xl font-bold">Kvíz</h1>
        <p className="text-slate-500 text-sm mt-1">Válassz egy paklit a kvízhez</p>
      </div>

      {decks.length > 0 ? (
        <div className="space-y-3">
          {decks.filter(d => d.cards.length >= 3).map(deck => (
            <button
              key={deck.id}
              onClick={() => generateQuiz(deck)}
              disabled={isGenerating}
              className="w-full glass-card p-4 text-left hover:border-violet-300 dark:hover:border-violet-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: deck.subject?.color + '20' }}
                >
                  {deck.subject?.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{deck.title}</h3>
                  <p className="text-sm text-slate-500">{deck.cards.length} kérdés</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Play className="text-violet-600" size={18} />
                </div>
              </div>
            </button>
          ))}
          
          {decks.filter(d => d.cards.length >= 3).length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">Legalább 3 kártyás pakli kell a kvízhez</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <Sparkles className="text-violet-500" size={36} />
          </div>
          <h3 className="text-xl font-bold mb-2">Nincs még pakli</h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            Hozz létre flashcard paklikat a Kártyák fülön, majd térj vissza a kvízhez!
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="font-medium">Kvíz generálása...</p>
          </div>
        </div>
      )}
    </div>
  )
}
