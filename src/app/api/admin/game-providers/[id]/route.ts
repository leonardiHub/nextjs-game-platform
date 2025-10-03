import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbGet = promisify(db.get.bind(db))
const dbRun = promisify(db.run.bind(db))

const JWT_SECRET = 'fun88-secret-key-change-in-production'

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

// PUT - Update game provider
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, code, agency_uid, aes_key, server_url, status } =
      await request.json()
    const providerId = params.id

    // Validate required fields
    if (!name || !code || !agency_uid || !aes_key || !server_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if provider exists
    const existingProvider = (await dbGet(
      'SELECT id FROM game_providers WHERE id = ?',
      [providerId]
    )) as any

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Check if code is taken by another provider
    const codeConflict = (await dbGet(
      'SELECT id FROM game_providers WHERE code = ? AND id != ?',
      [code, providerId]
    )) as any

    if (codeConflict) {
      return NextResponse.json(
        { error: 'Provider code already exists' },
        { status: 400 }
      )
    }

    // Update provider
    await dbRun(
      `
      UPDATE game_providers 
      SET name = ?, code = ?, agency_uid = ?, aes_key = ?, server_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [name, code, agency_uid, aes_key, server_url, status, providerId]
    )

    return NextResponse.json({
      success: true,
      message: 'Game provider updated successfully',
    })
  } catch (error) {
    console.error('Error updating game provider:', error)
    return NextResponse.json(
      { error: 'Failed to update game provider' },
      { status: 500 }
    )
  }
}

// DELETE - Delete game provider
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const providerId = params.id

    // Check if provider exists
    const existingProvider = (await dbGet(
      'SELECT id FROM game_providers WHERE id = ?',
      [providerId]
    )) as any

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Check if provider has games (optional - you might want to prevent deletion)
    const gameCount = (await dbGet(
      'SELECT COUNT(*) as count FROM games WHERE provider_id = ?',
      [providerId]
    )) as any

    if (gameCount && gameCount.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete provider with existing games' },
        { status: 400 }
      )
    }

    // Delete provider
    await dbRun('DELETE FROM game_providers WHERE id = ?', [providerId])

    return NextResponse.json({
      success: true,
      message: 'Game provider deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting game provider:', error)
    return NextResponse.json(
      { error: 'Failed to delete game provider' },
      { status: 500 }
    )
  }
}
