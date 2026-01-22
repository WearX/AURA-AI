import { Exam, StudyTask } from './types'

export function generateStudyPlan(exams: Exam[]): Omit<StudyTask, 'id' | 'user_id' | 'created_at'>[] {
  const tasks: Omit<StudyTask, 'id' | 'user_id' | 'created_at'>[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const exam of exams) {
    const examDate = new Date(exam.date)
    examDate.setHours(0, 0, 0, 0)
    
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExam <= 0) continue

    // Nehézség alapján session szám
    const sessionsNeeded = exam.difficulty === 'hard' ? 5 : exam.difficulty === 'medium' ? 3 : 2
    
    // Session hossz
    const sessionDuration = exam.difficulty === 'hard' ? 45 : exam.difficulty === 'medium' ? 30 : 25

    // Elosztás a napokra
    const interval = Math.max(1, Math.floor(daysUntilExam / sessionsNeeded))
    
    for (let i = 0; i < sessionsNeeded; i++) {
      const taskDate = new Date(today)
      taskDate.setDate(today.getDate() + (i * interval))
      
      // Ne legyen a vizsga napján vagy utána
      if (taskDate >= examDate) break

      const sessionNumber = i + 1
      let taskTitle = ''
      
      if (i === 0) {
        taskTitle = `${exam.title} - Anyag áttekintése`
      } else if (i === sessionsNeeded - 1) {
        taskTitle = `${exam.title} - Végső ismétlés`
      } else {
        taskTitle = `${exam.title} - ${sessionNumber}. tanulás`
      }

      tasks.push({
        exam_id: exam.id,
        title: taskTitle,
        date: taskDate.toISOString().split('T')[0],
        duration_minutes: sessionDuration,
        completed: false,
      })
    }
  }

  // Rendezés dátum szerint
  tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return tasks
}

export function getMotivationalTip(): string {
  const tips = [
    "🎯 Használd a Pomodoro technikát: 25 perc tanulás, 5 perc szünet!",
    "💪 Egy kis haladás is haladás. Kezdj el, és a motiváció jönni fog!",
    "🧠 Aktív felidézés: Csukd be a könyvet és próbáld elmondani, amit tanultál!",
    "📝 Készíts rövid jegyzeteket saját szavaiddal - ez segít a megértésben.",
    "🌙 A jó alvás kulcsfontosságú a tanultak rögzítéséhez!",
    "🏃 Rövid séta a tanulás előtt felfrissíti az elméd.",
    "🎵 Próbáld ki a lo-fi zenét tanulás közben - sokaknál segít a fókuszban.",
    "💧 Ne felejts el inni! A dehidratáció rontja a koncentrációt.",
    "📱 Tedd félre a telefont tanulás közben - a notifikációk megtörik a flow-t.",
    "✅ Ünnepeld meg a kis győzelmeket is - minden kész feladat számít!"
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}
