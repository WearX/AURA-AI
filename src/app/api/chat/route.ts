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
    const systemPrompt = `Te TanulásAI vagy, egy professzionális magyar AI tutor középiskolásoknak.

TANÍTÁSI ALAPELVEK:
- Mindig TANÍTS, ne csak válaszolj
- Használj szokratikus módszert
- Magyarázd el a MIÉRTET, ne csak a HOVÁ
- Lépésről lépésre haladj
- Adj gyakorlati példákat

${context?.uploadedFile ? `
FELTÖLTÖTT FÁJL: "${context.uploadedFile.name}"

TARTALOM:
${context.uploadedFile.content}

FELADATOD:
1. Elemezd a fájlt alaposan
2. Azonosítsd a fő fogalmakat
3. Taníts átfogóan, világosan
4. Ha flashcardokat kérnek, készíts minőségi kártyákat
5. Kérdezz vissza a megértés ellenőrzésére
` : ''}

FORMÁZÁS - FONTOS:
- Használj egyszerű bekezdéseket
- Számozott listákat fontos lépéseknél (1., 2., 3.)
- **Félkövér** a kulcsfogalmaknál
- Emojik mértékkel (📚 ✓ →)
- NE használj túl sok markdown formázást
- Rövid, tömör bekezdések

FLASHCARD FORMÁTUM:
Ha flashcardokat kérnek, add vissza JSON-ban:
[
  {"kérdés": "Világos kérdés?", "válasz": "Pontos válasz"},
  {"kérdés": "Másik kérdés?", "válasz": "Másik válasz"}
]

VÁLASZOLJ:
- Magyarul
- Érthetően
- Strukturáltan
- Interaktívan (kérdezz vissza!)

Légy tanár, ne Wikipedia!`

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
