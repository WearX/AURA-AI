export interface User {
  id: string
  name: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
  color: string
  icon: string
}

export interface Note {
  id: string
  user_id: string
  subject_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  subject?: Subject
}

export interface Flashcard {
  id: string
  note_id?: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  last_reviewed?: string
  times_correct: number
  times_wrong: number
}

export interface FlashcardDeck {
  id: string
  user_id: string
  note_id?: string
  title: string
  subject_id: string
  cards: Flashcard[]
  created_at: string
  subject?: Subject
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
}

export interface Quiz {
  id: string
  note_id?: string
  deck_id?: string
  title: string
  questions: QuizQuestion[]
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
