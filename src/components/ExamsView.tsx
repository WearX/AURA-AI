'use client'

import { useAppStore } from '@/lib/store'
import { Plus, Trash2, X, BookOpen } from 'lucide-react'
import { useState } from 'react'

export function ExamsView() {
  const { exams, subjects, addExam, deleteExam } = useAppStore()
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({
    subject_id: '',
    title: '',
    date: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject_id || !form.title || !form.date) return

    addExam(form)
    setForm({ subject_id: '', title: '', date: '', difficulty: 'medium', notes: '' })
    setIsAdding(false)
  }

  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', weekday: 'short' })
  }

  return (
    <div className="p-4 pb-28 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-bold">Vizsgák</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all active:scale-95"
        >
          <Plus size={18} />
          Új vizsga
        </button>
      </div>

      {/* Add exam modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full sm:w-[28rem] sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold">Új vizsga</h2>
              <button 
                onClick={() => setIsAdding(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">Tantárgy</label>
                <select
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 transition-colors"
                  required
                >
                  <option value="">Válassz tantárgyat...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">Vizsga neve</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="pl. Témazáró dolgozat"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">Dátum</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">Nehézség</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, difficulty: level })}
                      className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                        form.difficulty === level
                          ? level === 'easy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : level === 'medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                          : 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {level === 'easy' ? 'Könnyű' : level === 'medium' ? 'Közepes' : 'Nehéz'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-400">Megjegyzés (opcionális)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Milyen anyagból lesz?"
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                Vizsga hozzáadása
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Exam list */}
      {sortedExams.length > 0 ? (
        <div className="space-y-3">
          {sortedExams.map(exam => {
            const daysUntil = Math.ceil(
              (new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            const isPast = daysUntil < 0

            return (
              <div
                key={exam.id}
                className={`glass-card p-4 transition-all ${isPast ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: exam.subject?.color || '#6366f1' }}
                  >
                    {isPast ? '✓' : daysUntil}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{exam.title}</h3>
                        <p className="text-sm text-slate-500">{exam.subject?.name} • {formatDate(exam.date)}</p>
                      </div>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        exam.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : exam.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {exam.difficulty === 'easy' ? 'Könnyű' : exam.difficulty === 'medium' ? 'Közepes' : 'Nehéz'}
                      </span>
                    </div>
                    {exam.notes && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{exam.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <BookOpen className="text-violet-500" size={36} />
          </div>
          <h3 className="text-xl font-bold mb-2">Még nincsenek vizsgáid</h3>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">
            Adj hozzá egy vizsgát, és automatikusan generálunk tanulási tervet!
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25"
          >
            <Plus size={20} />
            Első vizsga hozzáadása
          </button>
        </div>
      )}
    </div>
  )
}
