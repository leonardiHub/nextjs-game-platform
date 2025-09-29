import { NextRequest, NextResponse } from 'next/server'
import sqlite3 from 'sqlite3'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import path from 'path'

const JWT_SECRET = 'your-secret-key-change-in-production'

// Initialize database
const dbPath = path.join(process.cwd(), 'game_platform.db')
const db = new sqlite3.Database(dbPath)

// Verify admin token
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return { error: 'Admin access token required', status: 401 }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (!decoded.isAdmin) {
      return { error: 'Invalid admin token', status: 403 }
    }
    return { admin: decoded }
  } catch (error) {
    return { error: 'Invalid admin token', status: 403 }
  }
}

// GET /api/admin/accounts - Get all admin accounts
export async function GET(request: NextRequest) {
  const authResult = verifyAdminToken(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const offset = (page - 1) * limit

  return new Promise((resolve) => {
    let whereClause = ''
    let params: any[] = []

    if (search) {
      whereClause = 'WHERE username LIKE ? OR role LIKE ?'
      params = [`%${search}%`, `%${search}%`]
    }

    // Get total count
    db.get(
      `SELECT COUNT(*) as total FROM admins ${whereClause}`,
      params,
      (err, countResult: any) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
          return
        }

        // Get admin accounts (exclude password)
        db.all(
          `SELECT id, username, role, created_at 
           FROM admins ${whereClause} 
           ORDER BY created_at DESC 
           LIMIT ? OFFSET ?`,
          [...params, limit, offset],
          (err, admins) => {
            if (err) {
              resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
              return
            }

            resolve(NextResponse.json({
              admins,
              pagination: {
                page,
                limit,
                total: countResult.total,
                totalPages: Math.ceil(countResult.total / limit)
              }
            }))
          }
        )
      }
    )
  })
}

// POST /api/admin/accounts - Create new admin account
export async function POST(request: NextRequest) {
  const authResult = verifyAdminToken(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { admin } = authResult
  const { username, password, role } = await request.json()

  // Validate input
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
  }

  const validRoles = ['admin', 'super_admin', 'moderator']
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be admin, super_admin, or moderator' }, { status: 400 })
  }

  // Check if current user has permission to create admin accounts
  if (admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can create new admin accounts' }, { status: 403 })
  }

  return new Promise((resolve) => {
    // Check if username already exists
    db.get(
      'SELECT id FROM admins WHERE username = ?',
      [username],
      (err, existingAdmin) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
          return
        }

        if (existingAdmin) {
          resolve(NextResponse.json({ error: 'Username already exists' }, { status: 400 }))
          return
        }

        // Hash password and create admin
        const hashedPassword = bcrypt.hashSync(password, 10)
        const adminRole = role || 'admin'

        db.run(
          'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
          [username, hashedPassword, adminRole],
          function(err) {
            if (err) {
              resolve(NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 }))
              return
            }

            // Return created admin (without password)
            db.get(
              'SELECT id, username, role, created_at FROM admins WHERE id = ?',
              [this.lastID],
              (err, newAdmin) => {
                if (err) {
                  resolve(NextResponse.json({ error: 'Failed to retrieve created admin' }, { status: 500 }))
                  return
                }

                resolve(NextResponse.json({
                  message: 'Admin account created successfully',
                  admin: newAdmin
                }, { status: 201 }))
              }
            )
          }
        )
      }
    )
  })
}
