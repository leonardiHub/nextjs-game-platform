import { NextRequest, NextResponse } from 'next/server'
import { aesEncrypt, aesDecrypt, API_CONFIG } from '@/utils/crypto'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()

    console.log('🎮 Game callback GET request with params:', queryParams)

    // Forward GET request to backend
    const backendUrl = `http://localhost:3006/api/game/callback${queryParams ? `?${queryParams}` : ''}`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Backend callback GET error:', data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log('✅ Backend callback GET response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Game callback GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🎮 Game callback request:', body)

    // Check if request follows HUIDU specification format
    const isHuiduFormat = body.agency_uid && body.payload && body.timestamp

    if (isHuiduFormat) {
      console.log('📋 HUIDU format detected - validating request')

      // Validate required HUIDU parameters
      if (!body.agency_uid || !body.payload || !body.timestamp) {
        console.error('❌ Missing required HUIDU parameters')
        const errorPayload = aesEncrypt(
          JSON.stringify({
            credit_amount: '0.00',
            timestamp: Date.now().toString(),
          })
        )

        return NextResponse.json(
          {
            code: 1,
            msg: 'Missing required parameters',
            payload: errorPayload,
          },
          { status: 400 }
        )
      }

      // Verify agency_uid matches either HUIDU official or legacy configuration
      const validAgencyIds = [
        API_CONFIG.HUIDU.agency_uid,
        API_CONFIG.LEGACY.agency_uid,
      ]
      if (!validAgencyIds.includes(body.agency_uid)) {
        console.error('❌ Invalid agency_uid:', body.agency_uid)
        const errorPayload = aesEncrypt(
          JSON.stringify({
            credit_amount: '0.00',
            timestamp: Date.now().toString(),
          })
        )

        return NextResponse.json(
          {
            code: 1,
            msg: 'Invalid agency_uid',
            payload: errorPayload,
          },
          { status: 401 }
        )
      }

      console.log('✅ HUIDU request validation passed')
    }

    // Handle encryption if needed
    let requestBody = body

    // Handle different request formats and convert to backend-compatible format
    if (isHuiduFormat) {
      console.log(
        '🔧 HUIDU format detected - converting keys for backend compatibility'
      )

      // Decrypt with HUIDU key
      let decryptedData
      try {
        decryptedData = JSON.parse(
          aesDecrypt(body.payload, API_CONFIG.HUIDU.aes_key)
        )
        console.log('✅ Successfully decrypted HUIDU payload')
      } catch (huiduDecryptError) {
        console.error('❌ Failed to decrypt HUIDU payload, trying legacy key')
        try {
          decryptedData = JSON.parse(
            aesDecrypt(body.payload, API_CONFIG.LEGACY.aes_key)
          )
          console.log('✅ Successfully decrypted with legacy key')
        } catch (legacyError) {
          console.error('❌ Failed to decrypt with both keys')
          const errorPayload = aesEncrypt(
            JSON.stringify({
              credit_amount: '0.00',
              timestamp: Date.now().toString(),
            })
          )

          return NextResponse.json(
            {
              code: 1,
              msg: 'Invalid encrypted payload',
              payload: errorPayload,
            },
            { status: 400 }
          )
        }
      }

      // Re-encrypt with legacy keys for backend compatibility
      const legacyEncryptedPayload = aesEncrypt(
        JSON.stringify(decryptedData),
        API_CONFIG.LEGACY.aes_key
      )

      requestBody = {
        agency_uid: API_CONFIG.LEGACY.agency_uid,
        timestamp: Date.now().toString(),
        payload: legacyEncryptedPayload,
      }

      console.log('✅ Converted HUIDU request to legacy format for backend')
    } else if (!isHuiduFormat && body.member_account) {
      console.log(
        '🔧 Converting raw JSON to legacy encrypted format for backend'
      )

      // Create encrypted payload from raw JSON data using legacy keys
      const encryptedPayload = aesEncrypt(
        JSON.stringify(body),
        API_CONFIG.LEGACY.aes_key
      )

      requestBody = {
        agency_uid: API_CONFIG.LEGACY.agency_uid,
        timestamp: Date.now().toString(),
        payload: encryptedPayload,
      }

      console.log('✅ Converted raw JSON to legacy encrypted format')
    }

    // Forward the request to backend server
    const response = await fetch('http://localhost:3006/api/game/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    console.log('📊 Backend Response Details:')
    console.log('  Status:', response.status)
    console.log('  Headers:', Object.fromEntries(response.headers.entries()))
    console.log('  Body:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('❌ Backend callback error:', data)

      // Return HUIDU compliant error response
      const errorPayload = aesEncrypt(
        JSON.stringify({
          credit_amount: '0.00',
          timestamp: Date.now().toString(),
        })
      )

      return NextResponse.json(
        {
          code: 1,
          msg: data.msg || 'Backend error',
          payload: errorPayload,
        },
        { status: response.status }
      )
    }

    console.log('✅ Backend callback response:', data)

    // Decrypt and log the backend response payload for debugging
    if (data.payload) {
      try {
        const decryptedResponse = aesDecrypt(
          data.payload,
          API_CONFIG.LEGACY.aes_key
        )
        console.log(
          '🔓 Decrypted backend response:',
          JSON.parse(decryptedResponse)
        )
      } catch (decryptError) {
        console.log('⚠️ Could not decrypt backend response with legacy key')
        try {
          const decryptedResponse = aesDecrypt(
            data.payload,
            API_CONFIG.HUIDU.aes_key
          )
          console.log(
            '🔓 Decrypted backend response (HUIDU key):',
            JSON.parse(decryptedResponse)
          )
        } catch (huiduError) {
          console.log('❌ Could not decrypt backend response with either key')
        }
      }
    }

    // Ensure response follows HUIDU specification format
    if (data.payload) {
      // Response is already encrypted, validate format
      return NextResponse.json({
        code: data.code || 0,
        msg: data.msg || 'Success',
        payload: data.payload,
      })
    } else {
      // If response is not encrypted, encrypt it manually (fallback)
      console.log('🔧 Encrypting response payload (fallback)')

      const responsePayload = {
        credit_amount: (
          data.credit_amount ||
          data.balance ||
          '0.00'
        ).toString(),
        timestamp: Date.now().toString(),
      }

      const encryptedPayload = aesEncrypt(JSON.stringify(responsePayload))

      return NextResponse.json({
        code: 0,
        msg: 'Success',
        payload: encryptedPayload,
      })
    }
  } catch (error) {
    console.error('❌ Game callback API error:', error)

    // Return HUIDU compliant encrypted error response
    const errorPayload = aesEncrypt(
      JSON.stringify({
        credit_amount: '0.00',
        timestamp: Date.now().toString(),
      })
    )

    return NextResponse.json(
      {
        code: 1,
        msg: 'Internal server error',
        payload: errorPayload,
      },
      { status: 500 }
    )
  }
}
