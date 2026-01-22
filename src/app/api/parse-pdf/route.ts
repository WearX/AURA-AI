import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nincs fájl feltöltve' }, { status: 400 })
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    const data = await pdf(buffer)

    return NextResponse.json({
      text: data.text,
      pages: data.numpages,
      info: data.info
    })
  } catch (error) {
    console.error('PDF parse error:', error)
    return NextResponse.json(
      { error: 'Hiba történt a PDF feldolgozása során' },
      { status: 500 }
    )
  }
}
