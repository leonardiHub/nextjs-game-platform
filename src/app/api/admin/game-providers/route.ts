import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./game_platform.db')
const dbAll = promisify(db.all.bind(db))
const dbGet = promisify(db.get.bind(db))
const dbRun = promisify(db.run.bind(db))

const JWT_SECRET = 'your-secret-key-change-in-production'

// Create game_providers table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS game_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    agency_uid TEXT NOT NULL,
    aes_key TEXT NOT NULL,
    server_url TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Initialize with default JILI provider if empty
db.get('SELECT COUNT(*) as count FROM game_providers', (err, row: any) => {
  if (!err && row.count === 0) {
    db.run(`
      INSERT INTO game_providers (name, code, agency_uid, aes_key, server_url, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'JILI Gaming',
      'JILI',
      '45370b4f27dfc8a2875ba78d07e8a81a',
      '08970240475e1255d2b4ac023ac658f3',
      'https://jsgame.live',
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

// GET - Retrieve all game providers
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const providers = await dbAll(
      'SELECT * FROM game_providers ORDER BY created_at DESC'
    ) as any[]

    return NextResponse.json({
      providers: providers.map(provider => ({
        ...provider,
        created_at: provider.created_at,
        updated_at: provider.updated_at
      }))
    })
  } catch (error) {
    console.error('Error getting game providers:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve game providers' },
      { status: 500 }
    )
  }
}

// POST - Create new game provider
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, code, agency_uid, aes_key, server_url, status } = await request.json()

    // Validate required fields
    if (!name || !code || !agency_uid || !aes_key || !server_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if provider code already exists
    const existingProvider = await dbGet(
      'SELECT id FROM game_providers WHERE code = ?',
      [code]
    ) as any

    if (existingProvider) {
      return NextResponse.json(
        { error: 'Provider code already exists' },
        { status: 400 }
      )
    }

    // Insert new provider
    const result = await dbRun(`
      INSERT INTO game_providers (name, code, agency_uid, aes_key, server_url, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, code, agency_uid, aes_key, server_url, status || 'active']) as any

    return NextResponse.json({
      success: true,
      id: result.lastID,
      message: 'Game provider created successfully'
    })
  } catch (error) {
    console.error('Error creating game provider:', error)
    return NextResponse.json(
      { error: 'Failed to create game provider' },
      { status: 500 }
    )
  }
}
