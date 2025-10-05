import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbGet = promisify(db.get.bind(db)) as any
const dbAll = promisify(db.all.bind(db)) as any
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

// GET - Get all hero carousel items
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const carouselItems = await dbAll(`
      SELECT hc.*, m.filename, m.url, m.alt_text, m.title as media_title
      FROM hero_carousel hc
      LEFT JOIN media m ON hc.media_id = m.id
      ORDER BY hc.display_order ASC
    `)

    return NextResponse.json({ carouselItems })
  } catch (error) {
    console.error('Error fetching hero carousel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero carousel items' },
      { status: 500 }
    )
  }
}

// POST - Create new hero carousel item
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { media_id, display_order, is_active } = await request.json()

    // Validate required fields
    if (!media_id) {
      return NextResponse.json({ error: 'Media is required' }, { status: 400 })
    }

    // Check if media exists on backend server
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3006'
    try {
      const mediaResponse = await fetch(`${API_BASE_URL}/api/admin/media/${media_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!mediaResponse.ok) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 })
      }
    } catch (error) {
      console.error('Error checking media:', error)
      return NextResponse.json({ error: 'Failed to validate media' }, { status: 500 })
    }

    // Get next display order if not provided
    let order = display_order
    if (!order) {
      const maxOrder = await dbGet(
        'SELECT MAX(display_order) as max_order FROM hero_carousel'
      )
      order = (maxOrder?.max_order || 0) + 1
    }

    const result = await new Promise<{ lastID: number }>((resolve, reject) => {
      db.run(
        `INSERT INTO hero_carousel 
         (media_id, display_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [media_id, order, is_active ? 1 : 0],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve({ lastID: this.lastID })
          }
        }
      )
    })

    // Fetch the created item with media details
    const newItem = await dbGet(
      `
      SELECT hc.*, m.filename, m.url, m.alt_text, m.title as media_title
      FROM hero_carousel hc
      LEFT JOIN media m ON hc.media_id = m.id
      WHERE hc.id = ?
    `,
      [result.lastID]
    )

    return NextResponse.json(
      {
        message: 'Hero carousel item created successfully',
        item: newItem,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating hero carousel item:', error)
    return NextResponse.json(
      { error: 'Failed to create hero carousel item' },
      { status: 500 }
    )
  }
}
