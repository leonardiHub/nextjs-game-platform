import { NextRequest, NextResponse } from 'next/server'
import { aesDecrypt } from '@/utils/crypto'

/**
 * Game URL v1 (SEAMLESS) - According to HUIDU API Documentation
 * POST /api/game/v1
 *
 * Request format:
 * {
 *   "agency_uid": "8dee1e401b87408cca3ca813c2250cb4",
 *   "timestamp": "1631459081871",
 *   "payload": "AES_ENCRYPTED_DATA"
 * }
 *
 * Encrypted payload contains:
 * {
 *   "agency_uid": "string",
 *   "member_account": "player001",
 *   "game_uid": "1",
 *   "timestamp": "1631459081871",
 *   "credit_amount": "50",
 *   "currency_code": "USD",
 *   "language": "en",
 *   "home_url": "https://...",
 *   "platform": 1,
 *   "callback_url": "https://..."
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🎮 Game v1 (Seamless) request:', {
      agency_uid: body.agency_uid,
      timestamp: body.timestamp,
      hasPayload: !!body.payload,
    })

    // Validate HUIDU format
    if (!body.agency_uid || !body.timestamp || !body.payload) {
      console.error('❌ Missing required HUIDU parameters')
      return NextResponse.json(
        {
          code: 1,
          msg: 'Missing required parameters (agency_uid, timestamp, payload)',
        },
        { status: 400 }
      )
    }

    // Verify agency_uid matches expected value from documentation
    if (body.agency_uid !== '8dee1e401b87408cca3ca813c2250cb4') {
      console.error('❌ Invalid agency_uid')
      return NextResponse.json(
        {
          code: 1,
          msg: 'Invalid agency_uid',
        },
        { status: 401 }
      )
    }

    try {
      // Decrypt the payload to get game launch parameters
      const decryptedPayload = aesDecrypt(body.payload)
      const gameParams = JSON.parse(decryptedPayload)

      console.log('🔓 Decrypted game parameters:', gameParams)

      // Forward to backend game launch endpoint with decrypted parameters
      const response = await fetch('https://99group.games/api/game/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_uid: gameParams.game_uid,
          member_account: gameParams.member_account,
          credit_amount: gameParams.credit_amount,
          currency_code: gameParams.currency_code || 'USD',
          language: gameParams.language || 'en',
          home_url: gameParams.home_url,
          platform: gameParams.platform || 1,
          callback_url: gameParams.callback_url,
        }),
      })

      const backendData = await response.json()

      if (!response.ok) {
        console.error('❌ Backend game launch error:', backendData)
        return NextResponse.json(
          {
            code: 1,
            msg: backendData.error || 'Game launch failed',
          },
          { status: response.status }
        )
      }

      console.log('✅ Backend game launch response:', backendData)

      // Return HUIDU compliant response format
      // According to documentation, payload should contain game_launch_url
      const responsePayload = {
        game_launch_url:
          backendData.game_url ||
          backendData.game_launch_url ||
          'https://game.example.com',
      }

      return NextResponse.json({
        code: 0,
        msg: 'Success',
        payload: responsePayload,
      })
    } catch (decryptError) {
      console.error('❌ Payload decryption error:', decryptError)
      return NextResponse.json(
        {
          code: 1,
          msg: 'Invalid encrypted payload',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Game v1 API error:', error)
    return NextResponse.json(
      {
        code: 1,
        msg: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
