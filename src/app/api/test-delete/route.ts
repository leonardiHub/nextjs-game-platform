import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./game_platform.db')
const dbGet = promisify(db.get.bind(db)) as any

const JWT_SECRET = 'your-secret-key-change-in-production'

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test the query that's causing issues
    const providerId = '4'
    
    // Check if provider exists
    const existingProvider = await dbGet(
      'SELECT id FROM game_library_providers WHERE id = ?',
      [providerId]
    ) as any

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' })
    }

    // Get the provider code
    const providerInfo = await dbGet(
      'SELECT code FROM game_library_providers WHERE id = ?',
      [providerId]
    ) as any

    // Check game count
    const gameCount = await dbGet(
      'SELECT COUNT(*) as count FROM games g JOIN game_providers p ON g.provider_id = p.id WHERE p.code = ?',
      [providerInfo.code]
    ) as any

    return NextResponse.json({
      providerId,
      existingProvider,
      providerInfo,
      gameCount,
      message: 'Debug info for DELETE operation'
    })

  } catch (error) {
    console.error('Test DELETE error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
