import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbGet = promisify(db.get.bind(db)) as any
const dbRun = promisify(db.run.bind(db)) as any

const JWT_SECRET =
  process.env.JWT_SECRET || 'fun88-secret-key-change-in-production'

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

// PUT - Update game library provider
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

    const { name, code, logo_url, description, status, game_count } =
      await request.json()
    const providerId = params.id

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name and code' },
        { status: 400 }
      )
    }

    // Check if provider exists
    const existingProvider = (await dbGet(
      'SELECT id FROM game_library_providers WHERE id = ?',
      [providerId]
    )) as any

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Check if code is taken by another provider
    const codeConflict = (await dbGet(
      'SELECT id FROM game_library_providers WHERE code = ? AND id != ?',
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
      UPDATE game_library_providers 
      SET name = ?, code = ?, logo_url = ?, description = ?, status = ?, games_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name,
        code,
        logo_url || '',
        description || '',
        status || 'active',
        game_count || 0,
        providerId,
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Game library provider updated successfully',
    })
  } catch (error) {
    console.error('Error updating game library provider:', error)
    return NextResponse.json(
      { error: 'Failed to update game library provider' },
      { status: 500 }
    )
  }
}

// DELETE - Delete game library provider
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
      'SELECT id FROM game_library_providers WHERE id = ?',
      [providerId]
    )) as any

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Get the provider code to match with game_providers table
    const providerInfo = (await dbGet(
      'SELECT code FROM game_library_providers WHERE id = ?',
      [providerId]
    )) as any

    if (!providerInfo) {
      return NextResponse.json(
        { error: 'Provider code not found' },
        { status: 404 }
      )
    }

    // Check if provider has games by matching provider codes
    const gameCount = (await dbGet(
      'SELECT COUNT(*) as count FROM games g JOIN game_providers p ON g.provider_id = p.id WHERE p.code = ?',
      [providerInfo.code]
    )) as any

    if (gameCount && gameCount.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete provider with existing games' },
        { status: 400 }
      )
    }

    // Delete provider
    await dbRun('DELETE FROM game_library_providers WHERE id = ?', [providerId])

    return NextResponse.json({
      success: true,
      message: 'Game library provider deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting game library provider:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete game library provider',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
