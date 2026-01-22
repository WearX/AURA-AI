'use client'

import { useAppStore } from '@/lib/store'
import { CheckCircle2, Circle, RefreshCw, Calendar } from 'lucide-react'
import { useMemo } from 'react'

export function PlanView() {
  const { tasks, toggleTask, generateTasks, exams } = useAppStore()

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups: { [date: string]: typeof tasks } = {}
    
    for (const task of tasks) {
      if (!groups[task.date]) {
        groups[task.date] = []
      }
      groups[task.date].push(task)
    }
    
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
  }, [tasks])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dateOnly = new Date(dateStr)
    dateOnly.setHours(0, 0, 0, 0)

    if (dateOnly.getTime() === today.getTime()) {
      return 'Ma'
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      return 'Holnap'
    } else {
      return date.toLocaleDateString('hu-HU', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  const isPast = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(dateStr) < today
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="p-4 pb-28 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold">Tanulási terv</h1>
          {totalCount > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              {completedCount}/{totalCount} feladat kész ({progressPercent}%)
            </p>
          )}
        </div>
        {exams.length > 0 && (
          <button
            onClick={generateTasks}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
          >
            <RefreshCw size={16} />
            Újragenerál
          </button>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Összes haladás</span>
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-full h-3 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Task list grouped by day */}
      {groupedTasks.length > 0 ? (
        <div className="space-y-6">
          {groupedTasks.map(([date, dayTasks]) => (
            <div key={date}>
              <div className={`flex items-center gap-2 mb-3 ${
                isToday(date) 
                  ? 'text-violet-600 dark:text-violet-400' 
                  : isPast(date)
                  ? 'text-slate-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}>
                {isToday(date) && (
                  <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                )}
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  {formatDate(date)}
                </h2>
              </div>
              <div className="space-y-2">
                {dayTasks.map(task => {
                  const exam = exams.find(e => e.id === task.exam_id)
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`w-full glass-card flex items-center gap-4 p-4 text-left transition-all active:scale-[0.98] ${
                        task.completed ? 'opacity-60' : ''
                      } ${isPast(date) && !task.completed ? 'border-red-200 dark:border-red-800' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500'
                          : isPast(date)
                          ? 'border-red-400'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {task.completed && <CheckCircle2 className="text-white" size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          task.completed ? 'line-through text-slate-400' : ''
                        }`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {exam && (
                            <span 
                              className="inline-flex items-center gap-1.5 text-xs font-medium"
                              style={{ color: exam.subject?.color }}
                            >
                              <span 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: exam.subject?.color }}
                              />
                              {exam.subject?.name}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {task.duration_minutes} perc
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <Calendar className="text-violet-500" size={36} />
          </div>
          <h3 className="text-xl font-bold mb-2">Nincs még terved</h3>
          <p className="text-slate-500 max-w-xs mx-auto">
            Adj hozzá vizsgákat, és automatikusan generálunk tanulási ütemtervet!
          </p>
        </div>
      )}
    </div>
  )
}
