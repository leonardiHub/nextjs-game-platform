import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./fun88_standalone.db')
const dbAll = promisify(db.all.bind(db)) as any
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

// GET - Retrieve single game brand
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brand = (await dbGet('SELECT * FROM game_brands WHERE id = ?', [
      params.id,
    ])) as any

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({ brand })
  } catch (error) {
    console.error('Error getting game brand:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve game brand' },
      { status: 500 }
    )
  }
}

// PUT - Update game brand
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

    const { name, code, logo_url, description, status, games_count } =
      await request.json()

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name and code' },
        { status: 400 }
      )
    }

    // Check if brand exists
    const existingBrand = (await dbGet(
      'SELECT id FROM game_brands WHERE id = ?',
      [params.id]
    )) as any

    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Check if code is taken by another brand
    const duplicateBrand = (await dbGet(
      'SELECT id FROM game_brands WHERE code = ? AND id != ?',
      [code, params.id]
    )) as any

    if (duplicateBrand) {
      return NextResponse.json(
        { error: 'Brand code already exists' },
        { status: 400 }
      )
    }

    // Update brand
    ;(await dbRun(
      `
      UPDATE game_brands 
      SET name = ?, code = ?, logo_url = ?, description = ?, status = ?, games_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name,
        code,
        logo_url || '',
        description || '',
        status || 'active',
        games_count || 0,
        params.id,
      ]
    )) as any

    return NextResponse.json({
      success: true,
      message: 'Game brand updated successfully',
    })
  } catch (error) {
    console.error('Error updating game brand:', error)
    return NextResponse.json(
      { error: 'Failed to update game brand' },
      { status: 500 }
    )
  }
}

// DELETE - Delete game brand
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

    // Check if brand exists
    const existingBrand = (await dbGet(
      'SELECT id FROM game_brands WHERE id = ?',
      [params.id]
    )) as any

    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Delete brand
    ;(await dbRun('DELETE FROM game_brands WHERE id = ?', [params.id])) as any

    return NextResponse.json({
      success: true,
      message: 'Game brand deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting game brand:', error)
    return NextResponse.json(
      { error: 'Failed to delete game brand' },
      { status: 500 }
    )
  }
}
