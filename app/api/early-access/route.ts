import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data

    const botToken = process.env.DISCORD_BOT_TOKEN
    const channelId = process.env.DISCORD_NOTIFICATION_CHANNEL_ID

    if (!botToken || !channelId) {
      console.error('Missing DISCORD_BOT_TOKEN or DISCORD_NOTIFICATION_CHANNEL_ID')
      return NextResponse.json(
        { error: 'Server configuration error. Please try again later.' },
        { status: 500 }
      )
    }

    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [
            {
              title: 'New Beta Signup',
              color: 0x3b82f6,
              fields: [
                { name: 'Email', value: email },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      }
    )

    if (!discordRes.ok) {
      const err = await discordRes.text()
      console.error('Discord API error:', err)
      return NextResponse.json(
        { error: 'Failed to process signup. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Early access signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
