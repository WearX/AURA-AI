import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const apiKey = process.env.REPLICATE_API_TOKEN
    if (!apiKey) {
      return NextResponse.json({
        error: '⚠️ Nincs REPLICATE_API_TOKEN beállítva! Add hozzá az .env.local fájlhoz.',
      }, { status: 500 })
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({
        error: 'Nincs prompt megadva!',
      }, { status: 400 })
    }

    const replicate = new Replicate({
      auth: apiKey,
    })

    // Using Stable Diffusion XL - fast and high quality
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          negative_prompt: "ugly, blurry, poor quality, distorted, deformed",
          num_outputs: 1,
          width: 1024,
          height: 1024,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        }
      }
    ) as string[]

    if (!output || output.length === 0) {
      throw new Error('Nem sikerült képet generálni')
    }

    return NextResponse.json({
      imageUrl: output[0],
      prompt: prompt
    })

  } catch (error: any) {
    console.error('Image generation error:', error)

    return NextResponse.json({
      error: `Hiba történt a kép generálása során: ${error.message}`,
    }, { status: 500 })
  }
}
