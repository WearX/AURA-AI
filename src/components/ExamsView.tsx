'use client'

import { BookOpen } from 'lucide-react'

// TODO: Implement exams functionality in the store
export function ExamsView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
        <BookOpen className="text-white" size={40} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Vizsgák</h2>
      <p className="text-slate-500 text-center max-w-sm">
        A vizsga funkció hamarosan elérhető lesz!
      </p>
    </div>
  )
}
