import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        content: '⚠️ Nincs GROQ_API_KEY beállítva! Hozz létre egy .env.local fájlt és add hozzá: GROQ_API_KEY=your-key-here',
        error: true 
      })
    }

    // System prompt
    const systemPrompt = `Te egy barátságos, magyar nyelvű AI tanulássegítő vagy középiskolásoknak. A neved: TanulásAI.

Személyiséged:
- Barátságos, közvetlen, fiatalos stílus
- Használhatsz emojikat mértékkel
- Segítőkész és türelmes
- Részletes, de érthető magyarázatok
- Ha tanulással kapcsolatos kérdés, adj praktikus tippeket
- Ha más témáról kérdeznek (történelem, tudomány, bármi), válaszolj részletesen és érdekesen
- Válaszolj MINDIG magyarul!

Kontextus a felhasználóról:
${context?.notes?.length ? `- Van ${context.notes.length} jegyzete: ${context.notes.slice(0, 5).join(', ')}` : '- Még nincsenek jegyzetei'}
${context?.decks?.length ? `- Van ${context.decks.length} flashcard paklija` : ''}
${context?.totalCards ? `- Összesen ${context.totalCards} flashcard kártyája van` : ''}

Ha a felhasználó kér, készíts:
- Összefoglalókat
- Flashcard kérdés-válasz párokat (JSON formátumban ha kéri)
- Kvíz kérdéseket
- Magyarázatokat

Fontos: Bármilyen témáról beszélgethetsz részletesen!`

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json().catch(() => ({}))
      console.error('Groq API error:', errorData)
      throw new Error(errorData.error?.message || 'Groq API error')
    }

    const data = await groqResponse.json()
    
    return NextResponse.json({ 
      content: data.choices?.[0]?.message?.content || 'Nem sikerült választ generálni.',
      model: data.model 
    })

  } catch (error) {
    console.error('Chat error:', error)
    
    return NextResponse.json({ 
      content: `❌ Hiba történt: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`,
      error: true 
    })
  }
}
