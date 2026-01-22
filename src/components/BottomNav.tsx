'use client'

import { useAppStore } from '@/lib/store'
import { Home, FileText, Layers, Brain, MessageCircle } from 'lucide-react'

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore()

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Főoldal' },
    { id: 'notes' as const, icon: FileText, label: 'Jegyzetek' },
    { id: 'decks' as const, icon: Layers, label: 'Kártyák' },
    { id: 'quiz' as const, icon: Brain, label: 'Kvíz' },
    { id: 'chat' as const, icon: MessageCircle, label: 'AI' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 safe-area-bottom z-50">
      <div className="mx-3 mb-3">
        <div className="glass-card flex justify-around items-center h-16 px-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all ${
                activeTab === id
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {activeTab === id && (
                <div className="absolute inset-1 bg-violet-100 dark:bg-violet-900/30 rounded-xl -z-10" />
              )}
              <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
