'use client'

import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase'
import { FileText, Layers, Brain, Sparkles, TrendingUp, Clock, LogOut } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export function HomeView({ user }: { user: User | null }) {
  const { userName, notes, decks, setActiveTab } = useAppStore()
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const stats = useMemo(() => {
    const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0)
    const totalCorrect = decks.reduce((acc, d) => 
      acc + d.cards.reduce((a, c) => a + c.times_correct, 0), 0)
    const totalAttempts = decks.reduce((acc, d) => 
      acc + d.cards.reduce((a, c) => a + c.times_correct + c.times_wrong, 0), 0)
    
    return {
      notes: notes.length,
      decks: decks.length,
      cards: totalCards,
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
    }
  }, [notes, decks])

  const recentNotes = useMemo(() => 
    [...notes].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ).slice(0, 3)
  , [notes])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Jó reggelt'
    if (hour < 18) return 'Szép napot'
    return 'Jó estét'
  }, [])

  const displayName = userName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Felhasználó'

  return (
    <div className="p-4 pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6 pt-2 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{greeting}</p>
          <h1 className="text-2xl font-bold mt-1">{displayName}! 👋</h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Kijelentkezés"
        >
          <LogOut size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-violet-500" />
            <span className="text-xs font-medium text-slate-500">Jegyzetek</span>
          </div>
          <p className="text-2xl font-bold">{stats.notes}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={16} className="text-purple-500" />
            <span className="text-xs font-medium text-slate-500">Kártyák</span>
          </div>
          <p className="text-2xl font-bold">{stats.cards}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-fuchsia-500" />
            <span className="text-xs font-medium text-slate-500">Paklik</span>
          </div>
          <p className="text-2xl font-bold">{stats.decks}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs font-medium text-slate-500">Pontosság</span>
          </div>
          <p className="text-2xl font-bold">{stats.accuracy}%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Gyors műveletek</h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('notes')}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:border-violet-300 dark:hover:border-violet-700 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <span className="text-xs font-medium">Új jegyzet</span>
          </button>
          <button
            onClick={() => setActiveTab('decks')}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:border-violet-300 dark:hover:border-violet-700 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
              <Layers className="text-white" size={20} />
            </div>
            <span className="text-xs font-medium">Új pakli</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:border-violet-300 dark:hover:border-violet-700 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xs font-medium">AI segítség</span>
          </button>
        </div>
      </div>

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Legutóbbi jegyzetek</h2>
            <button 
              onClick={() => setActiveTab('notes')}
              className="text-xs font-medium text-violet-600 dark:text-violet-400"
            >
              Összes →
            </button>
          </div>
          <div className="space-y-2">
            {recentNotes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveTab('notes')}
                className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-violet-300 dark:hover:border-violet-700 transition-all"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: note.subject?.color + '20', color: note.subject?.color }}
                >
                  {note.subject?.icon || '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(note.updated_at).toLocaleDateString('hu-HU')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {notes.length === 0 && decks.length === 0 && (
        <div className="glass-card p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <Sparkles className="text-violet-500" size={28} />
          </div>
          <h3 className="font-semibold mb-2">Kezdj el tanulni!</h3>
          <p className="text-sm text-slate-500 mb-4">
            Hozz létre jegyzeteket, készíts flashcardokat, vagy kérdezd az AI-t
          </p>
        </div>
      )}
    </div>
  )
}
