import { NextRequest, NextResponse } from 'next/server'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbAll = promisify(db.all.bind(db)) as any

// GET - Get all active hero carousel items (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const carouselItems = await dbAll(`
      SELECT hc.id, hc.display_order, hc.is_active, hc.created_at, hc.updated_at,
             m.id as media_id, m.filename, m.url, m.alt_text, m.title as media_title
      FROM hero_carousel hc
      LEFT JOIN media m ON hc.media_id = m.id
      WHERE hc.is_active = 1
      ORDER BY hc.display_order ASC
    `)

    return NextResponse.json({
      success: true,
      carouselItems: carouselItems || [],
    })
  } catch (error) {
    console.error('Error fetching hero carousel:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hero carousel items',
      },
      { status: 500 }
    )
  }
}

