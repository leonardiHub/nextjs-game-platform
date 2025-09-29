import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Mock database connection - replace with your actual database
// This should connect to the same database as server_enhanced.js
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(process.cwd(), 'game_platform.db')

function getDatabase() {
  return new sqlite3.Database(dbPath, (err: any) => {
    if (err) {
      console.error('Error connecting to database:', err)
    }
  })
}

// Helper function to verify admin token
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// GET - Get system settings
export async function GET(request: NextRequest) {
  try {
    // Verify admin permissions
    const adminUser = verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDatabase()

    return new Promise((resolve) => {
      db.all(
        'SELECT category, key, value FROM system_settings',
        [],
        (err: any, rows: any[]) => {
          db.close()
          
          if (err) {
            console.error('Database error:', err)
            resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
            return
          }

          // Organize settings data
          const settings = {
            wallet: {
              freeCreditAmount: 50,
              minBalanceThreshold: 0.1,
              withdrawalThreshold: 1000,
              withdrawalAmount: 50
            },
            security: {
              sessionTimeout: 30,
              maxLoginAttempts: 5,
              passwordMinLength: 6
            }
          }

          // Fill settings from database rows
          rows.forEach(row => {
            const { category, key, value } = row
            if (settings[category as keyof typeof settings]) {
              ;(settings[category as keyof typeof settings] as any)[key] = 
                isNaN(parseFloat(value)) ? value : parseFloat(value)
            }
          })

          resolve(NextResponse.json(settings))
        }
      )
    })
  } catch (error) {
    console.error('Error getting settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update system settings
export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions
    const adminUser = verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()
    const db = getDatabase()

    return new Promise((resolve) => {
      // Prepare update statements
      const updates: Array<{category: string, key: string, value: string}> = []
      
      // Wallet settings
      if (settings.wallet) {
        Object.entries(settings.wallet).forEach(([key, value]) => {
          updates.push({
            category: 'wallet',
            key,
            value: String(value)
          })
        })
      }


      // Security settings
      if (settings.security) {
        Object.entries(settings.security).forEach(([key, value]) => {
          updates.push({
            category: 'security',
            key,
            value: String(value)
          })
        })
      }

      // Batch update settings
      let completed = 0
      let hasError = false

      if (updates.length === 0) {
        db.close()
        resolve(NextResponse.json({ message: 'No settings to update' }))
        return
      }

      updates.forEach(update => {
        db.run(
          'INSERT OR REPLACE INTO system_settings (category, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
          [update.category, update.key, update.value],
          function(err: any) {
            if (err && !hasError) {
              hasError = true
              console.error('Database error:', err)
              db.close()
              resolve(NextResponse.json({ error: 'Database error' }, { status: 500 }))
              return
            }

            completed++
            if (completed === updates.length && !hasError) {
              db.close()
              resolve(NextResponse.json({ 
                message: 'Settings updated successfully',
                updatedCount: completed
              }))
            }
          }
        )
      })
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
