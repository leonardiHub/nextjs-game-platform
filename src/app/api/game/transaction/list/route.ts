import { NextRequest, NextResponse } from 'next/server'
import { aesDecrypt } from '@/utils/crypto'

/**
 * Get Transaction Records - According to HUIDU API Documentation
 * POST /api/game/transaction/list
 *
 * Returns the list of transaction records within a specific time period
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
 *   "timestamp": "1724040409365",
 *   "agency_uid": "8dee1e401b87408cca3ca813c2250cb4",
 *   "from_date": "1722384000000",
 *   "to_date": "1722470399000",
 *   "page_no": 1,
 *   "page_size": 30
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('📊 Transaction list request:', {
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
      // Decrypt the payload to get query parameters
      const decryptedPayload = aesDecrypt(body.payload)
      const queryParams = JSON.parse(decryptedPayload)

      console.log('🔓 Decrypted query parameters:', queryParams)

      // Validate required parameters
      const { from_date, to_date, page_no = 1, page_size = 30 } = queryParams

      if (!from_date || !to_date) {
        return NextResponse.json(
          {
            code: 1,
            msg: 'Missing required parameters: from_date, to_date',
          },
          { status: 400 }
        )
      }

      // Validate page_size limits (1-5000 according to documentation)
      const validPageSize = Math.min(Math.max(parseInt(page_size), 1), 5000)

      console.log('📅 Query range:', {
        from: new Date(parseInt(from_date)),
        to: new Date(parseInt(to_date)),
        page: page_no,
        size: validPageSize,
      })

      // Forward to backend transactions endpoint
      const response = await fetch('http://localhost:3006/api/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      let backendData = []
      if (response.ok) {
        const data = await response.json()
        backendData = data.transactions || []
      }

      // Filter by date range and format according to HUIDU specification
      const fromTimestamp = parseInt(from_date)
      const toTimestamp = parseInt(to_date)

      const filteredRecords = backendData
        .filter((record: Record<string, unknown>) => {
          const recordTime = new Date(
            (record.created_at || record.timestamp) as string
          ).getTime()
          return recordTime >= fromTimestamp && recordTime <= toTimestamp
        })
        .map((record: Record<string, unknown>) => ({
          agency_uid: body.agency_uid,
          member_account:
            record.member_account || record.player_account || 'unknown',
          bet_amount: (record.bet_amount || 0).toString(),
          win_amount: (record.win_amount || 0).toString(),
          currency_code: record.currency_code || 'USD',
          serial_number:
            record.serial_number || record.transaction_id || `TXN_${record.id}`,
          game_round: record.game_round || record.round_id || '',
          game_uid: record.game_uid || record.game_id || '',
          timestamp:
            record.timestamp ||
            new Date(record.created_at as string)
              .toISOString()
              .replace('T', ' ')
              ?.slice(0, 19),
        }))

      // Paginate results
      const startIndex = (page_no - 1) * validPageSize
      const endIndex = startIndex + validPageSize
      const paginatedRecords = filteredRecords?.slice(startIndex, endIndex)

      const totalCount = filteredRecords.length
      const totalPages = Math.ceil(totalCount / validPageSize)

      const responsePayload = {
        total_count: totalCount,
        current_page: page_no,
        page_size: validPageSize,
        total_page: totalPages,
        records: paginatedRecords,
      }

      console.log('✅ Transaction list response:', {
        total_count: totalCount,
        current_page: page_no,
        records_returned: paginatedRecords.length,
      })

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
    console.error('❌ Transaction list API error:', error)
    return NextResponse.json(
      {
        code: 1,
        msg: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
