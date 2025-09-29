import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

// Initialize database
const db = new sqlite3.Database('./game_platform.db')
const dbGet = promisify(db.get.bind(db))
const dbRun = promisify(db.run.bind(db))

// Create advertising_settings table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS advertising_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    settings TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Verify admin token
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.role === 'admin' || decoded.role === 'super_admin'
  } catch (error) {
    return false
  }
}

// GET - Retrieve advertising settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest advertising settings
    const result = await dbGet(
      'SELECT settings FROM advertising_settings ORDER BY updated_at DESC LIMIT 1'
    ) as any

    if (result) {
      const settings = JSON.parse(result.settings)
      return NextResponse.json({ settings })
    } else {
      // Return default settings if none exist
      const defaultSettings = {
        facebook: {
          pixelId: '',
          accessToken: '',
          conversionApiEnabled: false,
          testEventCode: '',
          events: {
            pageView: true,
            purchase: true,
            addToCart: true,
            initiateCheckout: true,
            completeRegistration: true,
            deposit: true,
            withdrawal: true
          }
        },
        google: {
          analyticsId: '',
          adsId: '',
          tagManagerId: '',
          conversionId: '',
          conversionLabel: '',
          enhancedConversions: false
        },
        tiktok: {
          pixelId: '',
          accessToken: '',
          eventsApiEnabled: false
        },
        tracking: {
          utmTracking: true,
          crossDomainTracking: false,
          userIdTracking: true,
          customDimensions: []
        }
      }
      return NextResponse.json({ settings: defaultSettings })
    }
  } catch (error) {
    console.error('Error getting advertising settings:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve advertising settings' },
      { status: 500 }
    )
  }
}

// POST - Save advertising settings
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()

    // Validate required structure
    if (!settings.facebook || !settings.google || !settings.tiktok || !settings.tracking) {
      return NextResponse.json(
        { error: 'Invalid settings structure' },
        { status: 400 }
      )
    }

    // Save settings to database
    await dbRun(
      'INSERT INTO advertising_settings (settings) VALUES (?)',
      [JSON.stringify(settings)]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Advertising settings saved successfully' 
    })
  } catch (error) {
    console.error('Error saving advertising settings:', error)
    return NextResponse.json(
      { error: 'Failed to save advertising settings' },
      { status: 500 }
    )
  }
}

// PUT - Update existing advertising settings
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()

    // Update the latest settings record
    await dbRun(
      'UPDATE advertising_settings SET settings = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT MAX(id) FROM advertising_settings)'
    , [JSON.stringify(settings)])

    return NextResponse.json({ 
      success: true, 
      message: 'Advertising settings updated successfully' 
    })
  } catch (error) {
    console.error('Error updating advertising settings:', error)
    return NextResponse.json(
      { error: 'Failed to update advertising settings' },
      { status: 500 }
    )
  }
}
