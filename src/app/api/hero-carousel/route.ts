import { NextRequest, NextResponse } from 'next/server'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbAll = promisify(db.all.bind(db)) as any

// GET - Get all active hero carousel items (public endpoint)
export async function GET(request: NextRequest) {
  try {
    // Get active carousel items from local database
    const carouselItems = await dbAll(`
      SELECT hc.*
      FROM hero_carousel hc
      WHERE hc.is_active = 1
      ORDER BY hc.display_order ASC
    `)

    // Enrich carousel items with media details from backend server
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3006'
    const enrichedItems = await Promise.all(
      carouselItems.map(async item => {
        try {
          const mediaResponse = await fetch(
            `${API_BASE_URL}/api/admin/media/${item.media_id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

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
          console.error(
            `Error fetching media for carousel item ${item.id}:`,
            error
          )
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

    return NextResponse.json({
      success: true,
      carouselItems: enrichedItems || [],
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

