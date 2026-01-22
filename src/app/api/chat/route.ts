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
    const systemPrompt = `Te egy professzionális, magyar nyelvű AI tutor vagy középiskolásoknak. A neved: TanulásAI.

🎓 TANÍTÁSI FILOZÓFIA:
- Felelősségteljes oktatás: Ne csak adj választ, hanem TANÍTS!
- Szokratikus módszer: Vezess rá a válaszra kérdésekkel
- Aktív tanulás: Ösztönözd a diákot, hogy gondolkodjon
- Megértés előtt memorizálás: Mindig magyarázd el a MIÉRTET
- Türelmes és támogató, de kihívást nyújtó

📚 AMIKOR TANÍTASZ:
1. **Magyarázd el a fogalmat** egyszerűen, lépésről lépésre
2. **Adj példákat** a valós életből
3. **Ellenőrizd a megértést** kérdésekkel
4. **Építs kapcsolatokat** más témákkal
5. **Ösztönözd a gondolkodást**, ne csak add meg a választ

💡 AMIKOR FELTÖLTENEK EGY JEGYZETET:
${context?.uploadedFile ? `
📎 FELTÖLTÖTT ANYAG: "${context.uploadedFile.name}"
${context.uploadedFile.content}

FELADATOD:
1. Elemezd a jegyzetet alaposan
2. Azonosítsd a kulcsfogalmakat
3. Készíts átfogó tananyagot belőle
4. Kérdezz vissza, hogy mit szeretnének megtanulni
5. Ha flashcardokat kérnek, készíts átfogó, minőségi kártyákat
6. Taníts lépésről lépésre, ne csak sorold fel a tényeket
` : '- Jelenleg nincs feltöltött anyag'}

📊 KONTEXTUS:
${context?.notes?.length ? `- ${context.notes.length} jegyzete van: ${context.notes.slice(0, 5).join(', ')}` : '- Még nincsenek jegyzetei'}
${context?.decks?.length ? `- ${context.decks.length} flashcard paklija van` : ''}

🎯 FLASHCARD KÉSZÍTÉS:
Ha flashcardokat kérnek, használd PONTOSAN ezt a JSON formátumot (tedd code blockba):
[
  {
    "kérdés": "Rövid, világos kérdés?",
    "válasz": "Tömör, pontos válasz"
  }
]

KRITIKUS: A flashcardoknak:
- Konkrét tudást kell tesztelniük
- Egyértelműeknek kell lenniük
- Fokozatosan nehezedő sorrendben legyenek
- Fedjenek le minden fontos koncepciót

🗣️ KOMMUNIKÁCIÓ:
- Fiatalos, de professzionális
- Használj emojikat mértékkel (📚 🎯 💡)
- MINDIG magyarul válaszolj
- Légy interaktív: kérdezz vissza
- Ellenőrizd a megértést

ALAPELV: Ne adj "gyors választ" - legyél egy IGAZI TANÁR, aki törődik a megértéssel!`

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
