'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'
import { HomeView } from '@/components/HomeView'
import { NotesView } from '@/components/NotesView'
import { DecksView } from '@/components/DecksView'
import { QuizView } from '@/components/QuizView'
import { ChatView } from '@/components/ChatView'
import { User } from '@supabase/supabase-js'

export default function Home() {
  const { activeTab, setUserName } = useAppStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, setUserName])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Betöltés...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {activeTab === 'home' && <HomeView user={user} />}
      {activeTab === 'notes' && <NotesView />}
      {activeTab === 'decks' && <DecksView />}
      {activeTab === 'quiz' && <QuizView />}
      {activeTab === 'chat' && <ChatView />}
      <BottomNav />
    </main>
  )
}
