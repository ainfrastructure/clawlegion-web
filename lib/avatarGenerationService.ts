import { GoogleGenAI } from '@google/genai'

const COLOR_PROMPT_MAP: Record<string, string> = {
  blue: 'cool blue and electric cyan tones',
  purple: 'deep violet and ultraviolet hues',
  green: 'emerald green and neon lime accents',
  amber: 'warm amber and golden orange tones',
  cyan: 'aqua cyan and teal highlights',
  pink: 'hot pink and magenta neon glow',
  red: 'crimson red and scarlet energy',
}

export async function generateAvatarImage({
  name,
  role,
  description,
  color,
}: {
  name: string
  role: string
  description?: string
  color?: string
}): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const ai = new GoogleGenAI({ apiKey })

  const colorHint = COLOR_PROMPT_MAP[color || 'blue'] || COLOR_PROMPT_MAP.blue
  const descHint = description ? `, inspired by: ${description}` : ''

  const prompt = [
    `Sci-fi character portrait of an AI agent named "${name}" with the role of "${role}"${descHint}.`,
    `Color palette: ${colorHint}.`,
    'Style: futuristic digital art, glowing circuitry patterns, sleek helmet or visor,',
    'dramatic lighting against a dark background, high detail, square composition.',
    'No text or watermarks.',
  ].join(' ')

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      includeRaiReason: true,
    },
  })

  const generated = response.generatedImages?.[0]
  if (!generated) {
    const reason = response.generatedImages?.[0]?.raiFilteredReason
    throw new Error(reason || 'No image was generated — the prompt may have been filtered by safety checks')
  }

  const imageBytes = generated.image?.imageBytes
  if (!imageBytes) {
    throw new Error('Image generation succeeded but no image bytes were returned')
  }

  return Buffer.from(imageBytes, 'base64')
}
