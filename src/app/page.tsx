'use client'

import { useAppStore } from '@/lib/store'
import { BottomNav } from '@/components/BottomNav'
import { HomeView } from '@/components/HomeView'
import { NotesView } from '@/components/NotesView'
import { DecksView } from '@/components/DecksView'
import { QuizView } from '@/components/QuizView'
import { ChatView } from '@/components/ChatView'

export default function Home() {
  const { activeTab } = useAppStore()

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'notes' && <NotesView />}
      {activeTab === 'decks' && <DecksView />}
      {activeTab === 'quiz' && <QuizView />}
      {activeTab === 'chat' && <ChatView />}
      <BottomNav />
    </main>
  )
}
