'use client'

import { useAppStore } from '@/lib/store'
import { Plus, Search, Trash2, X, ChevronLeft, Edit3, Sparkles, FileText } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Note } from '@/lib/types'

export function NotesView() {
  const { notes, subjects, addNote, updateNote, deleteNote, addDeck, addCardToDeck } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [isGeneratingCards, setIsGeneratingCards] = useState(false)
  
  const [form, setForm] = useState({
    subject_id: '',
    title: '',
    content: ''
  })

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSubject = !selectedSubject || note.subject_id === selectedSubject
      return matchesSearch && matchesSubject
    })
  }, [notes, searchQuery, selectedSubject])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject_id || !form.title || !form.content) return

    if (editingNote) {
      updateNote(editingNote.id, form)
      setEditingNote(null)
    } else {
      addNote(form)
    }
    setForm({ subject_id: '', title: '', content: '' })
    setIsCreating(false)
  }

  const startEditing = (note: Note) => {
    setForm({
      subject_id: note.subject_id,
      title: note.title,
      content: note.content
    })
    setEditingNote(note)
    setViewingNote(null)
    setIsCreating(true)
  }

  const generateFlashcards = async (note: Note) => {
    setIsGeneratingCards(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `A következő jegyzetből készíts 5-10 flashcard kérdés-válasz párt. A jegyzet címe: "${note.title}"\n\nJegyzet tartalma:\n${note.content}\n\nVálaszolj CSAK a következő JSON formátumban, semmi mást ne írj:\n[{"question": "kérdés", "answer": "válasz"}, ...]`
          }],
          context: {}
        }),
      })
      
      const data = await response.json()
      
      // Parse the response
      const jsonMatch = data.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const cards = JSON.parse(jsonMatch[0])
        
        // Create deck
        const deckId = addDeck({
          title: `${note.title} - Flashcardok`,
          subject_id: note.subject_id,
          note_id: note.id,
          cards: [],
          subject: note.subject
        })
        
        // Add cards
        cards.forEach((card: { question: string; answer: string }) => {
          addCardToDeck(deckId, {
            question: card.question,
            answer: card.answer,
            difficulty: 'medium',
            note_id: note.id
          })
        })
        
        alert(`${cards.length} flashcard létrehozva!`)
      }
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('Hiba történt a flashcardok generálásakor')
    } finally {
      setIsGeneratingCards(false)
    }
  }

  // Note viewer
  if (viewingNote) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="sticky top-0 z-10 glass-card mx-3 mt-3 p-3 flex items-center justify-between">
          <button
            onClick={() => setViewingNote(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => generateFlashcards(viewingNote)}
              disabled={isGeneratingCards}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors disabled:opacity-50"
            >
              <Sparkles size={16} />
              {isGeneratingCards ? 'Generálás...' : 'Flashcard'}
            </button>
            <button
              onClick={() => startEditing(viewingNote)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Edit3 size={20} />
            </button>
            <button
              onClick={() => {
                if (confirm('Biztosan törlöd ezt a jegyzetet?')) {
                  deleteNote(viewingNote.id)
                  setViewingNote(null)
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4 pb-28">
          <div className="flex items-center gap-2 mb-4">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: viewingNote.subject?.color + '20', color: viewingNote.subject?.color }}
            >
              {viewingNote.subject?.icon} {viewingNote.subject?.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-4">{viewingNote.title}</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
              {viewingNote.content}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Create/Edit form
  if (isCreating) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="sticky top-0 z-10 glass-card mx-3 mt-3 p-3 flex items-center justify-between">
          <button
            onClick={() => {
              setIsCreating(false)
              setEditingNote(null)
              setForm({ subject_id: '', title: '', content: '' })
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="font-semibold">{editingNote ? 'Jegyzet szerkesztése' : 'Új jegyzet'}</h2>
          <button
            onClick={handleSubmit}
            disabled={!form.subject_id || !form.title || !form.content}
            className="px-4 py-2 bg-violet-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
          >
            Mentés
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Tantárgy</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm({ ...form, subject_id: s.id })}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.subject_id === s.id
                      ? 'ring-2 ring-offset-2 ring-violet-500'
                      : ''
                  }`}
                  style={{ 
                    backgroundColor: form.subject_id === s.id ? s.color : s.color + '20',
                    color: form.subject_id === s.id ? 'white' : s.color
                  }}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Cím</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Add meg a jegyzet címét..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Tartalom</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Írd ide a jegyzeted..."
              rows={15}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
        </form>
      </div>
    )
  }

  // Notes list
  return (
    <div className="p-4 pb-28 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4 pt-2">
        <h1 className="text-2xl font-bold">Jegyzetek</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Új
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Keresés..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      {/* Subject filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSelectedSubject(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !selectedSubject 
              ? 'bg-violet-600 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Mind
        </button>
        {subjects.filter(s => notes.some(n => n.subject_id === s.id)).map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSubject === s.id
                ? ''
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{ 
              backgroundColor: selectedSubject === s.id ? s.color : s.color + '20',
              color: selectedSubject === s.id ? 'white' : s.color
            }}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {filteredNotes.length > 0 ? (
        <div className="space-y-3">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setViewingNote(note)}
              className="w-full glass-card p-4 text-left hover:border-violet-300 dark:hover:border-violet-700 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: note.subject?.color + '20' }}
                >
                  {note.subject?.icon || '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{note.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{note.content}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(note.updated_at).toLocaleDateString('hu-HU', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <FileText className="text-violet-500" size={36} />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {searchQuery ? 'Nincs találat' : 'Még nincsenek jegyzeteid'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">
            {searchQuery 
              ? 'Próbálj más keresési kifejezést'
              : 'Készíts jegyzeteket és tanulj belőlük flashcardokkal!'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25"
            >
              <Plus size={20} />
              Első jegyzet
            </button>
          )}
        </div>
      )}
    </div>
  )
}
