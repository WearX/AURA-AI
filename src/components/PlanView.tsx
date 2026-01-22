'use client'

import { Calendar } from 'lucide-react'

// TODO: Implement study plan functionality in the store
export function PlanView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
        <Calendar className="text-white" size={40} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Tanulási terv</h2>
      <p className="text-slate-500 text-center max-w-sm">
        Az AI generált tanulási terv hamarosan elérhető lesz!
      </p>
    </div>
  )
}
