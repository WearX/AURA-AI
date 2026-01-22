'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Note, FlashcardDeck, Flashcard, Subject, ChatMessage, Quiz, QuizQuestion } from './types'

interface AppState {
  // User
  userName: string
  setUserName: (name: string) => void

  // Subjects
  subjects: Subject[]
  
  // Notes
  notes: Note[]
  addNote: (note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => string
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  
  // Flashcard Decks
  decks: FlashcardDeck[]
  addDeck: (deck: Omit<FlashcardDeck, 'id' | 'user_id' | 'created_at'>) => string
  updateDeck: (id: string, updates: Partial<FlashcardDeck>) => void
  deleteDeck: (id: string) => void
  addCardToDeck: (deckId: string, card: Omit<Flashcard, 'id' | 'times_correct' | 'times_wrong'>) => void
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void
  deleteCard: (deckId: string, cardId: string) => void
  recordCardResult: (deckId: string, cardId: string, correct: boolean) => void

  // Quizzes
  quizzes: Quiz[]
  addQuiz: (quiz: Omit<Quiz, 'id' | 'created_at'>) => void
  deleteQuiz: (id: string) => void
  
  // Chat
  messages: ChatMessage[]
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void

  // Active tab
  activeTab: 'home' | 'notes' | 'decks' | 'quiz' | 'chat'
  setActiveTab: (tab: 'home' | 'notes' | 'decks' | 'quiz' | 'chat') => void
}

const defaultSubjects: Subject[] = [
  { id: '1', name: 'Matematika', color: '#ef4444', icon: '📐' },
  { id: '2', name: 'Magyar', color: '#f59e0b', icon: '📖' },
  { id: '3', name: 'Történelem', color: '#10b981', icon: '🏛️' },
  { id: '4', name: 'Angol', color: '#3b82f6', icon: '🇬🇧' },
  { id: '5', name: 'Fizika', color: '#8b5cf6', icon: '⚡' },
  { id: '6', name: 'Kémia', color: '#ec4899', icon: '🧪' },
  { id: '7', name: 'Biológia', color: '#14b8a6', icon: '🧬' },
  { id: '8', name: 'Informatika', color: '#6366f1', icon: '💻' },
  { id: '9', name: 'Földrajz', color: '#84cc16', icon: '🌍' },
  { id: '10', name: 'Egyéb', color: '#64748b', icon: '📚' },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: '',
      setUserName: (name) => set({ userName: name }),

      subjects: defaultSubjects,

      // Notes
      notes: [],
      addNote: (note) => {
        const id = crypto.randomUUID()
        const newNote: Note = {
          ...note,
          id,
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subject: get().subjects.find(s => s.id === note.subject_id)
        }
        set((state) => ({ notes: [newNote, ...state.notes] }))
        return id
      },
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n => 
          n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
        )
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id),
        decks: state.decks.filter(d => d.note_id !== id)
      })),

      // Decks
      decks: [],
      addDeck: (deck) => {
        const id = crypto.randomUUID()
        const newDeck: FlashcardDeck = {
          ...deck,
          id,
          user_id: '',
          created_at: new Date().toISOString(),
          subject: get().subjects.find(s => s.id === deck.subject_id)
        }
        set((state) => ({ decks: [newDeck, ...state.decks] }))
        return id
      },
      updateDeck: (id, updates) => set((state) => ({
        decks: state.decks.map(d => d.id === id ? { ...d, ...updates } : d)
      })),
      deleteDeck: (id) => set((state) => ({
        decks: state.decks.filter(d => d.id !== id)
      })),
      addCardToDeck: (deckId, card) => set((state) => ({
        decks: state.decks.map(d => d.id === deckId ? {
          ...d,
          cards: [...d.cards, { ...card, id: crypto.randomUUID(), times_correct: 0, times_wrong: 0 }]
        } : d)
      })),
      updateCard: (deckId, cardId, updates) => set((state) => ({
        decks: state.decks.map(d => d.id === deckId ? {
          ...d,
          cards: d.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
        } : d)
      })),
      deleteCard: (deckId, cardId) => set((state) => ({
        decks: state.decks.map(d => d.id === deckId ? {
          ...d,
          cards: d.cards.filter(c => c.id !== cardId)
        } : d)
      })),
      recordCardResult: (deckId, cardId, correct) => set((state) => ({
        decks: state.decks.map(d => d.id === deckId ? {
          ...d,
          cards: d.cards.map(c => c.id === cardId ? {
            ...c,
            times_correct: c.times_correct + (correct ? 1 : 0),
            times_wrong: c.times_wrong + (correct ? 0 : 1),
            last_reviewed: new Date().toISOString()
          } : c)
        } : d)
      })),

      // Quizzes
      quizzes: [],
      addQuiz: (quiz) => set((state) => ({
        quizzes: [{
          ...quiz,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        }, ...state.quizzes]
      })),
      deleteQuiz: (id) => set((state) => ({
        quizzes: state.quizzes.filter(q => q.id !== id)
      })),

      // Chat
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date()
        }]
      })),
      clearMessages: () => set({ messages: [] }),

      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'tanulasai-knowunity-storage',
    }
  )
)
