import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Database } from 'sqlite3'
import { promisify } from 'util'

const db = new Database('./game_platform.db')
const dbGet = promisify(db.get.bind(db))
const dbRun = promisify(db.run.bind(db))

const JWT_SECRET = 'your-secret-key-change-in-production'

function verifyAdmin(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.isAdmin === true
  } catch (error) {
    return false
  }
}

// POST - Migrate existing games from server_enhanced.js to database
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || !verifyAdmin(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get JILI provider ID
    const jiliProvider = await dbGet(
      'SELECT id FROM game_providers WHERE code = ?',
      ['JILI']
    ) as any

    if (!jiliProvider) {
      return NextResponse.json(
        { error: 'JILI provider not found. Please create providers first.' },
        { status: 400 }
      )
    }

    // Fish Games from server_enhanced.js
    const fishGames = [
      {
        name: 'Royal Fishing',
        game_uid: 'e794bf5717aca371152df192341fe68b',
        type: 'Fish Game',
        code: 1,
        rtp: 95.8
      },
      {
        name: 'Bombing Fishing',
        game_uid: 'e333695bcff28acdbecc641ae6ee2b23',
        type: 'Fish Game',
        code: 20,
        rtp: 95.5
      },
      {
        name: 'Dinosaur Tycoon',
        game_uid: 'eef3e28f0e3e7b72cbca61e7924d00f1',
        type: 'Fish Game',
        code: 42,
        rtp: 95.7
      },
      {
        name: 'Jackpot Fishing',
        game_uid: '3cf4a85cb6dcf4d8836c982c359cd72d',
        type: 'Fish Game',
        code: 32,
        rtp: 95.9
      },
      {
        name: 'Dragon Fortune',
        game_uid: '1200b82493e4788d038849bca884d773',
        type: 'Fish Game',
        code: 60,
        rtp: 95.6
      }
    ]

    // Slot Games from server_enhanced.js
    const slotGames = [
      { code: 74, name: 'Mahjong Ways 2', game_uid: 'ba2adf72179e1ead9e3dae8f0a7d4c07', type: 'Slot Game', rtp: 96.95 },
      { code: 87, name: 'Treasures of Aztec', game_uid: '2fa9a84d096d6ff0bab53f81b79876c8', type: 'Slot Game', rtp: 96.71 },
      { code: 89, name: 'Lucky Neko', game_uid: 'e1b4c6b95746d519228744771f15fe4b', type: 'Slot Game', rtp: 96.73 },
      { code: 98, name: 'Fortune Ox', game_uid: '8db4eb6d781f915eebab2a26133db0e9', type: 'Slot Game', rtp: 96.75 },
      { code: 104, name: 'Wild Bandito', game_uid: '95fc290bb05c07b5aad1a054eba4dcc4', type: 'Slot Game', rtp: 96.73 },
      { code: 100, name: 'Candy Bonanza', game_uid: 'bbe2320adc5c506e7e56a2d24d96a252', type: 'Slot Game', rtp: 96.72 },
      { code: 1918451, name: 'Galaxy Miner', game_uid: 'fa4fe0c5a06d857bae0aaf727fc863f3', type: 'Slot Game', rtp: 96.77 },
      { code: 1897678, name: "Dragon's Treasure Quest", game_uid: '3a5aa3e08fc1ddb4ae99d2fb610174fe', type: 'Slot Game', rtp: 96.76 },
      { code: 1935269, name: 'Diner Frenzy Spins', game_uid: '458dc4c4a81223b3616329330009dc25', type: 'Slot Game', rtp: 96.8 },
      { code: 1834850, name: 'Jack the Giant Hunter', game_uid: '13109a0d9c012f7f92f192c34a8926bf', type: 'Slot Game', rtp: 96.8 },
      { code: 1865521, name: "Dead Man's Riches", game_uid: '20107ddd668c254f68b3a77219051801', type: 'Slot Game', rtp: 96.75 },
      { code: 1881268, name: 'Knockout Riches', game_uid: '0f5374a4766f204a6420120dcfecd9e2', type: 'Slot Game', rtp: 96.75 },
      { code: 1827457, name: 'Doomsday Rampage', game_uid: '52c57d366518d7b6e38e51ca20272584', type: 'Slot Game', rtp: 96.75 },
      { code: 1804577, name: 'Graffiti Rush', game_uid: 'bfe3d243abaa1cc4b23d66909fbf6beb', type: 'Slot Game', rtp: 96.75 },
      { code: 1799745, name: 'Mr. Treasure\'s Fortune', game_uid: '8004c0cdbe396264d035b7a4aba58021', type: 'Slot Game', rtp: 96.71 },
      { code: 1850016, name: 'Incan Wonders', game_uid: 'b769cb768fa25699ddb695933bde781a', type: 'Slot Game', rtp: 96.74 },
      { code: 1879752, name: 'Fortune Snake', game_uid: '557babad95070382c94d184090133a72', type: 'Slot Game', rtp: 96.75 },
      { code: 1702123, name: "Geisha's Revenge", game_uid: '9d9019d51ed9300035a4160d187b2a29', type: 'Slot Game', rtp: 96.81 },
      { code: 1666445, name: 'Chocolate Deluxe', game_uid: '5d6ec1ea66a6e374a6d618c7d4b814f7', type: 'Slot Game', rtp: 96.76 },
      { code: 1786529, name: 'Rio Fantasia', game_uid: 'dc242e2abfe13435226e9dbe8865c2ed', type: 'Slot Game', rtp: 96.76 },
      { code: 1815268, name: 'Oishi Delights', game_uid: '5af319aeb42d316100789fa1670ed869', type: 'Slot Game', rtp: 96.75 },
      { code: 1727711, name: 'Three Crazy Piggies', game_uid: 'a197ff914cb04283a02da3b65d8ba705', type: 'Slot Game', rtp: 96.72 },
      { code: 1747549, name: 'Wings of Iguazu', game_uid: '6ae667b26f908e5ebe8976ca334fd472', type: 'Slot Game', rtp: 96.78 },
      { code: 1760238, name: 'Yakuza Honor', game_uid: 'e4772d4ef1de4217915c678d0d1722a8', type: 'Slot Game', rtp: 96.75 },
      { code: 1778752, name: 'Futebol Fever', game_uid: '314afef87ff2974867234ac317b37f4c', type: 'Slot Game', rtp: 96.73 },
      { code: 1738001, name: 'Chicky Run', game_uid: 'c3e600005f72f1d1cabe758e206daf57', type: 'Gamble Game', rtp: 96.0 },
      { code: 1635221, name: 'Zombie Outbreak', game_uid: '83b6eceea77859c14426b05480b96c34', type: 'Slot Game', rtp: 96.76 },
      { code: 1623475, name: 'Anubis Wrath', game_uid: 'c268154a85669eea35aa46387834ac76', type: 'Slot Game', rtp: 96.75 }
    ]

    // Combine all games
    const allGames = [...fishGames, ...slotGames]

    let migratedCount = 0
    let skippedCount = 0

    // Clear existing games first (optional - comment out if you want to keep existing)
    await dbRun('DELETE FROM games')

    // Insert games
    for (const game of allGames) {
      try {
        // Check if game already exists
        const existingGame = await dbGet(
          'SELECT id FROM games WHERE game_uid = ?',
          [game.game_uid]
        ) as any

        if (existingGame) {
          skippedCount++
          continue
        }

        // Determine if game should be featured (first 6 games)
        const featured = migratedCount < 6 ? 1 : 0

        // Insert game
        await dbRun(`
          INSERT INTO games (
            name, code, game_uid, type, provider_id, rtp, status, featured,
            min_bet, max_bet, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          game.name,
          game.code,
          game.game_uid,
          game.type,
          jiliProvider.id,
          game.rtp,
          'active',
          featured,
          0.1, // min_bet
          100  // max_bet
        ])

        migratedCount++
      } catch (error) {
        console.error(`Error migrating game ${game.name}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${migratedCount} games migrated, ${skippedCount} games skipped.`,
      migrated: migratedCount,
      skipped: skippedCount,
      total: allGames.length
    })
  } catch (error) {
    console.error('Error migrating games:', error)
    return NextResponse.json(
      { error: 'Failed to migrate games' },
      { status: 500 }
    )
  }
}
