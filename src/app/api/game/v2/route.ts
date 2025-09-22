import { NextRequest, NextResponse } from 'next/server'
import { aesEncrypt, aesDecrypt, parseEncryptedResponse } from '@/utils/crypto'

/**
 * Game URL v2 (TRANSFER) - According to HUIDU API Documentation
 * POST /api/game/v2
 *
 * This API supports deposit and withdrawal transactions, and query transfer information.
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
 *   "credit_amount": "50", // >0 deposit, <0 withdrawal, =0 query
 *   "currency_code": "USD",
 *   "language": "en",
 *   "home_url": "https://...",
 *   "platform": 1,
 *   "transfer_id": "1189022"
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🎮 Game v2 (Transfer) request:', {
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
      // Decrypt the payload to get transfer parameters
      const decryptedPayload = aesDecrypt(body.payload)
      const transferParams = JSON.parse(decryptedPayload)

      console.log('🔓 Decrypted transfer parameters:', transferParams)

      const creditAmount = parseFloat(transferParams.credit_amount || '0')
      let transferType = 'query'
      if (creditAmount > 0) transferType = 'deposit'
      else if (creditAmount < 0) transferType = 'withdrawal'

      console.log('💰 Transfer type:', transferType, 'Amount:', creditAmount)

      // For now, simulate transfer response since we don't have a backend transfer endpoint
      // In production, you would call your backend transfer API here
      const mockTransferResponse = {
        game_launch_url: `https://jsgame.live/game?player=${transferParams.member_account}&game=${transferParams.game_uid}`,
        player_name: transferParams.member_account,
        currency: transferParams.currency_code || 'USD',
        transfer_amount: transferParams.credit_amount,
        before_amount: '100.00', // Mock current balance
        after_amount: (100 + creditAmount).toFixed(2), // Mock new balance
        transfer_id: transferParams.transfer_id,
        transaction_id: `TXN_${Date.now()}`, // Generate unique transaction ID
        transfer_status: creditAmount === 0 ? 0 : 1, // 0=query, 1=success, 2=failed
        timestamp: Date.now(),
      }

      console.log('✅ Transfer response:', mockTransferResponse)

      return NextResponse.json({
        code: 0,
        msg: 'Success',
        payload: mockTransferResponse,
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
    console.error('❌ Game v2 API error:', error)
    return NextResponse.json(
      {
        code: 1,
        msg: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
