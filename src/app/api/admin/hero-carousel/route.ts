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

    // Get carousel items from local database
    const carouselItems = await dbAll(`
      SELECT hc.*
      FROM hero_carousel hc
      ORDER BY hc.display_order ASC
    `)

    // Enrich carousel items with media details from backend server
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3006'
    const enrichedItems = await Promise.all(
      carouselItems.map(async (item) => {
        try {
          const mediaResponse = await fetch(`${API_BASE_URL}/api/admin/media/${item.media_id}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json()
            return {
              ...item,
              filename: mediaData.filename,
              url: mediaData.url,
              alt_text: mediaData.alt_text,
              media_title: mediaData.title || mediaData.original_name,
            }
          } else {
            // If media not found, return item with null media fields
            return {
              ...item,
              filename: null,
              url: null,
              alt_text: null,
              media_title: null,
            }
          }
        } catch (error) {
          console.error(`Error fetching media for carousel item ${item.id}:`, error)
          return {
            ...item,
            filename: null,
            url: null,
            alt_text: null,
            media_title: null,
          }
        }
      })
    )

    return NextResponse.json({ carouselItems: enrichedItems })
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
      const mediaResponse = await fetch(
        `${API_BASE_URL}/api/admin/media/${media_id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!mediaResponse.ok) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 })
      }
    } catch (error) {
      console.error('Error checking media:', error)
      return NextResponse.json(
        { error: 'Failed to validate media' },
        { status: 500 }
      )
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

    // Fetch the created item from local database
    const newItem = await dbGet('SELECT * FROM hero_carousel WHERE id = ?', [result.lastID])

    // Enrich with media details from backend server
    let enrichedItem = { ...newItem }
    try {
      const mediaResponse = await fetch(`${API_BASE_URL}/api/admin/media/${media_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        enrichedItem = {
          ...newItem,
          filename: mediaData.filename,
          url: mediaData.url,
          alt_text: mediaData.alt_text,
          media_title: mediaData.title || mediaData.original_name,
        }
      }
    } catch (error) {
      console.error('Error fetching media details for new item:', error)
    }

    return NextResponse.json(
      {
        message: 'Hero carousel item created successfully',
        item: enrichedItem,
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
