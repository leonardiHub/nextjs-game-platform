import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./game_platform.db')
const dbAll = promisify(db.all.bind(db)) as any
const dbGet = promisify(db.get.bind(db)) as any
const dbRun = promisify(db.run.bind(db)) as any

const JWT_SECRET = 'your-secret-key-change-in-production'

// Create game_brands table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS game_brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    games_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Initialize with default game brands if empty
db.get('SELECT COUNT(*) as count FROM game_brands', (err, row: any) => {
  if (!err && row.count === 0) {
    const defaultBrands = [
      {
        name: 'JILI Gaming',
        code: 'JILI',
        logo_url: '/images/brands/jili.png',
        description: 'Leading Asian gaming provider with innovative slot games',
        status: 'active',
        games_count: 12
      },
      {
        name: 'Pragmatic Play',
        code: 'PP',
        logo_url: '/images/brands/pragmatic.png',
        description: 'World-class gaming content provider',
        status: 'active',
        games_count: 8
      },
      {
        name: 'PG Soft',
        code: 'PG',
        logo_url: '/images/brands/pgsoft.png',
        description: 'Mobile-focused gaming solutions',
        status: 'active',
        games_count: 6
      },
      {
        name: 'Habanero',
        code: 'HAB',
        logo_url: '/images/brands/habanero.png',
        description: 'Premium casino games provider',
        status: 'active',
        games_count: 4
      },
      {
        name: 'Red Tiger',
        code: 'RT',
        logo_url: '/images/brands/redtiger.png',
        description: 'Innovative slot game developer',
        status: 'active',
        games_count: 3
      }
    ]

    defaultBrands.forEach(brand => {
      db.run(`
        INSERT INTO game_brands (name, code, logo_url, description, status, games_count) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [brand.name, brand.code, brand.logo_url, brand.description, brand.status, brand.games_count])
    })
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

// GET - Retrieve all game brands
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brands = await dbAll(
      'SELECT * FROM game_brands ORDER BY created_at DESC'
    ) as any[]

    return NextResponse.json({
      brands: brands.map(brand => ({
        ...brand,
        created_at: brand.created_at,
        updated_at: brand.updated_at
      }))
    })
  } catch (error) {
    console.error('Error getting game brands:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve game brands' },
      { status: 500 }
    )
  }
}

// POST - Create new game brand
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, code, logo_url, description, status, games_count } = await request.json()

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name and code' },
        { status: 400 }
      )
    }

    // Check if brand code already exists
    const existingBrand = await dbGet(
      'SELECT id FROM game_brands WHERE code = ?',
      [code]
    ) as any

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand code already exists' },
        { status: 400 }
      )
    }

    // Insert new brand
    const result = await dbRun(`
      INSERT INTO game_brands (name, code, logo_url, description, status, games_count) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, code, logo_url || '', description || '', status || 'active', games_count || 0]) as any

    return NextResponse.json({
      success: true,
      id: result.lastID,
      message: 'Game brand created successfully'
    })
  } catch (error) {
    console.error('Error creating game brand:', error)
    return NextResponse.json(
      { error: 'Failed to create game brand' },
      { status: 500 }
    )
  }
}
