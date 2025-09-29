import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./game_platform.db')
const dbAll = promisify(db.all.bind(db)) as any
const dbGet = promisify(db.get.bind(db)) as any
const dbRun = promisify(db.run.bind(db)) as any

const JWT_SECRET = 'your-secret-key-change-in-production'

// Create games table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code INTEGER NOT NULL,
    game_uid TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    provider_id INTEGER NOT NULL,
    rtp REAL DEFAULT 96.0,
    status TEXT DEFAULT 'active',
    featured BOOLEAN DEFAULT 0,
    min_bet REAL DEFAULT 0.1,
    max_bet REAL DEFAULT 100.0,
    demo_url TEXT,
    thumbnail_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(provider_id) REFERENCES game_library_providers(id)
  )
`)

// Function to populate slot games data
function populateSlotGames() {
  db.run('DELETE FROM games', err => {
    if (err) {
      console.error('Error purging games:', err)
    } else {
      console.log('All existing games purged')

      // Get JILI provider ID first
      db.get(
        'SELECT id FROM game_library_providers WHERE code = ?',
        ['JILI'],
        (err, provider: any) => {
          if (!err && provider) {
            const slotGames = [
              {
                name: 'Mahjong Ways 2',
                code: 74,
                game_uid: 'ba2adf72179e1ead9e3dae8f0a7d4c07',
                type: 'Slot Game',
                rtp: 96.95,
                featured: 1,
              },
              {
                name: 'Treasures of Aztec',
                code: 87,
                game_uid: '2fa9a84d096d6ff0bab53f81b79876c8',
                type: 'Slot Game',
                rtp: 96.71,
                featured: 0,
              },
              {
                name: 'Lucky Neko',
                code: 89,
                game_uid: 'e1b4c6b95746d519228744771f15fe4b',
                type: 'Slot Game',
                rtp: 96.73,
                featured: 0,
              },
              {
                name: 'Fortune Ox',
                code: 98,
                game_uid: '8db4eb6d781f915eebab2a26133db0e9',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: 'Wild Bandito',
                code: 104,
                game_uid: '95fc290bb05c07b5aad1a054eba4dcc4',
                type: 'Slot Game',
                rtp: 96.73,
                featured: 0,
              },
              {
                name: 'Candy Bonanza',
                code: 100,
                game_uid: 'bbe2320adc5c506e7e56a2d24d96a252',
                type: 'Slot Game',
                rtp: 96.72,
                featured: 0,
              },
              {
                name: 'Galaxy Miner',
                code: 1918451,
                game_uid: 'fa4fe0c5a06d857bae0aaf727fc863f3',
                type: 'Slot Game',
                rtp: 96.77,
                featured: 0,
              },
              {
                name: "Dragon's Treasure Quest",
                code: 1897678,
                game_uid: '3a5aa3e08fc1ddb4ae99d2fb610174fe',
                type: 'Slot Game',
                rtp: 96.76,
                featured: 0,
              },
              {
                name: 'Diner Frenzy Spins',
                code: 1935269,
                game_uid: '458dc4c4a81223b3616329330009dc25',
                type: 'Slot Game',
                rtp: 96.8,
                featured: 0,
              },
              {
                name: 'Jack the Giant Hunter',
                code: 1834850,
                game_uid: '13109a0d9c012f7f92f192c34a8926bf',
                type: 'Slot Game',
                rtp: 96.8,
                featured: 0,
              },
              {
                name: "Dead Man's Riches",
                code: 1865521,
                game_uid: '20107ddd668c254f68b3a77219051801',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: 'Knockout Riches',
                code: 1881268,
                game_uid: '0f5374a4766f204a6420120dcfecd9e2',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: 'Doomsday Rampage',
                code: 1827457,
                game_uid: '52c57d366518d7b6e38e51ca20272584',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: 'Graffiti Rush',
                code: 1804577,
                game_uid: 'bfe3d243abaa1cc4b23d66909fbf6beb',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: "Mr. Treasure's Fortune",
                code: 1799745,
                game_uid: '8004c0cdbe396264d035b7a4aba58021',
                type: 'Slot Game',
                rtp: 96.71,
                featured: 0,
              },
              {
                name: 'Incan Wonders',
                code: 1850016,
                game_uid: 'b769cb768fa25699ddb695933bde781a',
                type: 'Slot Game',
                rtp: 96.74,
                featured: 0,
              },
              {
                name: 'Fortune Snake',
                code: 1879752,
                game_uid: '557babad95070382c94d184090133a72',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: "Geisha's Revenge",
                code: 1702123,
                game_uid: '9d9019d51ed9300035a4160d187b2a29',
                type: 'Slot Game',
                rtp: 96.81,
                featured: 0,
              },
              {
                name: 'Chocolate Deluxe',
                code: 1666445,
                game_uid: '5d6ec1ea66a6e374a6d618c7d4b814f7',
                type: 'Slot Game',
                rtp: 96.76,
                featured: 0,
              },
              {
                name: 'Rio Fantasia',
                code: 1786529,
                game_uid: 'dc242e2abfe13435226e9dbe8865c2ed',
                type: 'Slot Game',
                rtp: 96.76,
                featured: 0,
              },
              {
                name: 'Oishi Delights',
                code: 1815268,
                game_uid: '5af319aeb42d316100789fa1670ed869',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: 'Three Crazy Piggies',
                code: 1727711,
                game_uid: 'a197ff914cb04283a02da3b65d8ba705',
                type: 'Slot Game',
                rtp: 96.72,
                featured: 0,
              },
              {
                name: 'Wings of Iguazu',
                code: 1747549,
                game_uid: '6ae667b26f908e5ebe8976ca334fd472',
                type: 'Slot Game',
                rtp: 96.78,
                featured: 0,
              },
              {
                name: 'Yakuza Honor',
                code: 1760238,
                game_uid: 'e4772d4ef1de4217915c678d0d1722a8',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: 'Futebol Fever',
                code: 1778752,
                game_uid: '314afef87ff2974867234ac317b37f4c',
                type: 'Slot Game',
                rtp: 96.73,
                featured: 0,
              },
              {
                name: 'Chicky Run',
                code: 1738001,
                game_uid: 'c3e600005f72f1d1cabe758e206daf57',
                type: 'Gamble Game',
                rtp: 96.0,
                featured: 0,
              },
              {
                name: 'Zombie Outbreak',
                code: 1635221,
                game_uid: '83b6eceea77859c14426b05480b96c34',
                type: 'Slot Game',
                rtp: 96.76,
                featured: 0,
              },
              {
                name: 'Anubis Wrath',
                code: 1623475,
                game_uid: 'c268154a85669eea35aa46387834ac76',
                type: 'Slot Game',
                rtp: 96.75,
                featured: 0,
              },
              {
                name: 'Mystic Potion',
                code: 1717688,
                game_uid: 'e61bde75d590e943d2c5c6d432b29b46',
                type: 'Slot Game',
                rtp: 96.73,
                featured: 0,
              },
              {
                name: 'Fortune Dragon',
                code: 1695365,
                game_uid: 'c5435a8a73707a3a8bb4fe8baaaef3d2',
                type: 'Slot Game',
                rtp: 96.74,
                featured: 0,
              },
            ]

            slotGames.forEach(game => {
              db.run(
                `
              INSERT INTO games (name, code, game_uid, type, provider_id, rtp, featured, min_bet, max_bet) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
                [
                  game.name,
                  game.code,
                  game.game_uid,
                  game.type,
                  provider.id,
                  game.rtp,
                  game.featured,
                  0.1,
                  100,
                ]
              )
            })

            console.log(`Populated ${slotGames.length} slot games`)
          }
        }
      )
    }
  })
}

