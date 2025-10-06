import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbGet = promisify(db.get.bind(db)) as any
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

// GET - Get single hero carousel item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: itemId } = await params

    const item = await dbGet(
      `
      SELECT hc.*, m.filename, m.url, m.alt_text, m.title as media_title
      FROM hero_carousel hc
      LEFT JOIN media m ON hc.media_id = m.id
      WHERE hc.id = ?
    `,
      [itemId]
    )

    if (!item) {
      return NextResponse.json(
        { error: 'Hero carousel item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error fetching hero carousel item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero carousel item' },
      { status: 500 }
    )
  }
}

// PUT - Update hero carousel item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: itemId } = await params
    const { media_id, display_order, is_active } = await request.json()

    // Validate required fields
    if (!media_id) {
      return NextResponse.json({ error: 'Media is required' }, { status: 400 })
    }

    // Check if item exists
    const existingItem = await dbGet(
      'SELECT id FROM hero_carousel WHERE id = ?',
      [itemId]
    )
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Hero carousel item not found' },
        { status: 404 }
      )
    }

    // Check if media exists on backend server
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002'
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

    // Update item
    await dbRun(
      `UPDATE hero_carousel 
       SET media_id = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [media_id, display_order || 0, is_active ? 1 : 0, itemId]
    )

    // Fetch updated item with media details
    const updatedItem = await dbGet(
      `
      SELECT hc.*, m.filename, m.url, m.alt_text, m.title as media_title
      FROM hero_carousel hc
      LEFT JOIN media m ON hc.media_id = m.id
      WHERE hc.id = ?
    `,
      [itemId]
    )

    return NextResponse.json({
      message: 'Hero carousel item updated successfully',
      item: updatedItem,
    })
  } catch (error) {
    console.error('Error updating hero carousel item:', error)
    return NextResponse.json(
      { error: 'Failed to update hero carousel item' },
      { status: 500 }
    )
  }
}

// DELETE - Delete hero carousel item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: itemId } = await params

    // Check if item exists
    const existingItem = await dbGet(
      'SELECT id FROM hero_carousel WHERE id = ?',
      [itemId]
    )
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Hero carousel item not found' },
        { status: 404 }
      )
    }

    // Delete item
    await dbRun('DELETE FROM hero_carousel WHERE id = ?', [itemId])

    return NextResponse.json({
      message: 'Hero carousel item deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting hero carousel item:', error)
    return NextResponse.json(
      { error: 'Failed to delete hero carousel item' },
      { status: 500 }
    )
  }
}
