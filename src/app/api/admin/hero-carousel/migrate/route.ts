import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbRun = promisify(db.run.bind(db)) as any

const JWT_SECRET = 'fun88-secret-key-change-in-production'

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

// POST - Create hero carousel table
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create hero_carousel table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS hero_carousel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        button_text TEXT,
        button_url TEXT,
        media_id INTEGER NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (media_id) REFERENCES media (id)
      )
    `)

    // Create index for better performance
    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_hero_carousel_display_order 
      ON hero_carousel (display_order)
    `)

    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_hero_carousel_active 
      ON hero_carousel (is_active)
    `)

    return NextResponse.json({
      message: 'Hero carousel table created successfully',
    })
  } catch (error) {
    console.error('Error creating hero carousel table:', error)
    return NextResponse.json(
      { error: 'Failed to create hero carousel table' },
      { status: 500 }
    )
  }
}

