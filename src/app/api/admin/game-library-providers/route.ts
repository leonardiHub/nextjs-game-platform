import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbAll = promisify(db.all.bind(db)) as any
const dbGet = promisify(db.get.bind(db)) as any
const dbRun = promisify(db.run.bind(db)) as any

const JWT_SECRET =
  process.env.JWT_SECRET || 'fun88-secret-key-change-in-production'
console.log('JWT_SECRET being used:', JWT_SECRET)

// Create game_library_providers table if it doesn't exist (renamed from game_brands)
db.run(`
  CREATE TABLE IF NOT EXISTS game_library_providers (
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

// Migrate data from game_brands if exists and game_library_providers is empty
db.get(
  'SELECT COUNT(*) as count FROM game_library_providers',
  (err, row: any) => {
    if (!err && row.count === 0) {
      // Try to migrate from game_brands
      db.all('SELECT * FROM game_brands', (err, brands: any[]) => {
        if (!err && brands && brands.length > 0) {
          // Migrate existing brands to providers
          brands.forEach(brand => {
            db.run(
              `
            INSERT INTO game_library_providers (id, name, code, logo_url, description, status, games_count, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
              [
                brand.id,
                brand.name,
                brand.code,
                brand.logo_url,
                brand.description,
                brand.status,
                brand.games_count,
                brand.created_at,
                brand.updated_at,
              ]
            )
          })
        } else {
          // Initialize with default providers
          const defaultProviders = [
            {
              name: 'JILI Gaming',
              code: 'JILI',
              logo_url: '/images/providers/jili.png',
              description:
                'Leading Asian gaming provider with innovative slot games',
              status: 'active',
              games_count: 12,
            },
            {
              name: 'Pragmatic Play',
              code: 'PP',
              logo_url: '/images/providers/pragmatic.png',
              description: 'World-class gaming content provider',
              status: 'active',
              games_count: 8,
            },
            {
              name: 'PG Soft',
              code: 'PG',
              logo_url: '/images/providers/pgsoft.png',
              description: 'Mobile-focused gaming solutions',
              status: 'active',
              games_count: 6,
            },
            {
              name: 'Habanero',
              code: 'HAB',
              logo_url: '/images/providers/habanero.png',
              description: 'Premium casino games provider',
              status: 'active',
              games_count: 4,
            },
            {
              name: 'Red Tiger',
              code: 'RT',
              logo_url: '/images/providers/redtiger.png',
              description: 'Innovative slot game developer',
              status: 'active',
              games_count: 3,
            },
          ]

          defaultProviders.forEach(provider => {
            db.run(
              `
            INSERT INTO game_library_providers (name, code, logo_url, description, status, games_count) 
            VALUES (?, ?, ?, ?, ?, ?)
          `,
              [
                provider.name,
                provider.code,
                provider.logo_url,
                provider.description,
                provider.status,
                provider.games_count,
              ]
            )
          })
        }
      })
    }
  }
)

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('JWT decoded:', decoded)
    console.log('isAdmin check:', decoded.isAdmin === true)
    return decoded.isAdmin === true
  } catch (error) {
    console.log('JWT verification error:', error)
    return false
  }
}

// GET - Retrieve all game library providers
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const providers = (await dbAll(
      'SELECT * FROM game_library_providers ORDER BY created_at DESC'
    )) as any[]

    return NextResponse.json({
      providers: providers.map(provider => ({
        ...provider,
        game_count: provider.games_count, // Map to match component interface
        created_at: provider.created_at,
        updated_at: provider.updated_at,
      })),
    })
  } catch (error) {
    console.error('Error getting game library providers:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve game library providers' },
      { status: 500 }
    )
  }
}

// POST - Create new game library provider
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, code, logo_url, description, status, game_count } =
      await request.json()

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name and code' },
        { status: 400 }
      )
    }

    // Check if provider code already exists
    const existingProvider = (await dbGet(
      'SELECT id FROM game_library_providers WHERE code = ?',
      [code]
    )) as any

    if (existingProvider) {
      return NextResponse.json(
        { error: 'Provider code already exists' },
        { status: 400 }
      )
    }

    // Insert new provider
    const result = await new Promise<{ lastID: number }>((resolve, reject) => {
      db.run(
        `
        INSERT INTO game_library_providers (name, code, logo_url, description, status, games_count) 
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          name,
          code,
          logo_url || '',
          description || '',
          status || 'active',
          game_count || 0,
        ],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve({ lastID: this.lastID })
          }
        }
      )
    })

    return NextResponse.json({
      success: true,
      id: result.lastID,
      message: 'Game library provider created successfully',
    })
  } catch (error) {
    console.error('Error creating game library provider:', error)
    return NextResponse.json(
      { error: 'Failed to create game library provider' },
      { status: 500 }
    )
  }
}