// Initialize with slot games on startup
populateSlotGames()

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

// GET - Retrieve all games with provider information
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const games = (await dbAll(`
      SELECT 
        g.*,
        p.name as provider_name,
        p.code as provider_code
      FROM games g
      LEFT JOIN game_library_providers p ON g.provider_id = p.id
      ORDER BY g.displaySequence ASC
    `)) as any[]

    return NextResponse.json({
      games: games.map(game => ({
        ...game,
        featured: Boolean(game.featured),
        displaySequence: game.displaySequence || null,
        created_at: game.created_at,
        updated_at: game.updated_at,
      })),
    })
  } catch (error) {
    console.error('Error getting games:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve games' },
      { status: 500 }
    )
  }
}

// PUT - Refresh games data (purge and repopulate)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Force refresh the games data
    populateSlotGames()

    return NextResponse.json({
      success: true,
      message: 'Games data refreshed successfully',
    })
  } catch (error) {
    console.error('Error refreshing games:', error)
    return NextResponse.json(
      { error: 'Failed to refresh games' },
      { status: 500 }
    )
  }
}

// POST - Create new game
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || !code || !game_uid || !type || !provider_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if game UID already exists
    const existingGame = (await dbGet(
      'SELECT id FROM games WHERE game_uid = ?',
      [game_uid]
    )) as any

    if (existingGame) {
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

    // Get next display sequence if not provided
    let finalDisplaySequence = displaySequence
    if (!finalDisplaySequence) {
      const maxSequence = await dbGet(
        'SELECT MAX(displaySequence) as maxSeq FROM games'
      )
      finalDisplaySequence = (maxSequence?.maxSeq || 0) + 1
    }

    // Insert new game
    const result = (await dbRun(
      `
      INSERT INTO games (
        name, code, game_uid, type, provider_id, rtp, status, featured, displaySequence,
        min_bet, max_bet, demo_url, thumbnail_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        code,
        game_uid,
        type,
        provider_id,
        rtp || 96.0,
        status || 'active',
        featured ? 1 : 0,
        finalDisplaySequence,
        min_bet || 0.1,
        max_bet || 100,
        demo_url,
        thumbnail_url,
      ]
    )) as any

    return NextResponse.json({
      success: true,
      id: result.lastID,
      message: 'Game created successfully',
    })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    )
  }
}
