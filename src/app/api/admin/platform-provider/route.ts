import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./game_platform.db')
const dbAll = promisify(db.all.bind(db)) as any
const dbGet = promisify(db.get.bind(db)) as any
const dbRun = promisify(db.run.bind(db)) as any

const JWT_SECRET = 'your-secret-key-change-in-production'

// Create platform_provider table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS platform_provider (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    server_url TEXT NOT NULL,
    agency_uid TEXT NOT NULL,
    aes_key TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Initialize with default merchant provider if empty
db.get('SELECT COUNT(*) as count FROM platform_provider', (err, row: any) => {
  if (!err && row.count === 0) {
    db.run(`
      INSERT INTO platform_provider (name, server_url, agency_uid, aes_key, status) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      'Merchant Gaming Platform',
      'https://jsgame.live',
      '45370b4f27dfc8a2875ba78d07e8a81a',
      '08970240475e1255d2b4ac023ac658f3',
      'active'
    ])
  }
})

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

// GET - Retrieve platform provider settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const provider = await dbGet(
      'SELECT * FROM platform_provider ORDER BY created_at DESC LIMIT 1'
    ) as any

    return NextResponse.json({
      provider: provider || null
    })
  } catch (error) {
    console.error('Error getting platform provider:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve platform provider' },
      { status: 500 }
    )
  }
}

// POST - Create or update platform provider
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, server_url, agency_uid, aes_key, status } = await request.json()

    // Validate required fields
    if (!name || !server_url || !agency_uid || !aes_key) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if provider already exists
    const existingProvider = await dbGet(
      'SELECT id FROM platform_provider LIMIT 1'
    ) as any

    if (existingProvider) {
      // Update existing provider
      await dbRun(`
        UPDATE platform_provider 
        SET name = ?, server_url = ?, agency_uid = ?, aes_key = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, server_url, agency_uid, aes_key, status || 'active', existingProvider.id]) as any

      return NextResponse.json({
        success: true,
        message: 'Platform provider updated successfully'
      })
    } else {
      // Insert new provider
      const result = await dbRun(`
        INSERT INTO platform_provider (name, server_url, agency_uid, aes_key, status) 
        VALUES (?, ?, ?, ?, ?)
      `, [name, server_url, agency_uid, aes_key, status || 'active']) as any

      return NextResponse.json({
        success: true,
        id: result.lastID,
        message: 'Platform provider created successfully'
      })
    }
  } catch (error) {
    console.error('Error saving platform provider:', error)
    return NextResponse.json(
      { error: 'Failed to save platform provider' },
      { status: 500 }
    )
  }
}
