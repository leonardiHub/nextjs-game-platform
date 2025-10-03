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

// PUT - Update game
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

    const {
      name,
      code,
      game_uid,
      type,
      provider_id,
      rtp,
      status,
      featured,
      displaySequence,
      min_bet,
      max_bet,
      demo_url,
      thumbnail_url,
    } = await request.json()
    const gameId = params.id

    // Validate required fields
    if (!name || !code || !game_uid || !type || !provider_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if game exists
    const existingGame = (await dbGet('SELECT id FROM games WHERE id = ?', [
      gameId,
    ])) as any

    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if game UID is taken by another game
    const uidConflict = (await dbGet(
      'SELECT id FROM games WHERE game_uid = ? AND id != ?',
      [game_uid, gameId]
    )) as any

    if (uidConflict) {
      return NextResponse.json(
        { error: 'Game UID already exists' },
        { status: 400 }
      )
    }

    // Check if provider exists
    const provider = (await dbGet(
      'SELECT id FROM game_library_providers WHERE id = ?',
      [provider_id]
    )) as any

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 400 })
    }

    // Update game
    await dbRun(
      `
      UPDATE games 
      SET name = ?, code = ?, game_uid = ?, type = ?, provider_id = ?, rtp = ?, 
          status = ?, featured = ?, displaySequence = ?, min_bet = ?, max_bet = ?, 
          demo_url = ?, thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name,
        code,
        game_uid,
        type,
        provider_id,
        rtp,
        status,
        featured ? 1 : 0,
        displaySequence,
        min_bet,
        max_bet,
        demo_url,
        thumbnail_url,
        gameId,
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Game updated successfully',
    })
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    )
  }
}

// DELETE - Delete game
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

    const gameId = params.id

    // Check if game exists
    const existingGame = (await dbGet('SELECT id FROM games WHERE id = ?', [
      gameId,
    ])) as any

    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if game has active sessions or transactions (optional)
    const activeTransactions = (await dbGet(
      'SELECT COUNT(*) as count FROM game_transactions WHERE game_uid = (SELECT game_uid FROM games WHERE id = ?)',
      [gameId]
    )) as any

    if (activeTransactions && activeTransactions.count > 0) {
      // Instead of preventing deletion, you might want to just set status to inactive
      await dbRun(
        'UPDATE games SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['inactive', gameId]
      )

      return NextResponse.json({
        success: true,
        message: 'Game deactivated (has transaction history)',
      })
    }

    // Delete game
    await dbRun('DELETE FROM games WHERE id = ?', [gameId])

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json(
      { error: 'Failed to delete game' },
      { status: 500 }
    )
  }
}
