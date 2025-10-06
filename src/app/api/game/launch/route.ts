import { NextRequest, NextResponse } from 'next/server'
import { createEncryptedPayload, parseEncryptedResponse } from '@/utils/crypto'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()

    // Check if the request needs encryption (for game API calls)
    let requestBody = body
    if (body.game_uid && body.encrypt === true) {
      // Create encrypted payload for game launch
      requestBody = createEncryptedPayload({
        game_uid: body.game_uid,
        player_account: body.player_account || '',
        timestamp: Date.now(),
      })
    }

    const response = await fetch('http://localhost:5002/api/game/launch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Check if response contains encrypted payload
    if (data.payload && body.encrypt === true) {
      try {
        const decryptedData = parseEncryptedResponse(data)
        return NextResponse.json({
          ...data,
          decrypted: decryptedData,
        })
      } catch (decryptError) {
        console.error('Failed to decrypt response:', decryptError)
        return NextResponse.json(data)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Game launch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
