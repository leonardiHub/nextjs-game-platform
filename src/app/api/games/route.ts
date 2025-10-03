import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get games directly from database without authentication
    const { Database } = await import('sqlite3')
    const { promisify } = await import('util')

    const db = new Database('./fun88_standalone.db')
    const dbAll = promisify(db.all.bind(db)) as any

    const games = (await dbAll(`
      SELECT 
        g.*,
        p.name as provider_name,
        p.code as provider_code
      FROM games g
      LEFT JOIN game_library_providers p ON g.provider_id = p.id
      WHERE g.status = 'active'
      ORDER BY g.displaySequence ASC
    `)) as any[]

    db.close()

    // Return the games data in the expected format
    return NextResponse.json({
      games: games.map(game => ({
        ...game,
        featured: Boolean(game.featured),
        displaySequence: game.displaySequence || null,
        created_at: game.created_at,
        updated_at: game.updated_at,
      })),
      success: true,
    })
  } catch (error) {
    console.error('Games API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()

    // POST requires authentication - redirect to admin endpoint
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required for creating games' },
        { status: 401 }
      )
    }

    // Sync with admin games endpoint
    const response = await fetch('http://localhost:3001/api/admin/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Games POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
