import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { generateAvatarImage } from '@/lib/avatarGenerationService'

const requestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  description: z.string().optional(),
  color: z.string().optional(),
})

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Avatar generation is not configured — GEMINI_API_KEY is missing' },
      { status: 503 }
    )
  }

  let body: z.infer<typeof requestSchema>
  try {
    const raw = await request.json()
    body = requestSchema.parse(raw)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const imageBuffer = await generateAvatarImage({
      name: body.name,
      role: body.role,
      description: body.description,
      color: body.color,
    })

    // Save to public/agents/generated/
    const dir = path.join(process.cwd(), 'public', 'agents', 'generated')
    await mkdir(dir, { recursive: true })

    const sanitizedName = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const filename = `${sanitizedName}-${Date.now()}.png`
    const filePath = path.join(dir, filename)

    await writeFile(filePath, imageBuffer)

    const avatarUrl = `/agents/generated/${filename}`
    return NextResponse.json({ success: true, avatarUrl })
  } catch (err: any) {
    const message = err.message || 'Failed to generate avatar'

    if (message.includes('filtered') || message.includes('safety')) {
      return NextResponse.json(
        { error: 'The image was blocked by safety filters. Try adjusting the description.' },
        { status: 422 }
      )
    }

    console.error('Avatar generation error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
