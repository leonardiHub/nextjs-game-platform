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

// GET /api/admin/accounts/[id] - Get single admin account
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = verifyAdminToken(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const adminId = params.id

  return new Promise((resolve) => {
    db.get(
      'SELECT id, username, role, created_at FROM admins WHERE id = ?',
      [adminId],
      (err, admin) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
          return
        }

        if (!admin) {
          resolve(NextResponse.json({ error: 'Admin account not found' }, { status: 404 }))
          return
        }

        resolve(NextResponse.json({ admin }))
      }
    )
  })
}

// PUT /api/admin/accounts/[id] - Update admin account
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = verifyAdminToken(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { admin } = authResult
  const adminId = params.id
  const { username, password, role } = await request.json()

  // Check if current user has permission to update admin accounts
  if (admin.role !== 'super_admin' && admin.adminId.toString() !== adminId) {
    return NextResponse.json({ error: 'You can only update your own account or you must be a super admin' }, { status: 403 })
  }

  // Validate role if provided
  const validRoles = ['admin', 'super_admin', 'moderator']
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be admin, super_admin, or moderator' }, { status: 400 })
  }

  // Only super admins can change roles
  if (role && admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can change user roles' }, { status: 403 })
  }

  return new Promise((resolve) => {
    // Check if admin exists
    db.get(
      'SELECT * FROM admins WHERE id = ?',
      [adminId],
      (err, existingAdmin: any) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
          return
        }

        if (!existingAdmin) {
          resolve(NextResponse.json({ error: 'Admin account not found' }, { status: 404 }))
          return
        }

        // Prepare update fields
        const updates: string[] = []
        const params: any[] = []

        const performUpdate = () => {
          if (username && username !== existingAdmin.username) {
            updates.push('username = ?')
            params.push(username)
          }

          if (password) {
            if (password.length < 6) {
              resolve(NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 }))
              return
            }
            updates.push('password = ?')
            params.push(bcrypt.hashSync(password, 10))
          }

          if (role) {
            updates.push('role = ?')
            params.push(role)
          }

          if (updates.length === 0) {
            resolve(NextResponse.json({ error: 'No fields to update' }, { status: 400 }))
            return
          }

          params.push(adminId)

          db.run(
            `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`,
            params,
            function(err) {
              if (err) {
                resolve(NextResponse.json({ error: 'Failed to update admin account' }, { status: 500 }))
                return
              }

              // Return updated admin (without password)
              db.get(
                'SELECT id, username, role, created_at FROM admins WHERE id = ?',
                [adminId],
                (err, updatedAdmin) => {
                  if (err) {
                    resolve(NextResponse.json({ error: 'Failed to retrieve updated admin' }, { status: 500 }))
                    return
                  }

                  resolve(NextResponse.json({
                    message: 'Admin account updated successfully',
                    admin: updatedAdmin
                  }))
                }
              )
            }
          )
        }

        if (username && username !== existingAdmin.username) {
          // Check if new username already exists
          db.get(
            'SELECT id FROM admins WHERE username = ? AND id != ?',
            [username, adminId],
            (err, duplicateAdmin) => {
              if (err) {
                resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
                return
              }

              if (duplicateAdmin) {
                resolve(NextResponse.json({ error: 'Username already exists' }, { status: 400 }))
                return
              }

              performUpdate()
            }
          )
        } else {
          performUpdate()
        }
      }
    )
  })
}

// DELETE /api/admin/accounts/[id] - Delete admin account
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = verifyAdminToken(request)
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  const { admin } = authResult
  const adminId = params.id

  // Check if current user has permission to delete admin accounts
  if (admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Only super admins can delete admin accounts' }, { status: 403 })
  }

  // Prevent self-deletion
  if (admin.adminId.toString() === adminId) {
    return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 })
  }

  return new Promise((resolve) => {
    // Check if admin exists
    db.get(
      'SELECT * FROM admins WHERE id = ?',
      [adminId],
      (err, existingAdmin: any) => {
        if (err) {
          resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
          return
        }

        if (!existingAdmin) {
          resolve(NextResponse.json({ error: 'Admin account not found' }, { status: 404 }))
          return
        }

        // Delete admin
        db.run(
          'DELETE FROM admins WHERE id = ?',
          [adminId],
          function(err) {
            if (err) {
              resolve(NextResponse.json({ error: 'Failed to delete admin account' }, { status: 500 }))
              return
            }

            resolve(NextResponse.json({
              message: 'Admin account deleted successfully',
              deletedAdmin: {
                id: existingAdmin.id,
                username: existingAdmin.username,
                role: existingAdmin.role
              }
            }))
          }
        )
      }
    )
  })
}
