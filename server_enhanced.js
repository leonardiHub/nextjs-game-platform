const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const crypto = require('crypto')
const CryptoJS = require('crypto-js')
const axios = require('axios')
const path = require('path')
const multer = require('multer')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 5001

// Game API Configuration
const GAME_CONFIG = {
  agency_uid: '8dee1e401b87408cca3ca813c2250cb4',
  aes_key: '68b074393ec7c5a975856a90bd6fdf47',
  player_prefix: 'fun88',
  server_url: 'https://jsgame.live',
  initial_credit: 50,
}

const JWT_SECRET = 'fun88-secret-key-change-in-production'

// Public Domain Configuration
const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN || 'https://api-staging.4d99.co'

// Wallet Rules
const WALLET_RULES = {
  FREE_CREDIT_AMOUNT: 50.0,
  MIN_BALANCE_THRESHOLD: 0.1,
  WITHDRAWAL_THRESHOLD: 1000.0,
  WITHDRAWAL_AMOUNT: 50.0,
}

// Ensure directories exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}
if (!fs.existsSync('uploads/kyc')) {
  fs.mkdirSync('uploads/kyc')
}
if (!fs.existsSync('uploads/media')) {
  fs.mkdirSync('uploads/media')
}
if (!fs.existsSync('uploads/media/images')) {
  fs.mkdirSync('uploads/media/images')
}
if (!fs.existsSync('uploads/media/thumbnails')) {
  fs.mkdirSync('uploads/media/thumbnails')
}
if (!fs.existsSync('uploads/media/videos')) {
  fs.mkdirSync('uploads/media/videos')
}
if (!fs.existsSync('uploads/media/documents')) {
  fs.mkdirSync('uploads/media/documents')
}

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/kyc/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    )
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG and PDF files are allowed'))
    }
  },
})

// Media file upload configuration
const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/media/'

    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/'
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/'
    } else {
      uploadPath += 'documents/'
    }

    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, uniqueSuffix + '-' + sanitizedName)
  },
})

const mediaUpload = multer({
  storage: mediaStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for media files
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|pdf|doc|docx|txt/
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype =
      /^(image|video|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|text\/plain)/.test(
        file.mimetype
      )

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(
        new Error(
          'File type not supported. Allowed: images, videos, PDF, DOC, DOCX, TXT'
        )
      )
    }
  },
})

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// JSON error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message)
    console.error('Request URL:', req.url)
    console.error('Request method:', req.method)
    console.error('Request headers:', req.headers)
    return res
      .status(400)
      .json({ error: 'Invalid JSON format in request body' })
  }
  next(error)
})

// Serve static files first
app.use(express.static('public'))

// Serve uploads with proper nested structure - more specific routes first
app.use(
  '/uploads/media/images',
  express.static(path.join(__dirname, 'uploads/media/images'))
)
app.use(
  '/uploads/media/videos',
  express.static(path.join(__dirname, 'uploads/media/videos'))
)
app.use(
  '/uploads/media/documents',
  express.static(path.join(__dirname, 'uploads/media/documents'))
)
app.use('/uploads/media', express.static(path.join(__dirname, 'uploads/media')))
app.use('/uploads/kyc', express.static(path.join(__dirname, 'uploads/kyc')))
app.use('/uploads', express.static('uploads'))

// Serve Next.js static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve Next.js static files
  app.use('/_next', express.static(path.join(__dirname, '.next')))
  app.use('/static', express.static(path.join(__dirname, '.next/static')))
}

// Add headers for iframe embedding
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'SAMEORIGIN')
  res.header('Content-Security-Policy', "frame-ancestors 'self' *")
  next()
})

// Initialize SQLite Database with better error handling
const db = new sqlite3.Database('fun88_standalone.db', err => {
  if (err) {
    console.error('❌ Database connection error:', err.message)
  } else {
    console.log('✅ Connected to SQLite database successfully')
    // Enable WAL mode for better concurrency
    db.run('PRAGMA journal_mode=WAL;')
    db.run('PRAGMA synchronous=NORMAL;')
    db.run('PRAGMA cache_size=10000;')
    db.run('PRAGMA temp_store=memory;')
  }
})

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    game_account TEXT UNIQUE NOT NULL,
    balance REAL DEFAULT 50.0,
    free_credit REAL DEFAULT 50.0,
    total_wagered REAL DEFAULT 0.0,
    total_won REAL DEFAULT 0.0,
    can_withdraw BOOLEAN DEFAULT 0,
    kyc_status TEXT DEFAULT 'pending',
    kyc_documents TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    game_uid TEXT,
    session_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS game_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    transaction_type TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_before REAL NOT NULL,
    balance_after REAL NOT NULL,
    game_uid TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    bank_details TEXT,
    admin_notes TEXT,
    attachments TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS kyc_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, key)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS captcha_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  )`)

  // Content Management Tables
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER,
    color TEXT DEFAULT '#3B82F6',
    post_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#10B981',
    post_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS media_folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES media_folders (id) ON DELETE SET NULL
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    folder_id INTEGER,
    uploaded_by TEXT NOT NULL,
    alt_text TEXT,
    description TEXT,
    width INTEGER,
    height INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES media_folders (id) ON DELETE SET NULL
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_id INTEGER,
    author TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    category_id INTEGER,
    views INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    published_at DATETIME,
    scheduled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    FOREIGN KEY (featured_image_id) REFERENCES media_files (id) ON DELETE SET NULL
  )`)

  // Add scheduled_at column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE blogs ADD COLUMN scheduled_at DATETIME`, err => {
    // Ignore error if column already exists
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding scheduled_at column:', err)
    }
  })

  db.run(`CREATE TABLE IF NOT EXISTS blog_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
    UNIQUE(blog_id, tag_id)
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_path TEXT UNIQUE,
    page_title TEXT,
    meta_title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    schema_markup TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image TEXT,
    robots_meta TEXT DEFAULT 'index, follow',
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Create global SEO settings table
  db.run(`CREATE TABLE IF NOT EXISTS global_seo_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT DEFAULT '99Group Gaming Platform',
    default_meta_title TEXT DEFAULT '99Group - Premium Gaming Platform',
    default_meta_description TEXT DEFAULT 'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
    default_og_image TEXT DEFAULT '/images/og-default.jpg',
    favicon_url TEXT DEFAULT '/favicon.ico',
    robots_txt TEXT DEFAULT 'User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://99group.games/sitemap.xml',
    sitemap_url TEXT DEFAULT '/sitemap.xml',
    google_analytics_id TEXT DEFAULT '',
    google_search_console_id TEXT DEFAULT '',
    twitter_site TEXT DEFAULT '@99group',
    header_code TEXT DEFAULT '',
    body_code TEXT DEFAULT '',
    footer_code TEXT DEFAULT '',
    default_canonical_url TEXT DEFAULT '',
    default_robots_meta TEXT DEFAULT 'index, follow',
    default_keywords TEXT DEFAULT '',
    default_schema_markup TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Add new columns to existing global_seo_settings table if they don't exist
  db.run(
    `ALTER TABLE global_seo_settings ADD COLUMN default_canonical_url TEXT DEFAULT ''`,
    err => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding default_canonical_url column:', err)
      }
    }
  )

  db.run(
    `ALTER TABLE global_seo_settings ADD COLUMN default_robots_meta TEXT DEFAULT 'index, follow'`,
    err => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding default_robots_meta column:', err)
      }
    }
  )

  db.run(
    `ALTER TABLE global_seo_settings ADD COLUMN default_keywords TEXT DEFAULT ''`,
    err => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding default_keywords column:', err)
      }
    }
  )

  db.run(
    `ALTER TABLE global_seo_settings ADD COLUMN default_schema_markup TEXT DEFAULT ''`,
    err => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding default_schema_markup column:', err)
      }
    }
  )

  // Create default admin account
  db.get('SELECT COUNT(*) as count FROM admins', [], (err, row) => {
    if (!err && row.count === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10)
      db.run(`INSERT INTO admins (username, password, role) VALUES (?, ?, ?)`, [
        'admin',
        hashedPassword,
        'super_admin',
      ])
      console.log('Default admin account created: admin/admin123')
    }
  })

  // Create default global SEO settings
  db.get(
    'SELECT COUNT(*) as count FROM global_seo_settings',
    [],
    (err, row) => {
      if (!err && row.count === 0) {
        db.run(
          `INSERT INTO global_seo_settings (
          site_name, default_meta_title, default_meta_description, 
          default_og_image, favicon_url, twitter_site, robots_txt, sitemap_url,
          default_canonical_url, default_robots_meta, default_keywords, default_schema_markup
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            '99Group Gaming Platform',
            '99Group - Premium Gaming Platform',
            'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
            '/images/og-default.jpg',
            '/favicon.ico',
            '@99group',
            `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://99group.games/sitemap.xml`,
            '/sitemap.xml',
            '',
            'index, follow',
            'gaming, casino, online games, 99group, free credits',
            JSON.stringify(
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: '99Group Gaming Platform',
                url: 'https://99group.games',
                description:
                  'Premium online gaming platform with free credits and secure gaming environment',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://99group.games/search?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
              null,
              2
            ),
          ]
        )
        console.log('Default global SEO settings created')
      }
    }
  )

  // Initialize default system settings
  db.get('SELECT COUNT(*) as count FROM system_settings', [], (err, row) => {
    if (!err && row.count === 0) {
      const defaultSettings = [
        ['wallet', 'initialBalance', '50.0'],
        ['wallet', 'freeCreditAmount', '50.0'],
        ['wallet', 'minBalanceThreshold', '0.1'],
        ['wallet', 'withdrawalThreshold', '1000.0'],
        ['wallet', 'withdrawalAmount', '50.0'],
        ['security', 'sessionTimeout', '30'],
        ['security', 'maxLoginAttempts', '5'],
        ['security', 'passwordMinLength', '6'],
        ['game', 'apiUrl', 'https://jsgame.live'],
        ['game', 'agencyUid', '45370b4f27dfc8a2875ba78d07e8a81a'],
        ['game', 'playerPrefix', 'h4944d'],
        ['game', 'aesKey', '08970240475e1255d2b4ac023ac658f3'],
      ]

      const stmt = db.prepare(
        'INSERT OR REPLACE INTO system_settings (category, key, value) VALUES (?, ?, ?)'
      )
      defaultSettings.forEach(setting => {
        stmt.run(setting)
      })
      stmt.finalize()
      console.log('Default system settings initialized')
    }
  })
})

// AES Encryption/Decryption functions
function aesEncrypt(text, key) {
  const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

function aesDecrypt(encryptedText, key) {
  const decrypted = CryptoJS.AES.decrypt(
    encryptedText,
    CryptoJS.enc.Utf8.parse(key),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }
  )
  return decrypted.toString(CryptoJS.enc.Utf8)
}

// Demo game URL fallback function
function getDemoGameUrl(gameType, gameUid) {
  const demoUrls = {
    'Fish Game': {
      e794bf5717aca371152df192341fe68b:
        'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20goldfever&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      e333695bcff28acdbecc641ae6ee2b23:
        'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fishprize&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      default:
        'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20goldfever&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
    },
    'Slot Game': {
      '24da72b49b0dd0e5cbef9579d09d8981':
        'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      '4b1d7ffaf9f66e6152ea93a6d0e4215b':
        'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      default:
        'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
    },
  }

  const typeUrls = demoUrls[gameType] || demoUrls['Slot Game']
  return typeUrls[gameUid] || typeUrls.default
}

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Admin JWT Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Admin access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err || !admin.isAdmin) {
      return res.status(403).json({ error: 'Invalid admin token' })
    }
    req.admin = admin
    next()
  })
}

// Helper function to record game transaction
function recordTransaction(
  userId,
  type,
  amount,
  balanceBefore,
  balanceAfter,
  gameUid = null,
  description = ''
) {
  db.run(
    `INSERT INTO game_transactions (user_id, transaction_type, amount, balance_before, balance_after, game_uid, description) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, amount, balanceBefore, balanceAfter, gameUid, description]
  )
}

// Universal Game Provider Balance Query Response Format
function getProviderSpecificResponse(provider, user, playerAccount) {
  const balance = user.balance

  // 通用标准格式 - 包含所有提供商可能需要的字段
  const universalResponse = {
    // 玩家账户 (多种命名方式)
    player_account: playerAccount, // 标准格式
    accountName: playerAccount, // JILI格式
    username: playerAccount, // PG格式
    user_id: playerAccount, // PP格式
    userId: playerAccount, // NetEnt格式
    playerId: playerAccount, // Evolution格式
    PlayerId: playerAccount, // Microgaming格式

    // 余额信息 (多种格式和精度)
    balance: parseFloat(balance.toFixed(2)), // 标准美元格式
    Balance: parseFloat(balance.toFixed(2)), // 大写格式

    // 货币
    currency: 'USD',
    Currency: 'USD', // 大写格式

    // 状态 (多种格式)
    status: 0, // 数字状态 (JILI)
    success: true, // 布尔状态
    result: 'OK', // 字符串状态
    active: true, // 活跃状态

    // 错误处理 (多种格式)
    errorCode: 0, // 标准错误代码
    error_code: 0, // 下划线格式
    ErrorCode: 0, // 大写格式
    errorMessage: 'Success', // 错误消息
    ErrorDescription: 'Success', // Microgaming格式
    error: null, // 错误对象
    message: 'Success', // 通用消息

    // 时间戳
    timestamp: Date.now(),
  }

  // 提供商特定的微调
  switch (provider.toUpperCase()) {
    case 'JILI':
      // JILI使用数字状态码
      universalResponse.status = 0
      break

    case 'PG':
    case 'PRAGMATIC':
      // Pragmatic使用字符串状态
      universalResponse.status = 'success'
      break

    case 'EVOLUTION':
      // Evolution需要更高精度
      universalResponse.balance = parseFloat(balance.toFixed(4))
      universalResponse.Balance = parseFloat(balance.toFixed(4))
      universalResponse.status = 'OK'
      break

    case 'NETENT':
      // NetEnt使用大写状态
      universalResponse.status = 'SUCCESS'
      break

    default:
      // 保持通用格式，适用于大多数提供商
      break
  }

  console.log(`📤 Universal balance response for ${provider}:`, {
    player_account: playerAccount,
    balance: universalResponse.balance,
    status: universalResponse.status,
  })

  return universalResponse
}

// Universal Game Provider Callback Response Format
function getProviderCallbackResponse(provider, balance, transactionId) {
  // 通用标准格式 - 包含所有提供商可能需要的字段
  const universalResponse = {
    // 核心成功状态 (多种格式支持)
    status: 0, // 数字状态码 (0 = 成功)
    success: true, // 布尔成功标志
    result: 'OK', // 字符串结果状态
    response: 'OK', // 响应状态

    // 余额信息 (多种格式)
    balance: parseFloat(balance.toFixed(2)), // 标准美元格式
    Balance: parseFloat(balance.toFixed(2)), // 大写格式 (Microgaming)
    currency: 'USD', // 货币类型

    // 交易ID (多种命名方式)
    transaction_id: transactionId, // 标准格式
    txn_id: transactionId, // PG格式
    transactionId: transactionId, // 驼峰格式
    TransactionId: transactionId, // 大写格式

    // 错误处理 (多种格式)
    errorCode: 0, // 标准错误代码
    error_code: 0, // 下划线格式
    ErrorCode: 0, // 大写格式
    errorMessage: 'Success', // 错误消息
    ErrorDescription: 'Success', // Microgaming格式
    error: null, // 错误对象
    message: 'Success', // 通用消息

    // 时间戳
    timestamp: Date.now(), // Unix时间戳

    // 通用代码和消息
    code: 0, // 通用代码
    msg: 'Success', // 简短消息
  }

  // 提供商特定的微调 (如果需要)
  switch (provider.toUpperCase()) {
    case 'JILI':
      // JILI可能需要特定字段
      universalResponse.accountName = transactionId
      break

    case 'EVOLUTION':
      // Evolution可能需要更高精度
      universalResponse.balance = parseFloat(balance.toFixed(4))
      universalResponse.Balance = parseFloat(balance.toFixed(4))
      break

    case 'NETENT':
      // NetEnt使用大写状态
      universalResponse.status = 'SUCCESS'
      break

    default:
      // 保持通用格式，适用于大多数提供商
      break
  }

  console.log(`📤 Universal callback response for ${provider}:`, {
    balance: universalResponse.balance,
    status: universalResponse.status,
    success: universalResponse.success,
    transaction_id: universalResponse.transaction_id,
  })

  return universalResponse
}

// Helper function to get system settings
function getSystemSettings(callback) {
  db.all(
    'SELECT category, key, value FROM system_settings',
    [],
    (err, rows) => {
      if (err) {
        return callback(err, null)
      }

      const settings = {
        wallet: {},
        game: {},
      }

      rows.forEach(row => {
        if (!settings[row.category]) {
          settings[row.category] = {}
        }
        settings[row.category][row.key] = row.value
      })

      callback(null, settings)
    }
  )
}

// Helper function to update system setting
function updateSystemSetting(category, key, value, callback) {
  db.run(
    'INSERT OR REPLACE INTO system_settings (category, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [category, key, value],
    callback
  )
}

// Captcha helper functions
function generateCaptchaCode() {
  // Generate 4-digit numeric captcha
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function storeCaptcha(sessionId, code, callback) {
  // Clean up expired captchas first
  db.run(
    'DELETE FROM captcha_codes WHERE expires_at < CURRENT_TIMESTAMP',
    [],
    err => {
      if (err) {
        console.error('Error cleaning up captchas:', err)
      }
    }
  )

  // Store new captcha (expires in 5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  db.run(
    'INSERT INTO captcha_codes (session_id, code, expires_at) VALUES (?, ?, ?)',
    [sessionId, code, expiresAt],
    callback
  )
}

function verifyCaptcha(sessionId, userCode, callback) {
  db.get(
    'SELECT code FROM captcha_codes WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1',
    [sessionId],
    (err, row) => {
      if (err) {
        return callback(err, false)
      }

      if (!row || row.code !== userCode) {
        return callback(null, false)
      }

      // Delete used captcha
      db.run(
        'DELETE FROM captcha_codes WHERE session_id = ?',
        [sessionId],
        deleteErr => {
          if (deleteErr) {
            console.error('Error deleting used captcha:', deleteErr)
          }
        }
      )

      callback(null, true)
    }
  )
}

// Helper function to check and update wallet rules
function checkWalletRules(userId, newBalance, callback) {
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) return callback(err)

    let updateFields = []
    let updateValues = []

    getSystemSettings((settingsErr, settings) => {
      if (settingsErr) return callback(settingsErr)

      const minBalanceThreshold = parseFloat(
        settings.wallet.minBalanceThreshold || '0.1'
      )
      const withdrawalThreshold = parseFloat(
        settings.wallet.withdrawalThreshold || '1000.0'
      )

      // Check if balance falls below threshold - clear all balance
      if (newBalance <= minBalanceThreshold) {
        updateFields.push('free_credit = 0')
        updateFields.push('balance = 0')
        recordTransaction(
          userId,
          'BURN',
          user.balance,
          user.balance,
          0,
          null,
          'Balance cleared - fell below minimum threshold'
        )
        newBalance = 0
      }

      // Check if total balance reaches withdrawal threshold
      if (newBalance >= withdrawalThreshold && !user.can_withdraw) {
        updateFields.push('can_withdraw = 1')
      }

      if (updateFields.length > 0) {
        updateFields.push('balance = ?')
        updateValues.push(newBalance)
        updateValues.push(userId)

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
        db.run(sql, updateValues, callback)
      } else {
        db.run(
          `UPDATE users SET balance = ? WHERE id = ?`,
          [newBalance, userId],
          callback
        )
      }
    })
  })
}

// Generate Captcha
app.get('/api/captcha/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId

  if (!sessionId || sessionId.length < 10) {
    return res.status(400).json({ error: 'Invalid session ID' })
  }

  const captchaCode = generateCaptchaCode()

  storeCaptcha(sessionId, captchaCode, err => {
    if (err) {
      console.error('Error storing captcha:', err)
      return res.status(500).json({ error: 'Failed to generate captcha' })
    }

    // Create simple SVG captcha
    const svg = `
      <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" fill="#f0f0f0" stroke="#ddd"/>
        <text x="60" y="25" font-family="Arial, sans-serif" font-size="18" 
              font-weight="bold" text-anchor="middle" fill="#333">${captchaCode}</text>
        <line x1="10" y1="15" x2="110" y2="25" stroke="#ccc" stroke-width="1"/>
        <line x1="20" y1="30" x2="100" y2="10" stroke="#ccc" stroke-width="1"/>
      </svg>
    `

    res.setHeader('Content-Type', 'image/svg+xml')
    res.send(svg)
  })
})

// User Registration
app.post('/api/register', (req, res) => {
  const { full_name, username, password, captcha, session_id } = req.body

  if (!full_name || !username || !password || !captcha || !session_id) {
    return res.status(400).json({
      error:
        'Full name, username, password, captcha, and session ID are required',
    })
  }

  if (full_name.trim().length < 2) {
    return res
      .status(400)
      .json({ error: 'Full name must be at least 2 characters long' })
  }

  if (username.trim().length < 3) {
    return res
      .status(400)
      .json({ error: 'Username must be at least 3 characters long' })
  }

  if (password.trim().length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters long' })
  }

  // Verify captcha first
  verifyCaptcha(session_id, captcha, (captchaErr, isValid) => {
    if (captchaErr) {
      console.error('Captcha verification error:', captchaErr)
      return res.status(500).json({ error: 'Captcha verification failed' })
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired captcha' })
    }

    // Get current system settings for wallet
    getSystemSettings((err, settings) => {
      if (err) {
        console.error('Error getting system settings:', err)
        return res.status(500).json({ error: 'Registration failed' })
      }

      const initialBalance = parseFloat(
        settings.wallet.initialBalance || '50.0'
      )
      const freeCreditAmount = parseFloat(
        settings.wallet.freeCreditAmount || '50.0'
      )
      const playerPrefix =
        settings.game.playerPrefix || GAME_CONFIG.player_prefix

      // Hash the user's password
      const hashedPassword = bcrypt.hashSync(password.trim(), 10)
      const gameAccount = playerPrefix + Date.now()

      db.run(
        'INSERT INTO users (full_name, username, password, game_account, balance, free_credit) VALUES (?, ?, ?, ?, ?, ?)',
        [
          full_name.trim(),
          username.trim(),
          hashedPassword,
          gameAccount,
          initialBalance,
          freeCreditAmount,
        ],
        function (err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              return res.status(400).json({ error: 'Username already exists' })
            }
            return res.status(500).json({ error: 'Registration failed' })
          }

          const userId = this.lastID

          // Record initial credit transaction
          recordTransaction(
            userId,
            'CREDIT',
            freeCreditAmount,
            0,
            freeCreditAmount,
            null,
            'Initial free credit'
          )

          // Generate JWT token for immediate login
          const token = jwt.sign(
            { userId, username: username.trim() },
            JWT_SECRET,
            { expiresIn: '7d' }
          )

          res.status(201).json({
            message: 'Registration successful! You are now logged in.',
            token: token,
            user: {
              id: userId,
              full_name: full_name.trim(),
              username: username.trim(),
              gameAccount: gameAccount,
            },
            initialCredit: freeCreditAmount,
            initialBalance: initialBalance,
            temporaryPassword: password.trim(), // Send this so user knows their password
          })
        }
      )
    })
  })
})

// User Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        free_credit: user.free_credit,
        can_withdraw: user.can_withdraw,
        kyc_status: user.kyc_status,
      },
    })
  })
})

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  db.get(
    'SELECT * FROM admins WHERE username = ?',
    [username],
    (err, admin) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ error: 'Invalid admin credentials' })
      }

      const token = jwt.sign(
        {
          adminId: admin.id,
          username: admin.username,
          role: admin.role,
          isAdmin: true,
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      )

      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
        },
      })
    }
  )
})

// Admin Account Management APIs

// Get all admin accounts
app.get('/api/admin/accounts', authenticateAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const search = req.query.search || ''
  const offset = (page - 1) * limit

  let whereClause = ''
  let params = []

  if (search) {
    whereClause = 'WHERE username LIKE ? OR role LIKE ?'
    params = [`%${search}%`, `%${search}%`]
  }

  // Get total count
  db.get(
    `SELECT COUNT(*) as total FROM admins ${whereClause}`,
    params,
    (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
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
            return res.status(500).json({ error: 'Database error' })
          }

          res.json({
            admins,
            pagination: {
              page,
              limit,
              total: countResult.total,
              totalPages: Math.ceil(countResult.total / limit),
            },
          })
        }
      )
    }
  )
})

// Get single admin account
app.get('/api/admin/accounts/:id', authenticateAdmin, (req, res) => {
  const adminId = req.params.id

  db.get(
    'SELECT id, username, role, created_at FROM admins WHERE id = ?',
    [adminId],
    (err, admin) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!admin) {
        return res.status(404).json({ error: 'Admin account not found' })
      }

      res.json({ admin })
    }
  )
})

// Create new admin account
app.post('/api/admin/accounts', authenticateAdmin, (req, res) => {
  const { username, password, role } = req.body

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters long' })
  }

  const validRoles = ['admin', 'super_admin', 'moderator']
  if (role && !validRoles.includes(role)) {
    return res
      .status(400)
      .json({ error: 'Invalid role. Must be admin, super_admin, or moderator' })
  }

  // Check if current user has permission to create admin accounts
  if (req.admin.role !== 'super_admin') {
    return res
      .status(403)
      .json({ error: 'Only super admins can create new admin accounts' })
  }

  // Check if username already exists
  db.get(
    'SELECT id FROM admins WHERE username = ?',
    [username],
    (err, existingAdmin) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (existingAdmin) {
        return res.status(400).json({ error: 'Username already exists' })
      }

      // Hash password and create admin
      const hashedPassword = bcrypt.hashSync(password, 10)
      const adminRole = role || 'admin'

      db.run(
        'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, adminRole],
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Failed to create admin account' })
          }

          // Return created admin (without password)
          db.get(
            'SELECT id, username, role, created_at FROM admins WHERE id = ?',
            [this.lastID],
            (err, newAdmin) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: 'Failed to retrieve created admin' })
              }

              res.status(201).json({
                message: 'Admin account created successfully',
                admin: newAdmin,
              })
            }
          )
        }
      )
    }
  )
})

// Update admin account
app.put('/api/admin/accounts/:id', authenticateAdmin, (req, res) => {
  const adminId = req.params.id
  const { username, password, role } = req.body

  // Check if current user has permission to update admin accounts
  if (
    req.admin.role !== 'super_admin' &&
    req.admin.adminId.toString() !== adminId
  ) {
    return res.status(403).json({
      error:
        'You can only update your own account or you must be a super admin',
    })
  }

  // Validate role if provided
  const validRoles = ['admin', 'super_admin', 'moderator']
  if (role && !validRoles.includes(role)) {
    return res
      .status(400)
      .json({ error: 'Invalid role. Must be admin, super_admin, or moderator' })
  }

  // Only super admins can change roles
  if (role && req.admin.role !== 'super_admin') {
    return res
      .status(403)
      .json({ error: 'Only super admins can change user roles' })
  }

  // Check if admin exists
  db.get('SELECT * FROM admins WHERE id = ?', [adminId], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' })
    }

    // Prepare update fields
    const updates = []
    const params = []

    if (username && username !== admin.username) {
      // Check if new username already exists
      db.get(
        'SELECT id FROM admins WHERE username = ? AND id != ?',
        [username, adminId],
        (err, existingAdmin) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (existingAdmin) {
            return res.status(400).json({ error: 'Username already exists' })
          }

          // Continue with update
          performUpdate()
        }
      )
      return
    }

    performUpdate()

    function performUpdate() {
      if (username) {
        updates.push('username = ?')
        params.push(username)
      }

      if (password) {
        if (password.length < 6) {
          return res
            .status(400)
            .json({ error: 'Password must be at least 6 characters long' })
        }
        updates.push('password = ?')
        params.push(bcrypt.hashSync(password, 10))
      }

      if (role) {
        updates.push('role = ?')
        params.push(role)
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      params.push(adminId)

      db.run(
        `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`,
        params,
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Failed to update admin account' })
          }

          // Return updated admin (without password)
          db.get(
            'SELECT id, username, role, created_at FROM admins WHERE id = ?',
            [adminId],
            (err, updatedAdmin) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: 'Failed to retrieve updated admin' })
              }

              res.json({
                message: 'Admin account updated successfully',
                admin: updatedAdmin,
              })
            }
          )
        }
      )
    }
  })
})

// Delete admin account
app.delete('/api/admin/accounts/:id', authenticateAdmin, (req, res) => {
  const adminId = req.params.id

  // Check if current user has permission to delete admin accounts
  if (req.admin.role !== 'super_admin') {
    return res
      .status(403)
      .json({ error: 'Only super admins can delete admin accounts' })
  }

  // Prevent self-deletion
  if (req.admin.adminId.toString() === adminId) {
    return res
      .status(400)
      .json({ error: 'You cannot delete your own admin account' })
  }

  // Check if admin exists
  db.get('SELECT * FROM admins WHERE id = ?', [adminId], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' })
    }

    // Delete admin
    db.run('DELETE FROM admins WHERE id = ?', [adminId], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete admin account' })
      }

      res.json({
        message: 'Admin account deleted successfully',
        deletedAdmin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
        },
      })
    })
  })
})

// Get User Profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, game_account, balance, free_credit, total_wagered, total_won, can_withdraw, kyc_status, created_at FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({ user })
    }
  )
})

// Get User Balance
app.get('/api/balance', authenticateToken, (req, res) => {
  db.get(
    'SELECT balance, free_credit, can_withdraw FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      getSystemSettings((settingsErr, settings) => {
        if (settingsErr) {
          return res
            .status(500)
            .json({ error: 'Failed to get system settings' })
        }

        res.json({
          balance: user.balance,
          free_credit: user.free_credit,
          can_withdraw: user.can_withdraw,
          withdrawal_threshold: parseFloat(
            settings.wallet.withdrawalThreshold || '1000.0'
          ),
          withdrawal_amount: parseFloat(
            settings.wallet.withdrawalAmount || '50.0'
          ),
        })
      })
    }
  )
})

// Launch Game
app.post('/api/game/launch', authenticateToken, async (req, res) => {
  const { game_uid } = req.body

  if (!game_uid) {
    return res.status(400).json({ error: 'game_uid is required' })
  }

  db.get(
    'SELECT * FROM users WHERE id = ?',
    [req.user.userId],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Check minimum balance requirement (must be above wallet clear threshold)
      const MIN_GAME_BALANCE = 0.1 // $0.1 minimum to play (below this amount wallet gets cleared)
      if (user.balance < MIN_GAME_BALANCE) {
        return res.status(400).json({
          error: 'Insufficient balance',
          message: `Minimum balance of $${MIN_GAME_BALANCE} required to play games. Current balance: $${user.balance.toFixed(2)}`,
          current_balance: user.balance,
          required_balance: MIN_GAME_BALANCE,
        })
      }

      const timestamp = Date.now().toString()

      try {
        // Convert balance to cents for some game providers
        const balanceInCents = Math.floor(user.balance * 100)

        const payloadData = {
          timestamp: timestamp,
          agency_uid: GAME_CONFIG.agency_uid,
          member_account: user.game_account,
          game_uid: game_uid,
          credit_amount: user.balance.toFixed(2), // Ensure 2 decimal places
          currency_code: 'USD',
          language: 'en',
          home_url: PUBLIC_DOMAIN,
          platform: 1,
          callback_url: `${PUBLIC_DOMAIN}/api/game/callback`,
          balance_url: `${PUBLIC_DOMAIN}/api/game/balance`,
          wallet_url: `${PUBLIC_DOMAIN}/api/game/wallet`,
        }

        console.log(
          'User balance:',
          user.balance,
          'Credit amount:',
          payloadData.credit_amount
        )

        const payloadString = JSON.stringify(payloadData)
        const encryptedPayload = aesEncrypt(payloadString, GAME_CONFIG.aes_key)

        const requestData = {
          agency_uid: GAME_CONFIG.agency_uid,
          timestamp: timestamp,
          payload: encryptedPayload,
        }

        console.log('Game launch request:', requestData)

        const response = await axios.post(
          `${GAME_CONFIG.server_url}/game/v1`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        )

        console.log('Game API Response:', response.data)

        if (
          response.data.code === 0 &&
          response.data.payload &&
          response.data.payload.game_launch_url
        ) {
          // Save game session
          db.run(
            'INSERT INTO game_sessions (user_id, game_uid, session_token) VALUES (?, ?, ?)',
            [user.id, game_uid, timestamp]
          )

          res.json({
            success: true,
            game_url: response.data.payload.game_launch_url,
            session_token: timestamp,
          })
        } else {
          throw new Error('Invalid API response')
        }
      } catch (error) {
        console.error('Game launch error:', error.message)

        // Fallback to demo game
        const gameInfo = getGameInfo(game_uid)
        const demoUrl = getDemoGameUrl(gameInfo.type, game_uid)

        res.json({
          success: true,
          game_url: demoUrl,
          session_token: timestamp,
          demo_mode: true,
        })
      }
    }
  )
})

// Game Balance Query API (for third-party games to check balance)
app.post('/api/game/balance', async (req, res) => {
  try {
    const { agency_uid, payload, timestamp } = req.body

    console.log('🔍 Balance query request:', { agency_uid, timestamp })

    if (agency_uid !== GAME_CONFIG.agency_uid) {
      console.error('❌ Invalid agency UID:', agency_uid)
      return res.status(400).json({ code: 10002, msg: 'Invalid agency' })
    }

    const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key)
    const queryData = JSON.parse(decryptedPayload)

    console.log('🔍 Balance query data:', queryData)

    const { player_account } = queryData

    db.get(
      'SELECT * FROM users WHERE game_account = ?',
      [player_account],
      (err, user) => {
        if (err || !user) {
          console.error('❌ User not found:', player_account, err)
          return res.status(400).json({ code: 10004, msg: 'Player not found' })
        }

        const responsePayload = {
          balance: parseFloat(user.balance.toFixed(2)),
          currency: 'USD',
          player_account: player_account,
          status: 'active',
          errorCode: 0,
          errorMessage: 'No Error',
          timestamp: Date.now(),
        }

        console.log('✅ Returning balance:', responsePayload)

        const encryptedResponse = aesEncrypt(
          JSON.stringify(responsePayload),
          GAME_CONFIG.aes_key
        )

        res.json({
          code: 0,
          msg: 'Success',
          payload: encryptedResponse,
        })
      }
    )
  } catch (error) {
    console.error('❌ Balance query error:', error)
    res.status(500).json({ code: 10005, msg: 'System error' })
  }
})

// Universal Game Provider API (supports JILI, PG, PP, etc.)
app.post('/api/game/wallet', async (req, res) => {
  try {
    const { agency_uid, payload, timestamp, provider } = req.body

    console.log('🎮 Universal Wallet API request:', {
      agency_uid,
      provider,
      timestamp,
    })

    if (agency_uid !== GAME_CONFIG.agency_uid) {
      return res.status(400).json({ code: 10002, msg: 'Invalid agency' })
    }

    const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key)
    const queryData = JSON.parse(decryptedPayload)

    console.log('🎮 Wallet query data:', queryData)

    const { player_account } = queryData

    db.get(
      'SELECT * FROM users WHERE game_account = ?',
      [player_account],
      (err, user) => {
        if (err || !user) {
          console.error('❌ Player not found for wallet query:', player_account)
          return res.status(400).json({ code: 10004, msg: 'Player not found' })
        }

        // Standard response format that works for all providers
        const responsePayload = getProviderSpecificResponse(
          provider || 'STANDARD',
          user,
          player_account
        )

        console.log('🎮 Provider response:', {
          provider: provider || 'STANDARD',
          responsePayload,
        })

        const encryptedResponse = aesEncrypt(
          JSON.stringify(responsePayload),
          GAME_CONFIG.aes_key
        )

        res.json({
          code: 0,
          msg: 'Success',
          payload: encryptedResponse,
        })
      }
    )
  } catch (error) {
    console.error('❌ Universal Wallet error:', error)
    res.status(500).json({ code: 10005, msg: 'System error' })
  }
})

// Game Player Status API (for third-party games to verify player)
app.post('/api/game/player/status', async (req, res) => {
  try {
    const { agency_uid, payload, timestamp } = req.body

    console.log('🔍 Player status query:', { agency_uid, timestamp })

    if (agency_uid !== GAME_CONFIG.agency_uid) {
      return res.status(400).json({ code: 10002, msg: 'Invalid agency' })
    }

    const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key)
    const queryData = JSON.parse(decryptedPayload)

    const { player_account } = queryData

    db.get(
      'SELECT * FROM users WHERE game_account = ?',
      [player_account],
      (err, user) => {
        if (err || !user) {
          console.error('❌ Player not found:', player_account)
          return res.status(400).json({ code: 10004, msg: 'Player not found' })
        }

        const minBet = 0.01
        const maxBet = Math.max(user.balance, 0)

        const responsePayload = {
          player_account: player_account,
          balance: parseFloat(user.balance.toFixed(2)),
          currency: 'USD',
          status: 'active',
          can_bet: user.balance >= minBet, // Must meet minimum game balance
          min_bet: minBet,
          max_bet: maxBet,
          errorCode: 0,
          errorMessage: 'No Error',
          timestamp: Date.now(),
        }

        console.log('✅ Player status:', responsePayload)

        const encryptedResponse = aesEncrypt(
          JSON.stringify(responsePayload),
          GAME_CONFIG.aes_key
        )

        res.json({
          code: 0,
          msg: 'Success',
          payload: encryptedResponse,
        })
      }
    )
  } catch (error) {
    console.error('❌ Player status error:', error)
    res.status(500).json({ code: 10005, msg: 'System error' })
  }
})

// Universal Game Callback Handler (supports all providers)
app.post('/api/game/callback', async (req, res) => {
  try {
    let gameData
    let detectedProvider = 'STANDARD'

    console.log('Game callback request:', req.body)

    // Check if request is encrypted format (with agency_uid and payload) or direct JSON
    if (req.body.agency_uid && req.body.payload) {
      // Encrypted format (original implementation)
      const { agency_uid, payload, timestamp, provider } = req.body

      console.log('Encrypted callback request:', {
        agency_uid,
        timestamp,
        provider,
      })

      if (agency_uid !== GAME_CONFIG.agency_uid) {
        return res.status(400).json({ code: 10002, msg: 'Invalid agency' })
      }

      const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key)
      const rawGameData = JSON.parse(decryptedPayload)

      // Map different field names to our standard format (same as direct JSON)
      gameData = {
        player_account:
          rawGameData.member_account || rawGameData.player_account,
        bet_amount: parseFloat(rawGameData.bet_amount || 0),
        win_amount: parseFloat(rawGameData.win_amount || 0),
        transaction_id: rawGameData.serial_number || rawGameData.transaction_id,
        action_type:
          rawGameData.action_type ||
          (rawGameData.bet_amount > 0 ? 'bet' : 'win'),
        game_uid: rawGameData.game_uid,
        game_round: rawGameData.game_round,
        currency_code: rawGameData.currency_code || 'USD',
        timestamp: rawGameData.timestamp,
      }

      detectedProvider = provider || 'JILI'
    } else {
      // Direct JSON format (for game providers that don't use encryption)
      console.log('Direct JSON callback request:', req.body)

      // Map different field names to our standard format
      gameData = {
        player_account: req.body.member_account || req.body.player_account,
        bet_amount: parseFloat(req.body.bet_amount || 0),
        win_amount: parseFloat(req.body.win_amount || 0),
        transaction_id: req.body.serial_number || req.body.transaction_id,
        action_type:
          req.body.action_type || (req.body.bet_amount > 0 ? 'bet' : 'win'),
        game_uid: req.body.game_uid,
        game_round: req.body.game_round,
        currency_code: req.body.currency_code || 'USD',
        timestamp: req.body.timestamp,
      }

      // Detect provider based on request format
      if (req.body.member_account && req.body.serial_number) {
        detectedProvider = 'JILI'
      }
    }

    console.log('Processed game callback data:', gameData)

    const {
      player_account,
      bet_amount,
      win_amount,
      transaction_id,
      action_type,
    } = gameData

    console.log(
      '🔍 Looking for player:',
      player_account,
      'at',
      new Date().toISOString()
    )

    // Database query with retry mechanism for SQLITE_BUSY errors
    const queryWithRetry = (query, params, callback, retries = 3) => {
      db.get(query, params, (err, result) => {
        if (err && err.code === 'SQLITE_BUSY' && retries > 0) {
          console.log(`⚠️ Database busy, retrying... (${3 - retries + 1}/3)`)
          setTimeout(
            () => queryWithRetry(query, params, callback, retries - 1),
            100
          )
          return
        }
        callback(err, result)
      })
    }

    queryWithRetry(
      'SELECT * FROM users WHERE game_account = ?',
      [player_account],
      (err, user) => {
        if (err) {
          console.error('❌ CALLBACK ERROR - Database error:', {
            player_account: player_account,
            error: err.message,
            error_code: err.code,
            timestamp: new Date().toISOString(),
            request_body: req.body,
          })
          return res
            .status(500)
            .json({ code: 10005, msg: 'Database error: ' + err.message })
        }

        if (!user) {
          console.error('❌ CALLBACK ERROR - Player not found:', {
            player_account: player_account,
            timestamp: new Date().toISOString(),
            request_body: req.body,
          })
          return res.status(400).json({ code: 10004, msg: 'Player not found' })
        }

        console.log(
          '✅ Player found successfully:',
          player_account,
          'Balance:',
          user.balance
        )

        const currentBalance = user.balance
        let newBalance = currentBalance
        let responseCode = 0
        let responseMsg = 'Success'

        // Correct logic: if current balance >= bet amount, allow transaction and process normally
        // Otherwise, return error code
        if (action_type === 'bet' || (bet_amount && bet_amount > 0)) {
          if (currentBalance >= bet_amount) {
            // Allow transaction: balance = balance - bet + win
            newBalance = currentBalance - bet_amount
            recordTransaction(
              user.id,
              'BET',
              -bet_amount,
              currentBalance,
              newBalance,
              gameData.game_uid,
              `Bet: ${transaction_id}`
            )
            console.log(
              `Bet processed (balance sufficient): ${bet_amount}, balance: ${currentBalance} -> ${newBalance}`
            )
            responseCode = 0
            responseMsg = 'Success'
          } else {
            // Balance < bet amount: return error code with current balance (no deduction)
            console.log('Insufficient balance for bet:', {
              currentBalance,
              bet_amount,
              player_account,
            })
            responseCode = 1
            responseMsg = 'Insufficient balance'

            const errorPayload = {
              balance: currentBalance,
              transaction_id: transaction_id,
              error: 'Insufficient balance',
              status: responseCode,
              success: false,
            }

            // Check if this is a JILI provider request (encrypted format)
            if (
              detectedProvider === 'JILI' ||
              (req.body.agency_uid && req.body.payload)
            ) {
              // JILI API compliant error response format
              const jiliErrorPayload = {
                credit_amount: '0.00',
                timestamp: Date.now().toString(),
              }

              const encryptedResponse = aesEncrypt(
                JSON.stringify(jiliErrorPayload),
                GAME_CONFIG.aes_key
              )

              return res.json({
                code: responseCode,
                msg: responseMsg,
                payload: encryptedResponse,
              })
            } else {
              const encryptedResponse = aesEncrypt(
                JSON.stringify(errorPayload),
                GAME_CONFIG.aes_key
              )

              return res.json({
                code: responseCode,
                msg: responseMsg,
                payload: encryptedResponse,
              })
            }
          }
        }

        if (action_type === 'win' || (win_amount && win_amount > 0)) {
          newBalance += win_amount
          recordTransaction(
            user.id,
            'WIN',
            win_amount,
            newBalance - win_amount,
            newBalance,
            gameData.game_uid,
            `Win: ${transaction_id}`
          )
          console.log(
            `Win processed: ${win_amount}, new balance: ${newBalance}`
          )
        }

        // Handle refund/cancel
        if (action_type === 'refund' && bet_amount && bet_amount > 0) {
          newBalance += bet_amount
          recordTransaction(
            user.id,
            'REFUND',
            bet_amount,
            newBalance - bet_amount,
            newBalance,
            gameData.game_uid,
            `Refund: ${transaction_id}`
          )
          console.log(
            `Refund processed: ${bet_amount}, new balance: ${newBalance}`
          )
        }

        // Update wagered and won totals
        db.run(
          'UPDATE users SET total_wagered = total_wagered + ?, total_won = total_won + ? WHERE id = ?',
          [bet_amount || 0, win_amount || 0, user.id]
        )

        // Check wallet rules and update balance
        checkWalletRules(user.id, newBalance, err => {
          if (err) {
            console.error('Wallet rules error:', err)
            return res.status(500).json({ code: 10005, msg: 'System error' })
          }

          // 使用之前检测到的提供商类型
          // detectedProvider 已在请求解析时设置

          // Check if this is a JILI provider request (encrypted format)
          if (
            detectedProvider === 'JILI' ||
            (req.body.agency_uid && req.body.payload)
          ) {
            // JILI API compliant response format
            const jiliResponsePayload = {
              credit_amount: newBalance.toFixed(2),
              timestamp: Date.now().toString(),
            }

            console.log('JILI Response payload:', jiliResponsePayload)

            const encryptedResponse = aesEncrypt(
              JSON.stringify(jiliResponsePayload),
              GAME_CONFIG.aes_key
            )

            res.json({
              code: responseCode,
              msg: responseMsg,
              payload: encryptedResponse,
            })
          } else {
            // Standard response for direct JSON callbacks
            const responsePayload = getProviderCallbackResponse(
              detectedProvider,
              newBalance,
              transaction_id
            )

            console.log(
              'Detected provider:',
              detectedProvider,
              'Response format:',
              Object.keys(responsePayload)
            )

            console.log('Callback response:', responsePayload)

            const encryptedResponse = aesEncrypt(
              JSON.stringify(responsePayload),
              GAME_CONFIG.aes_key
            )

            res.json({
              code: responseCode,
              msg: responseMsg,
              payload: encryptedResponse,
            })
          }
        })
      }
    )
  } catch (error) {
    console.error('Callback error:', error)
    res.status(500).json({ code: 10005, msg: 'System error' })
  }
})

// KYC Document Upload (Simplified - ID Front & Back only)
app.post(
  '/api/kyc/upload',
  authenticateToken,
  upload.fields([
    { name: 'id_front', maxCount: 1 },
    { name: 'id_back', maxCount: 1 },
  ]),
  (req, res) => {
    const userId = req.user.userId
    const files = req.files

    if (!files || !files.id_front || !files.id_back) {
      return res
        .status(400)
        .json({ error: 'Both ID front and back images are required' })
    }

    // Save document records
    const documentPromises = []

    Object.keys(files).forEach(fieldname => {
      const file = files[fieldname][0]
      documentPromises.push(
        new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO kyc_documents (user_id, document_type, file_path) VALUES (?, ?, ?)',
            [userId, fieldname, file.path],
            function (err) {
              if (err) reject(err)
              else resolve(this.lastID)
            }
          )
        })
      )
    })

    Promise.all(documentPromises)
      .then(() => {
        // Update user KYC status
        db.run(
          'UPDATE users SET kyc_status = ? WHERE id = ?',
          ['submitted', userId],
          err => {
            if (err) {
              return res
                .status(500)
                .json({ error: 'Failed to update KYC status' })
            }

            res.json({
              message: 'KYC documents uploaded successfully',
              status: 'submitted',
            })
          }
        )
      })
      .catch(err => {
        console.error('KYC upload error:', err)
        res.status(500).json({ error: 'Failed to save documents' })
      })
  }
)

// Submit Withdrawal Request
app.post('/api/withdrawal/request', authenticateToken, (req, res) => {
  const { bank_details } = req.body
  const userId = req.user.userId

  if (!bank_details) {
    return res.status(400).json({ error: 'Bank details are required' })
  }

  getSystemSettings((settingsErr, settings) => {
    if (settingsErr) {
      return res.status(500).json({ error: 'Failed to get system settings' })
    }

    const withdrawalThreshold = parseFloat(
      settings.wallet.withdrawalThreshold || '1000.0'
    )
    const withdrawalAmount = parseFloat(
      settings.wallet.withdrawalAmount || '50.0'
    )

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Check withdrawal eligibility
      if (!user.can_withdraw) {
        return res.status(400).json({
          error: `You need to reach $${withdrawalThreshold} total balance to withdraw`,
        })
      }

      if (user.balance < withdrawalAmount) {
        return res.status(400).json({
          error: `Insufficient balance. You can withdraw $${withdrawalAmount}`,
        })
      }

      if (user.kyc_status !== 'approved') {
        return res.status(400).json({
          error: 'KYC verification required. Please complete KYC first.',
        })
      }

      // Create withdrawal request
      db.run(
        'INSERT INTO withdrawals (user_id, amount, bank_details) VALUES (?, ?, ?)',
        [userId, withdrawalAmount, JSON.stringify(bank_details)],
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Failed to create withdrawal request' })
          }

          res.json({
            message: 'Withdrawal request submitted successfully',
            withdrawal_id: this.lastID,
            amount: withdrawalAmount,
            status: 'pending',
          })
        }
      )
    })
  })
})

// Get Withdrawal History
app.get('/api/withdrawal/history', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, withdrawals) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ withdrawals })
    }
  )
})

// Get Transaction History
app.get('/api/transactions', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM game_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.userId],
    (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ transactions })
    }
  )
})

// Admin Routes

// Get All Users (Admin)
// Get all users with pagination and search
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 50
  const search = req.query.search || ''
  const offset = (page - 1) * limit

  let whereClause = ''
  let params = []

  if (search) {
    whereClause = 'WHERE username LIKE ? OR game_account LIKE ? OR id = ?'
    params = [`%${search}%`, `%${search}%`, search]
  }

  // Get total count
  db.get(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params,
    (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      // Get users with pagination
      const sql = `SELECT id, username, game_account, balance, free_credit, total_wagered, total_won, 
                 can_withdraw, kyc_status, created_at, 
                 (SELECT COUNT(*) FROM game_transactions WHERE user_id = users.id) as total_transactions
                 FROM users ${whereClause} 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`

      const queryParams = search ? [...params, limit, offset] : [limit, offset]

      db.all(sql, queryParams, (err, users) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        res.json({
          users,
          pagination: {
            page,
            limit,
            total: countResult.total,
            totalPages: Math.ceil(countResult.total / limit),
          },
        })
      })
    }
  )
})

// Get single user details
app.get('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id

  db.get(
    `SELECT id, username, game_account, balance, free_credit, total_wagered, total_won, 
          can_withdraw, kyc_status, created_at FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Get user's transactions
      db.all(
        `SELECT * FROM game_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
        [userId],
        (err, transactions) => {
          if (err) {
            console.error('Error fetching transactions:', err)
            transactions = []
          }

          // Get user's withdrawals
          db.all(
            `SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC`,
            [userId],
            (err, withdrawals) => {
              if (err) {
                console.error('Error fetching withdrawals:', err)
                withdrawals = []
              }

              // Get user's KYC documents
              db.all(
                `SELECT * FROM kyc_documents WHERE user_id = ? ORDER BY created_at DESC`,
                [userId],
                (err, kycDocuments) => {
                  if (err) {
                    console.error('Error fetching KYC documents:', err)
                    kycDocuments = []
                  }

                  res.json({
                    user,
                    transactions,
                    withdrawals,
                    kycDocuments,
                  })
                }
              )
            }
          )
        }
      )
    }
  )
})

// Update user
app.put('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id
  const { balance, free_credit, can_withdraw, kyc_status } = req.body

  // Validate input
  if (balance !== undefined && balance < 0) {
    return res.status(400).json({ error: 'Balance cannot be negative' })
  }

  if (free_credit !== undefined && free_credit < 0) {
    return res.status(400).json({ error: 'Free credit cannot be negative' })
  }

  if (
    kyc_status &&
    !['pending', 'submitted', 'approved', 'rejected'].includes(kyc_status)
  ) {
    return res.status(400).json({ error: 'Invalid KYC status' })
  }

  // Build update query dynamically
  const updateFields = []
  const updateValues = []

  if (balance !== undefined) {
    updateFields.push('balance = ?')
    updateValues.push(balance)
  }

  if (free_credit !== undefined) {
    updateFields.push('free_credit = ?')
    updateValues.push(free_credit)
  }

  if (can_withdraw !== undefined) {
    updateFields.push('can_withdraw = ?')
    updateValues.push(can_withdraw ? 1 : 0)
  }

  if (kyc_status !== undefined) {
    updateFields.push('kyc_status = ?')
    updateValues.push(kyc_status)
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' })
  }

  updateValues.push(userId)

  const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`

  db.run(sql, updateValues, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update user' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Record admin action if balance was changed
    if (balance !== undefined) {
      recordTransaction(
        userId,
        'ADMIN_ADJUST',
        balance,
        0,
        balance,
        null,
        `Admin balance adjustment by ${req.admin.username}`
      )
    }

    res.json({ message: 'User updated successfully' })
  })
})

// Delete user (soft delete - mark as inactive)
app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id

  // Check if user exists and get current data
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Instead of hard delete, we'll mark user as inactive and archive data
    const archivedUsername = `deleted_${user.username}_${Date.now()}`

    db.run(
      'UPDATE users SET username = ?, balance = 0, free_credit = 0, can_withdraw = 0, kyc_status = ? WHERE id = ?',
      [archivedUsername, 'deleted', userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete user' })
        }

        // Record deletion transaction
        recordTransaction(
          userId,
          'ADMIN_DELETE',
          0,
          user.balance,
          0,
          null,
          `User deleted by admin ${req.admin.username}`
        )

        res.json({ message: 'User deleted successfully' })
      }
    )
  })
})

// Create new user (admin only)
app.post('/api/admin/users', authenticateAdmin, (req, res) => {
  const { username, password, initial_balance, initial_credit } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters long' })
  }

  // Get system settings for defaults
  getSystemSettings((err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get system settings' })
    }

    const balance =
      initial_balance !== undefined
        ? initial_balance
        : parseFloat(settings.wallet.initialBalance || '50.0')
    const credit =
      initial_credit !== undefined
        ? initial_credit
        : parseFloat(settings.wallet.freeCreditAmount || '50.0')
    const playerPrefix = settings.game.playerPrefix || 'h4944d'

    const hashedPassword = bcrypt.hashSync(password, 10)
    const gameAccount = `${playerPrefix}_admin_${Date.now()}`

    db.run(
      'INSERT INTO users (username, password, game_account, balance, free_credit) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, gameAccount, balance, credit],
      function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Username already exists' })
          }
          return res.status(500).json({ error: 'Failed to create user' })
        }

        const userId = this.lastID

        // Record initial credit transaction
        if (credit > 0) {
          recordTransaction(
            userId,
            'ADMIN_CREATE',
            credit,
            0,
            credit,
            null,
            `User created by admin ${req.admin.username}`
          )
        }

        res.status(201).json({
          message: 'User created successfully',
          userId: userId,
          username: username,
          gameAccount: gameAccount,
          initialBalance: balance,
          initialCredit: credit,
        })
      }
    )
  })
})

// Get All Withdrawals (Admin)
app.get('/api/admin/withdrawals', authenticateAdmin, (req, res) => {
  db.all(
    `SELECT w.*, u.username, u.game_account 
          FROM withdrawals w 
          JOIN users u ON w.user_id = u.id 
          ORDER BY w.created_at DESC`,
    [],
    (err, withdrawals) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ withdrawals })
    }
  )
})

// Process Withdrawal (Admin)
app.post('/api/admin/withdrawal/:id/process', authenticateAdmin, (req, res) => {
  const { id } = req.params
  const { action, admin_notes, attachments } = req.body // action: 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res
      .status(400)
      .json({ error: 'Invalid action. Use approve or reject' })
  }

  db.get(
    'SELECT w.*, u.balance FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.id = ?',
    [id],
    (err, withdrawal) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!withdrawal) {
        return res.status(404).json({ error: 'Withdrawal not found' })
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({ error: 'Withdrawal already processed' })
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      const attachmentsJson = JSON.stringify(attachments || [])

      db.run(
        'UPDATE withdrawals SET status = ?, admin_notes = ?, attachments = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, admin_notes, attachmentsJson, id],
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Failed to update withdrawal' })
          }

          // If approved, deduct amount from user balance
          if (action === 'approve') {
            const newBalance = withdrawal.balance - withdrawal.amount
            db.run(
              'UPDATE users SET balance = ? WHERE id = ?',
              [newBalance, withdrawal.user_id],
              err => {
                if (err) {
                  console.error('Failed to update user balance:', err)
                } else {
                  recordTransaction(
                    withdrawal.user_id,
                    'WITHDRAWAL',
                    -withdrawal.amount,
                    withdrawal.balance,
                    newBalance,
                    null,
                    `Withdrawal approved: ${id}`
                  )
                }
              }
            )
          }

          res.json({
            message: `Withdrawal ${action}d successfully`,
            withdrawal_id: id,
            status: newStatus,
          })
        }
      )
    }
  )
})

// Get KYC Documents (Admin)
app.get('/api/admin/kyc', authenticateAdmin, (req, res) => {
  db.all(
    `SELECT k.*, u.username, u.kyc_status 
          FROM kyc_documents k 
          JOIN users u ON k.user_id = u.id 
          ORDER BY k.created_at DESC`,
    [],
    (err, documents) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ documents })
    }
  )
})

// Process KYC (Admin)
app.post('/api/admin/kyc/:userId/process', authenticateAdmin, (req, res) => {
  const { userId } = req.params
  const { action, admin_notes } = req.body // action: 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res
      .status(400)
      .json({ error: 'Invalid action. Use approve or reject' })
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  db.run(
    'UPDATE users SET kyc_status = ? WHERE id = ?',
    [newStatus, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update KYC status' })
      }

      // Update all documents for this user
      db.run(
        'UPDATE kyc_documents SET status = ?, admin_notes = ? WHERE user_id = ?',
        [newStatus, admin_notes, userId],
        err => {
          if (err) {
            console.error('Failed to update KYC documents:', err)
          }
        }
      )

      res.json({
        message: `KYC ${action}d successfully`,
        user_id: userId,
        status: newStatus,
      })
    }
  )
})

// Admin Settings APIs

// Get system settings
app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
  getSystemSettings((err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get settings' })
    }

    // Convert string values to appropriate types
    const walletSettings = {
      initialBalance: parseFloat(settings.wallet.initialBalance || '50.0'),
      freeCreditAmount: parseFloat(settings.wallet.freeCreditAmount || '50.0'),
      minBalanceThreshold: parseFloat(
        settings.wallet.minBalanceThreshold || '0.1'
      ),
      withdrawalThreshold: parseFloat(
        settings.wallet.withdrawalThreshold || '1000.0'
      ),
      withdrawalAmount: parseFloat(settings.wallet.withdrawalAmount || '50.0'),
      sessionTimeout: parseInt(settings.security.sessionTimeout || '30'),
      maxLoginAttempts: parseInt(settings.security.maxLoginAttempts || '5'),
      passwordMinLength: parseInt(settings.security.passwordMinLength || '6'),
    }

    const gameSettings = {
      apiUrl: settings.game.apiUrl || 'https://jsgame.live',
      agencyUid: settings.game.agencyUid || '45370b4f27dfc8a2875ba78d07e8a81a',
      playerPrefix: settings.game.playerPrefix || 'h4944d',
      aesKey: settings.game.aesKey || '08970240475e1255d2b4ac023ac658f3',
    }

    res.json({
      wallet: walletSettings,
      game: gameSettings,
    })
  })
})

// Update wallet settings
app.post('/api/admin/settings/wallet', authenticateAdmin, (req, res) => {
  const {
    initialBalance,
    freeCreditAmount,
    minBalanceThreshold,
    withdrawalThreshold,
    withdrawalAmount,
    sessionTimeout,
    maxLoginAttempts,
    passwordMinLength,
  } = req.body

  // Validate input
  if (
    initialBalance < 0 ||
    freeCreditAmount < 0 ||
    minBalanceThreshold < 0 ||
    withdrawalThreshold < 0 ||
    withdrawalAmount < 0 ||
    sessionTimeout < 5 ||
    maxLoginAttempts < 1 ||
    passwordMinLength < 4
  ) {
    return res.status(400).json({ error: 'All values must be non-negative' })
  }

  const updates = [
    ['wallet', 'initialBalance', initialBalance.toString()],
    ['wallet', 'freeCreditAmount', freeCreditAmount.toString()],
    ['wallet', 'minBalanceThreshold', minBalanceThreshold.toString()],
    ['wallet', 'withdrawalThreshold', withdrawalThreshold.toString()],
    ['wallet', 'withdrawalAmount', withdrawalAmount.toString()],
    ['security', 'sessionTimeout', sessionTimeout.toString()],
    ['security', 'maxLoginAttempts', maxLoginAttempts.toString()],
    ['security', 'passwordMinLength', passwordMinLength.toString()],
  ]

  let completed = 0
  let hasError = false

  updates.forEach(([category, key, value]) => {
    updateSystemSetting(category, key, value, err => {
      if (err && !hasError) {
        hasError = true
        return res
          .status(500)
          .json({ error: 'Failed to update wallet settings' })
      }

      completed++
      if (completed === updates.length && !hasError) {
        res.json({ message: 'Wallet settings updated successfully' })
      }
    })
  })
})

// Update game settings
app.post('/api/admin/settings/game', authenticateAdmin, (req, res) => {
  const { apiUrl, agencyUid, playerPrefix } = req.body

  // Validate input
  if (!apiUrl || !agencyUid || !playerPrefix) {
    return res.status(400).json({ error: 'All game settings are required' })
  }

  const updates = [
    ['game', 'apiUrl', apiUrl],
    ['game', 'agencyUid', agencyUid],
    ['game', 'playerPrefix', playerPrefix],
  ]

  let completed = 0
  let hasError = false

  updates.forEach(([category, key, value]) => {
    updateSystemSetting(category, key, value, err => {
      if (err && !hasError) {
        hasError = true
        return res.status(500).json({ error: 'Failed to update game settings' })
      }

      completed++
      if (completed === updates.length && !hasError) {
        res.json({ message: 'Game settings updated successfully' })
      }
    })
  })
})

// Test game API connection
app.post(
  '/api/admin/settings/test-game-api',
  authenticateAdmin,
  async (req, res) => {
    const { apiUrl } = req.body

    if (!apiUrl) {
      return res.status(400).json({ error: 'API URL is required' })
    }

    try {
      // Simple connectivity test - try to reach the API
      const response = await axios.get(apiUrl, { timeout: 5000 })

      res.json({
        success: true,
        message: 'Game API is reachable',
        status: response.status,
      })
    } catch (error) {
      console.error('Game API test failed:', error.message)

      res.json({
        success: false,
        message: 'Game API is not reachable',
        error: error.message,
      })
    }
  }
)

// Admin Games Management Endpoints

// Create game_library_providers table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS game_library_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    games_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

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
    displaySequence INTEGER,
    FOREIGN KEY(provider_id) REFERENCES game_library_providers(id)
  )
`)

// Initialize default providers if empty
db.get('SELECT COUNT(*) as count FROM game_library_providers', (err, row) => {
  if (!err && row.count === 0) {
    const defaultProviders = [
      {
        name: 'JILI Gaming',
        code: 'JILI',
        logo_url: '/images/providers/jili.png',
        description: 'Leading Asian gaming provider',
        status: 'active',
        games_count: 12,
      },
      {
        name: 'Pragmatic Play',
        code: 'PP',
        logo_url: '/images/providers/pragmatic.png',
        description: 'World-class gaming content provider',
        status: 'active',
        games_count: 8,
      },
      {
        name: 'PG Soft',
        code: 'PG',
        logo_url: '/images/providers/pgsoft.png',
        description: 'Mobile-focused gaming solutions',
        status: 'active',
        games_count: 6,
      },
      {
        name: 'Habanero',
        code: 'HAB',
        logo_url: '/images/providers/habanero.png',
        description: 'Premium casino games provider',
        status: 'active',
        games_count: 4,
      },
      {
        name: 'Red Tiger',
        code: 'RT',
        logo_url: '/images/providers/redtiger.png',
        description: 'Innovative slot game developer',
        status: 'active',
        games_count: 3,
      },
    ]

    defaultProviders.forEach(provider => {
      db.run(
        `
        INSERT INTO game_library_providers (name, code, logo_url, description, status, games_count) 
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          provider.name,
          provider.code,
          provider.logo_url,
          provider.description,
          provider.status,
          provider.games_count,
        ]
      )
    })
  }
})

// GET /api/admin/games - Get all games with provider information
app.get('/api/admin/games', authenticateAdmin, (req, res) => {
  db.all(
    `
    SELECT 
      g.*,
      p.name as provider_name,
      p.code as provider_code
    FROM games g
    LEFT JOIN game_library_providers p ON g.provider_id = p.id
    ORDER BY g.displaySequence ASC
  `,
    (err, games) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve games' })
      }

      res.json({
        games: games.map(game => ({
          ...game,
          featured: Boolean(game.featured),
          displaySequence: game.displaySequence || null,
          created_at: game.created_at,
          updated_at: game.updated_at,
        })),
      })
    }
  )
})

// POST /api/admin/games - Create new game
app.post('/api/admin/games', authenticateAdmin, (req, res) => {
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
  } = req.body

  // Validate required fields (allow 0 as valid value for code)
  if (
    !name ||
    code === undefined ||
    code === null ||
    !game_uid ||
    !type ||
    !provider_id
  ) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Check if game UID already exists
  db.get(
    'SELECT id FROM games WHERE game_uid = ?',
    [game_uid],
    (err, existingGame) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (existingGame) {
        return res.status(400).json({ error: 'Game UID already exists' })
      }

      // Check if provider exists
      db.get(
        'SELECT id FROM game_library_providers WHERE id = ?',
        [provider_id],
        (err, provider) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (!provider) {
            return res.status(400).json({ error: 'Provider not found' })
          }

          // Get next display sequence if not provided
          let finalDisplaySequence = displaySequence
          if (!finalDisplaySequence) {
            db.get(
              'SELECT MAX(displaySequence) as maxSeq FROM games',
              (err, maxSeq) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' })
                }
                finalDisplaySequence = (maxSeq?.maxSeq || 0) + 1
                insertGame()
              }
            )
          } else {
            insertGame()
          }

          function insertGame() {
            // Insert new game
            db.run(
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
              ],
              function (err) {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: 'Failed to create game' })
                }

                res.json({
                  success: true,
                  id: this.lastID,
                  message: 'Game created successfully',
                })
              }
            )
          }
        }
      )
    }
  )
})

// PUT /api/admin/games/:id - Update game
app.put('/api/admin/games/:id', authenticateAdmin, (req, res) => {
  const gameId = req.params.id
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
  } = req.body

  // Validate required fields (allow 0 as valid value for code)
  if (
    !name ||
    code === undefined ||
    code === null ||
    !game_uid ||
    !type ||
    !provider_id
  ) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Check if game exists
  db.get('SELECT id FROM games WHERE id = ?', [gameId], (err, existingGame) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!existingGame) {
      return res.status(404).json({ error: 'Game not found' })
    }

    // Check if game UID is taken by another game
    db.get(
      'SELECT id FROM games WHERE game_uid = ? AND id != ?',
      [game_uid, gameId],
      (err, uidConflict) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        if (uidConflict) {
          return res.status(400).json({ error: 'Game UID already exists' })
        }

        // Check if provider exists
        db.get(
          'SELECT id FROM game_library_providers WHERE id = ?',
          [provider_id],
          (err, provider) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' })
            }

            if (!provider) {
              return res.status(400).json({ error: 'Provider not found' })
            }

            // Update game
            db.run(
              `
          UPDATE games SET 
            name = ?, code = ?, game_uid = ?, type = ?, provider_id = ?, rtp = ?, 
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
                rtp || 96.0,
                status || 'active',
                featured ? 1 : 0,
                displaySequence,
                min_bet || 0.1,
                max_bet || 100,
                demo_url,
                thumbnail_url,
                gameId,
              ],
              function (err) {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: 'Failed to update game' })
                }

                res.json({
                  success: true,
                  message: 'Game updated successfully',
                })
              }
            )
          }
        )
      }
    )
  })
})

// DELETE /api/admin/games/:id - Delete game
app.delete('/api/admin/games/:id', authenticateAdmin, (req, res) => {
  const gameId = req.params.id

  db.run('DELETE FROM games WHERE id = ?', [gameId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete game' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Game not found' })
    }

    res.json({
      success: true,
      message: 'Game deleted successfully',
    })
  })
})

// GET /api/admin/game-library-providers - Get all providers
app.get('/api/admin/game-library-providers', authenticateAdmin, (req, res) => {
  db.all(
    'SELECT * FROM game_library_providers ORDER BY name',
    (err, providers) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve providers' })
      }

      res.json({ providers })
    }
  )
})

// Get available games from database
app.get('/api/games', (req, res) => {
  console.log('🎮 Fetching games from database...')
  const query = `
    SELECT 
      g.*,
      p.name as provider_name,
      p.code as provider_code
    FROM games g
    LEFT JOIN game_library_providers p ON g.provider_id = p.id
    WHERE g.status = 'active'
    ORDER BY g.displaySequence ASC
  `

  db.all(query, [], (err, games) => {
    console.log('📊 Games fetched:', games ? games.length : 0, 'err:', err)
    if (err) {
      console.error('Error fetching games:', err)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch games',
      })
    }

    res.json({
      success: true,
      games: games.map(game => ({
        ...game,
        featured: Boolean(game.featured),
        displaySequence: game.displaySequence || null,
      })),
    })
  })
})

function getGameInfo(gameUid) {
  const allGames = [
    {
      name: 'Royal Fishing',
      game_uid: 'e794bf5717aca371152df192341fe68b',
      type: 'Fish Game',
    },
    {
      name: 'Bombing Fishing',
      game_uid: 'e333695bcff28acdbecc641ae6ee2b23',
      type: 'Fish Game',
    },
    {
      name: 'Chin Shi Huang',
      game_uid: '24da72b49b0dd0e5cbef9579d09d8981',
      type: 'Slot Game',
    },
    {
      name: 'War Of Dragons',
      game_uid: '4b1d7ffaf9f66e6152ea93a6d0e4215b',
      type: 'Slot Game',
    },
  ]

  return (
    allGames.find(game => game.game_uid === gameUid) || {
      name: 'Unknown Game',
      type: 'Slot Game',
    }
  )
}

// Serve Next.js app for all non-API routes (must be after all API routes)
if (process.env.NODE_ENV === 'production') {
  // Use a middleware approach that's compatible with Express 5.x
  app.use((req, res, next) => {
    console.log('Next.js route handler called for:', req.path)

    // Skip API routes - let them pass through to the actual handlers
    if (req.path.startsWith('/api/')) {
      return next()
    }

    // Serve the appropriate Next.js page based on the route
    let filePath = '.next/server/app/index.html'

    if (req.path === '/admin') {
      filePath = '.next/server/app/admin.html'
    } else if (req.path === '/promotions') {
      filePath = '.next/server/app/promotions.html'
    }

    console.log('Serving file:', filePath)
    res.sendFile(path.join(__dirname, filePath))
  })
}

// ============= SCHEDULED BLOG PUBLISHING =============

// Function to check and publish scheduled blogs
function publishScheduledBlogs() {
  const now = new Date().toISOString()

  db.all(
    'SELECT * FROM blogs WHERE status = ? AND scheduled_at <= ?',
    ['scheduled', now],
    (err, scheduledBlogs) => {
      if (err) {
        console.error('Error fetching scheduled blogs:', err)
        return
      }

      scheduledBlogs.forEach(blog => {
        db.run(
          'UPDATE blogs SET status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['published', now, blog.id],
          function (updateErr) {
            if (updateErr) {
              console.error(
                `Error publishing scheduled blog ${blog.id}:`,
                updateErr
              )
            } else {
              console.log(
                `✅ Auto-published scheduled blog: "${blog.title}" (ID: ${blog.id})`
              )
            }
          }
        )
      })
    }
  )
}

// Run scheduled blog check every minute
setInterval(publishScheduledBlogs, 60000) // 60 seconds

// Run initial check when server starts
publishScheduledBlogs()

// ============= CATEGORY PATH UTILITIES =============

// Function to build category path from root to leaf
function buildCategoryPath(categoryId, categories = null) {
  return new Promise((resolve, reject) => {
    if (!categoryId) {
      resolve('')
      return
    }

    // If categories array is provided, use it (for efficiency)
    if (categories) {
      const path = []
      let currentCat = categories.find(c => c.id === categoryId)

      while (currentCat) {
        path.unshift(currentCat.slug)
        currentCat = currentCat.parent_id
          ? categories.find(c => c.id === currentCat.parent_id)
          : null
      }

      resolve(path.join('/'))
      return
    }

    // Otherwise, query database
    const path = []

    function getCategory(id) {
      db.get(
        'SELECT id, slug, parent_id FROM categories WHERE id = ?',
        [id],
        (err, category) => {
          if (err) {
            reject(err)
            return
          }

          if (!category) {
            resolve(path.join('/'))
            return
          }

          path.unshift(category.slug)

          if (category.parent_id) {
            getCategory(category.parent_id)
          } else {
            resolve(path.join('/'))
          }
        }
      )
    }

    getCategory(categoryId)
  })
}

// Function to get all categories with their full paths
function getCategoriesWithPaths() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM categories ORDER BY parent_id, name',
      [],
      (err, categories) => {
        if (err) {
          reject(err)
          return
        }

        const categoriesWithPaths = categories.map(cat => ({
          ...cat,
          full_path: buildCategoryPath(cat.id, categories),
        }))

        Promise.all(categoriesWithPaths.map(cat => cat.full_path))
          .then(paths => {
            const result = categoriesWithPaths.map((cat, index) => ({
              ...cat,
              full_path: paths[index],
            }))
            resolve(result)
          })
          .catch(reject)
      }
    )
  })
}

// ============= PUBLIC BLOG ROUTES =============

// Get all published blogs (public endpoint)
app.get('/api/blogs', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const search = req.query.search || ''
  const category = req.query.category || ''
  const author = req.query.author || ''
  const offset = (page - 1) * limit

  let whereConditions = ['b.status = ?']
  let params = ['published']

  if (search) {
    whereConditions.push('(b.title LIKE ? OR b.content LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }

  if (category) {
    whereConditions.push('c.name = ?')
    params.push(category)
  }

  if (author) {
    whereConditions.push('b.author = ?')
    params.push(author)
  }

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM blogs b 
    LEFT JOIN categories c ON b.category_id = c.id 
    ${whereClause}
  `

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get blog count' })
    }

    // Get blogs with pagination
    const query = `
      SELECT 
        b.*,
        c.name as category_name,
        mf.url as featured_image_url,
        GROUP_CONCAT(t.name) as tag_names
      FROM blogs b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN media_files mf ON b.featured_image_id = mf.id
      LEFT JOIN blog_tags bt ON b.id = bt.blog_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      ${whereClause}
      GROUP BY b.id
      ORDER BY b.published_at DESC
      LIMIT ? OFFSET ?
    `

    const queryParams = [...params, limit, offset]

    db.all(query, queryParams, async (err, blogs) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch blogs' })
      }

      // Process blogs data with category paths
      const processedBlogs = await Promise.all(
        blogs.map(async blog => {
          let categoryPath = ''
          if (blog.category_id) {
            try {
              categoryPath = await buildCategoryPath(blog.category_id)
            } catch (pathErr) {
              console.error('Error building category path:', pathErr)
            }
          }

          return {
            ...blog,
            tags: blog.tag_names ? blog.tag_names.split(',') : [],
            category_path: categoryPath,
            full_url: categoryPath
              ? `/${categoryPath}/${blog.slug}`
              : `/${blog.slug}`,
          }
        })
      )

      res.json({
        blogs: processedBlogs,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit),
        },
      })
    })
  })
})

// Get individual blog post by slug (public endpoint)
app.get('/api/blogs/:slug', (req, res) => {
  const slug = req.params.slug

  const query = `
    SELECT 
      b.*,
      c.name as category_name,
      mf.url as featured_image_url,
      GROUP_CONCAT(t.name) as tag_names
    FROM blogs b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN media_files mf ON b.featured_image_id = mf.id
    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
    LEFT JOIN tags t ON bt.tag_id = t.id
    WHERE b.status = 'published' AND b.slug = ?
    GROUP BY b.id
  `

  db.get(query, [slug], async (err, blog) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch blog post' })
    }

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' })
    }

    // Build category path
    let categoryPath = ''
    if (blog.category_id) {
      try {
        categoryPath = await buildCategoryPath(blog.category_id)
      } catch (pathErr) {
        console.error('Error building category path:', pathErr)
      }
    }

    const processedBlog = {
      ...blog,
      tags: blog.tag_names ? blog.tag_names.split(',') : [],
      category_path: categoryPath,
      full_url: categoryPath
        ? `/${categoryPath}/${blog.slug}`
        : `/${blog.slug}`,
    }

    res.json({
      blog: processedBlog,
    })
  })
})

// Get blogs by category ID (simplified)
app.get('/api/blogs/category/:categoryId', (req, res) => {
  const categoryId = parseInt(req.params.categoryId)

  if (!categoryId) {
    return res.status(400).json({ error: 'Invalid category ID' })
  }

  // Get blogs in this category
  const query = `
    SELECT 
      b.*,
      c.name as category_name,
      mf.url as featured_image_url,
      GROUP_CONCAT(t.name) as tag_names
    FROM blogs b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN media_files mf ON b.featured_image_id = mf.id
    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
    LEFT JOIN tags t ON bt.tag_id = t.id
    WHERE b.status = 'published' AND b.category_id = ?
    GROUP BY b.id
    ORDER BY b.published_at DESC
  `

  db.all(query, [categoryId], async (err, blogs) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch blogs' })
    }

    // Get category info
    db.get(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId],
      async (catErr, category) => {
        if (catErr) {
          return res.status(500).json({ error: 'Failed to fetch category' })
        }

        if (!category) {
          return res.status(404).json({ error: 'Category not found' })
        }

        // Process blogs with full URLs
        const processedBlogs = await Promise.all(
          blogs.map(async blog => {
            let categoryPath = ''
            if (blog.category_id) {
              try {
                categoryPath = await buildCategoryPath(blog.category_id)
              } catch (pathErr) {
                console.error('Error building category path:', pathErr)
              }
            }

            return {
              ...blog,
              tags: blog.tag_names ? blog.tag_names.split(',') : [],
              category_path: categoryPath,
              full_url: categoryPath
                ? `/${categoryPath}/${blog.slug}`
                : `/${blog.slug}`,
            }
          })
        )

        // Get category path
        let categoryPath = ''
        try {
          categoryPath = await buildCategoryPath(categoryId)
        } catch (pathErr) {
          console.error('Error building category path:', pathErr)
        }

        res.json({
          category: {
            ...category,
            full_path: categoryPath,
            full_url: `/${categoryPath}`,
          },
          blogs: processedBlogs,
        })
      }
    )
  })
})

// ============= CONTENT MANAGEMENT API ENDPOINTS =============

// Blog Management API
app.get('/api/admin/blogs', authenticateAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const search = req.query.search || ''
  const status = req.query.status || 'all'
  const category = req.query.category || ''
  const author = req.query.author || ''
  const offset = (page - 1) * limit

  let whereConditions = []
  let params = []

  if (search) {
    whereConditions.push('(b.title LIKE ? OR b.content LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }

  if (status !== 'all') {
    whereConditions.push('b.status = ?')
    params.push(status)
  }

  if (category) {
    whereConditions.push('c.name = ?')
    params.push(category)
  }

  if (author) {
    whereConditions.push('b.author = ?')
    params.push(author)
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM blogs b 
    LEFT JOIN categories c ON b.category_id = c.id 
    ${whereClause}
  `

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get blog count' })
    }

    // Get blogs with pagination
    const query = `
      SELECT 
        b.*,
        c.name as category_name,
        mf.url as featured_image_url,
        GROUP_CONCAT(t.name) as tag_names
      FROM blogs b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN media_files mf ON b.featured_image_id = mf.id
      LEFT JOIN blog_tags bt ON b.id = bt.blog_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      ${whereClause}
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `

    const queryParams = [...params, limit, offset]

    db.all(query, queryParams, async (err, blogs) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch blogs' })
      }

      // Process blogs data with category paths
      const processedBlogs = await Promise.all(
        blogs.map(async blog => {
          let categoryPath = ''
          if (blog.category_id) {
            try {
              categoryPath = await buildCategoryPath(blog.category_id)
            } catch (pathErr) {
              console.error('Error building category path:', pathErr)
            }
          }

          return {
            ...blog,
            tags: blog.tag_names ? blog.tag_names.split(',') : [],
            category_path: categoryPath,
            full_url: categoryPath
              ? `/${categoryPath}/${blog.slug}`
              : `/${blog.slug}`,
          }
        })
      )

      res.json({
        blogs: processedBlogs,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit),
        },
      })
    })
  })
})

app.get('/api/admin/blogs/:id', authenticateAdmin, (req, res) => {
  const blogId = req.params.id

  const query = `
    SELECT 
      b.*,
      c.name as category_name,
      mf.url as featured_image_url,
      GROUP_CONCAT(t.id || ':' || t.name) as tag_data
    FROM blogs b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN media_files mf ON b.featured_image_id = mf.id
    LEFT JOIN blog_tags bt ON b.id = bt.blog_id
    LEFT JOIN tags t ON bt.tag_id = t.id
    WHERE b.id = ?
    GROUP BY b.id
  `

  db.get(query, [blogId], (err, blog) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch blog' })
    }

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    // Process tags
    const tags = blog.tag_data
      ? blog.tag_data.split(',').map(tagData => {
          const [id, name] = tagData.split(':')
          return { id: parseInt(id), name }
        })
      : []

    res.json({
      ...blog,
      tags,
    })
  })
})

app.post('/api/admin/blogs', authenticateAdmin, (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    featured_image_id,
    author,
    status,
    category_id,
    tags,
    seo_title,
    seo_description,
    scheduled_at,
  } = req.body

  if (!title || !content || !author) {
    return res
      .status(400)
      .json({ error: 'Title, content, and author are required' })
  }

  // Validate scheduled_at if status is scheduled
  if (status === 'scheduled') {
    if (!scheduled_at) {
      return res
        .status(400)
        .json({ error: 'Scheduled date is required for scheduled posts' })
    }
    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date()) {
      return res
        .status(400)
        .json({ error: 'Scheduled date must be in the future' })
    }
  }

  const published_at = status === 'published' ? new Date().toISOString() : null
  const scheduled_at_value = status === 'scheduled' ? scheduled_at : null

  const query = `
    INSERT INTO blogs (
      title, slug, excerpt, content, featured_image_id, author, 
      status, category_id, seo_title, seo_description, published_at, scheduled_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  db.run(
    query,
    [
      title,
      slug,
      excerpt,
      content,
      featured_image_id,
      author,
      status,
      category_id,
      seo_title,
      seo_description,
      published_at,
      scheduled_at_value,
    ],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Blog slug already exists' })
        }
        return res.status(500).json({ error: 'Failed to create blog' })
      }

      const blogId = this.lastID

      // Handle tags
      if (tags && tags.length > 0) {
        const tagInserts = tags.map(tagId => [blogId, tagId])
        const tagQuery = 'INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)'

        tagInserts.forEach(([blogId, tagId]) => {
          db.run(tagQuery, [blogId, tagId])
        })

        // Update tag post counts
        tags.forEach(tagId => {
          db.run('UPDATE tags SET post_count = post_count + 1 WHERE id = ?', [
            tagId,
          ])
        })
      }

      // Update category post count
      if (category_id) {
        db.run(
          'UPDATE categories SET post_count = post_count + 1 WHERE id = ?',
          [category_id]
        )
      }

      res.json({ id: blogId, message: 'Blog created successfully' })
    }
  )
})

app.put('/api/admin/blogs/:id', authenticateAdmin, (req, res) => {
  const blogId = req.params.id
  const {
    title,
    slug,
    excerpt,
    content,
    featured_image_id,
    author,
    status,
    category_id,
    tags,
    seo_title,
    seo_description,
    scheduled_at,
  } = req.body

  if (!title || !content || !author) {
    return res
      .status(400)
      .json({ error: 'Title, content, and author are required' })
  }

  // Validate scheduled_at if status is scheduled
  if (status === 'scheduled') {
    if (!scheduled_at) {
      return res
        .status(400)
        .json({ error: 'Scheduled date is required for scheduled posts' })
    }
    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date()) {
      return res
        .status(400)
        .json({ error: 'Scheduled date must be in the future' })
    }
  }

  // Get current blog data for comparison
  db.get('SELECT * FROM blogs WHERE id = ?', [blogId], (err, currentBlog) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch current blog' })
    }

    if (!currentBlog) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    const published_at =
      status === 'published' && currentBlog.status !== 'published'
        ? new Date().toISOString()
        : currentBlog.published_at

    const scheduled_at_value = status === 'scheduled' ? scheduled_at : null

    const query = `
      UPDATE blogs SET 
        title = ?, slug = ?, excerpt = ?, content = ?, featured_image_id = ?, 
        author = ?, status = ?, category_id = ?, seo_title = ?, seo_description = ?, 
        published_at = ?, scheduled_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    db.run(
      query,
      [
        title,
        slug,
        excerpt,
        content,
        featured_image_id,
        author,
        status,
        category_id,
        seo_title,
        seo_description,
        published_at,
        scheduled_at_value,
        blogId,
      ],
      function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Blog slug already exists' })
          }
          return res.status(500).json({ error: 'Failed to update blog' })
        }

        // Update category post counts
        if (currentBlog.category_id !== category_id) {
          if (currentBlog.category_id) {
            db.run(
              'UPDATE categories SET post_count = post_count - 1 WHERE id = ?',
              [currentBlog.category_id]
            )
          }
          if (category_id) {
            db.run(
              'UPDATE categories SET post_count = post_count + 1 WHERE id = ?',
              [category_id]
            )
          }
        }

        // Handle tags - remove old ones and add new ones
        db.run('DELETE FROM blog_tags WHERE blog_id = ?', [blogId], err => {
          if (err) {
            console.error('Error removing old tags:', err)
          }

          // Update old tag counts
          db.all(
            'SELECT tag_id FROM blog_tags WHERE blog_id = ?',
            [blogId],
            (err, oldTags) => {
              if (!err && oldTags) {
                oldTags.forEach(tag => {
                  db.run(
                    'UPDATE tags SET post_count = post_count - 1 WHERE id = ?',
                    [tag.tag_id]
                  )
                })
              }
            }
          )

          // Add new tags
          if (tags && tags.length > 0) {
            const tagInserts = tags.map(tagId => [blogId, tagId])
            const tagQuery =
              'INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)'

            tagInserts.forEach(([blogId, tagId]) => {
              db.run(tagQuery, [blogId, tagId])
            })

            // Update new tag post counts
            tags.forEach(tagId => {
              db.run(
                'UPDATE tags SET post_count = post_count + 1 WHERE id = ?',
                [tagId]
              )
            })
          }

          res.json({ message: 'Blog updated successfully' })
        })
      }
    )
  })
})

app.delete('/api/admin/blogs/:id', authenticateAdmin, (req, res) => {
  const blogId = req.params.id

  // Get blog data for cleanup
  db.get(
    'SELECT category_id FROM blogs WHERE id = ?',
    [blogId],
    (err, blog) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch blog' })
      }

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      // Delete blog (cascade will handle blog_tags)
      db.run('DELETE FROM blogs WHERE id = ?', [blogId], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete blog' })
        }

        // Update category post count
        if (blog.category_id) {
          db.run(
            'UPDATE categories SET post_count = post_count - 1 WHERE id = ?',
            [blog.category_id]
          )
        }

        // Update tag post counts (this should be handled by triggers in a real app)
        db.all(
          'SELECT tag_id FROM blog_tags WHERE blog_id = ?',
          [blogId],
          (err, tags) => {
            if (!err && tags) {
              tags.forEach(tag => {
                db.run(
                  'UPDATE tags SET post_count = post_count - 1 WHERE id = ?',
                  [tag.tag_id]
                )
              })
            }
          }
        )

        res.json({ message: 'Blog deleted successfully' })
      })
    }
  )
})

// Blog status toggle endpoint
app.post(
  '/api/admin/blogs/:id/toggle-status',
  authenticateAdmin,
  (req, res) => {
    const blogId = req.params.id

    db.get('SELECT status FROM blogs WHERE id = ?', [blogId], (err, blog) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch blog' })
      }

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' })
      }

      const newStatus = blog.status === 'published' ? 'draft' : 'published'
      const published_at =
        newStatus === 'published' ? new Date().toISOString() : null

      db.run(
        'UPDATE blogs SET status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, published_at, blogId],
        function (err) {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Failed to update blog status' })
          }

          res.json({
            message: `Blog ${newStatus} successfully`,
            status: newStatus,
          })
        }
      )
    })
  }
)

// Categories API
app.get('/api/admin/categories', authenticateAdmin, (req, res) => {
  const query = `
    SELECT c.*, 
           parent.name as parent_name,
           COUNT(child.id) as children_count
    FROM categories c
    LEFT JOIN categories parent ON c.parent_id = parent.id
    LEFT JOIN categories child ON c.id = child.parent_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `

  db.all(query, [], async (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch categories' })
    }

    // Add category paths
    const categoriesWithPaths = await Promise.all(
      categories.map(async category => {
        let categoryPath = ''
        try {
          categoryPath = await buildCategoryPath(category.id, categories)
        } catch (pathErr) {
          console.error('Error building category path:', pathErr)
        }

        return {
          ...category,
          full_path: categoryPath,
          full_url: `/${categoryPath}`,
        }
      })
    )

    // Build hierarchical structure
    const categoryMap = {}
    const rootCategories = []

    categoriesWithPaths.forEach(category => {
      categoryMap[category.id] = { ...category, children: [] }
    })

    categoriesWithPaths.forEach(category => {
      if (category.parent_id) {
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(
            categoryMap[category.id]
          )
        }
      } else {
        rootCategories.push(categoryMap[category.id])
      }
    })

    res.json(rootCategories)
  })
})

app.get('/api/admin/categories/:id', authenticateAdmin, (req, res) => {
  const categoryId = req.params.id

  const query = `
    SELECT c.*, parent.name as parent_name
    FROM categories c
    LEFT JOIN categories parent ON c.parent_id = parent.id
    WHERE c.id = ?
  `

  db.get(query, [categoryId], (err, category) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch category' })
    }

    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json(category)
  })
})

app.post('/api/admin/categories', authenticateAdmin, (req, res) => {
  const { name, slug, description, parent_id, color } = req.body

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' })
  }

  const query = `
    INSERT INTO categories (name, slug, description, parent_id, color)
    VALUES (?, ?, ?, ?, ?)
  `

  db.run(
    query,
    [name, slug, description, parent_id || null, color || '#3B82F6'],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Category slug already exists' })
        }
        return res.status(500).json({ error: 'Failed to create category' })
      }

      res.json({ id: this.lastID, message: 'Category created successfully' })
    }
  )
})

app.put('/api/admin/categories/:id', authenticateAdmin, (req, res) => {
  const categoryId = req.params.id
  const { name, slug, description, parent_id, color } = req.body

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' })
  }

  const query = `
    UPDATE categories 
    SET name = ?, slug = ?, description = ?, parent_id = ?, color = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `

  db.run(
    query,
    [
      name,
      slug,
      description,
      parent_id || null,
      color || '#3B82F6',
      categoryId,
    ],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Category slug already exists' })
        }
        return res.status(500).json({ error: 'Failed to update category' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' })
      }

      res.json({ message: 'Category updated successfully' })
    }
  )
})

app.delete('/api/admin/categories/:id', authenticateAdmin, (req, res) => {
  const categoryId = req.params.id

  // Check if category has children
  db.get(
    'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
    [categoryId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'Failed to check category children' })
      }

      if (result.count > 0) {
        return res
          .status(400)
          .json({ error: 'Cannot delete category with subcategories' })
      }

      // Check if category has associated blogs
      db.get(
        'SELECT COUNT(*) as count FROM blogs WHERE category_id = ?',
        [categoryId],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Failed to check category usage' })
          }

          if (result.count > 0) {
            return res.status(400).json({
              error: `Cannot delete category. It is used by ${result.count} blog(s)`,
            })
          }

          // Delete category
          db.run(
            'DELETE FROM categories WHERE id = ?',
            [categoryId],
            function (err) {
              if (err) {
                return res
                  .status(500)
                  .json({ error: 'Failed to delete category' })
              }

              if (this.changes === 0) {
                return res.status(404).json({ error: 'Category not found' })
              }

              res.json({ message: 'Category deleted successfully' })
            }
          )
        }
      )
    }
  )
})

// Tags API
app.get('/api/admin/tags', authenticateAdmin, (req, res) => {
  const search = req.query.search || ''
  const featured = req.query.featured

  let whereConditions = []
  let params = []

  if (search) {
    whereConditions.push('(name LIKE ? OR description LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }

  if (featured === 'true') {
    whereConditions.push('is_featured = 1')
  } else if (featured === 'false') {
    whereConditions.push('is_featured = 0')
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  const query = `
    SELECT * FROM tags 
    ${whereClause}
    ORDER BY is_featured DESC, post_count DESC, name ASC
  `

  db.all(query, params, (err, tags) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tags' })
    }

    res.json(tags)
  })
})

app.get('/api/admin/tags/:id', authenticateAdmin, (req, res) => {
  const tagId = req.params.id

  db.get('SELECT * FROM tags WHERE id = ?', [tagId], (err, tag) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tag' })
    }

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    res.json(tag)
  })
})

app.post('/api/admin/tags', authenticateAdmin, (req, res) => {
  const { name, slug, description, color, is_featured } = req.body

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' })
  }

  const query = `
    INSERT INTO tags (name, slug, description, color, is_featured)
    VALUES (?, ?, ?, ?, ?)
  `

  db.run(
    query,
    [name, slug, description, color || '#10B981', is_featured ? 1 : 0],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Tag slug already exists' })
        }
        return res.status(500).json({ error: 'Failed to create tag' })
      }

      res.json({ id: this.lastID, message: 'Tag created successfully' })
    }
  )
})

app.put('/api/admin/tags/:id', authenticateAdmin, (req, res) => {
  const tagId = req.params.id
  const { name, slug, description, color, is_featured } = req.body

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' })
  }

  const query = `
    UPDATE tags 
    SET name = ?, slug = ?, description = ?, color = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `

  db.run(
    query,
    [name, slug, description, color || '#10B981', is_featured ? 1 : 0, tagId],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Tag slug already exists' })
        }
        return res.status(500).json({ error: 'Failed to update tag' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tag not found' })
      }

      res.json({ message: 'Tag updated successfully' })
    }
  )
})

app.delete('/api/admin/tags/:id', authenticateAdmin, (req, res) => {
  const tagId = req.params.id

  // Check if tag has associated blogs
  db.get(
    'SELECT COUNT(*) as count FROM blog_tags WHERE tag_id = ?',
    [tagId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check tag usage' })
      }

      if (result.count > 0) {
        return res.status(400).json({
          error: `Cannot delete tag. It is used by ${result.count} blog(s)`,
        })
      }

      // Delete tag
      db.run('DELETE FROM tags WHERE id = ?', [tagId], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete tag' })
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Tag not found' })
        }

        res.json({ message: 'Tag deleted successfully' })
      })
    }
  )
})

// ============= PUBLIC SEO API =============

// Public API to get SEO data for a specific page (no authentication required)
app.get('/api/seo/page', (req, res) => {
  const pagePath = req.query.path

  if (!pagePath) {
    return res.status(400).json({ error: 'Page path is required' })
  }

  const query = `
    SELECT * FROM seo_settings WHERE page_path = ?
  `

  db.get(query, [pagePath], (err, seo) => {
    if (err) {
      console.error('Error fetching page SEO:', err)
      return res.status(500).json({ error: 'Failed to fetch page SEO' })
    }

    res.json({ seo: seo || null })
  })
})

// Public API to get SEO data for pages (no authentication required)
app.get('/api/seo/pages', (req, res) => {
  const pagePath = req.query.page_path

  let query = `SELECT * FROM seo_settings`
  let params = []

  if (pagePath) {
    query += ` WHERE page_path = ?`
    params.push(pagePath)
  }

  query += ` ORDER BY page_path`

  db.all(query, params, (err, pages) => {
    if (err) {
      console.error('Error fetching SEO pages:', err)
      return res.status(500).json({ error: 'Failed to fetch SEO pages' })
    }

    res.json({ pages: pages || [] })
  })
})

// Public API to get global SEO settings (no authentication required)
app.get('/api/seo/global', (req, res) => {
  const query = `SELECT * FROM global_seo_settings ORDER BY id DESC LIMIT 1`

  db.get(query, [], (err, settings) => {
    if (err) {
      console.error('Error fetching global SEO settings:', err)
      // Return default settings as fallback
      const defaultGlobalSettings = {
        site_name: '99Group Gaming Platform',
        default_meta_title: '99Group - Premium Gaming Platform',
        default_meta_description:
          'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
        default_og_image: '/images/og-default.jpg',
        favicon_url: '/favicon.ico',
        robots_txt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://99group.games/sitemap.xml`,
        sitemap_url: '/sitemap.xml',
        google_analytics_id: '',
        google_search_console_id: '',
        twitter_site: '@99group',
        header_code: '',
        body_code: '',
        footer_code: '',
      }
      return res.json(defaultGlobalSettings)
    }

    // Return database settings or default if none exist
    if (settings) {
      res.json(settings)
    } else {
      const defaultGlobalSettings = {
        site_name: '99Group Gaming Platform',
        default_meta_title: '99Group - Premium Gaming Platform',
        default_meta_description:
          'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
        default_og_image: '/images/og-default.jpg',
        favicon_url: '/favicon.ico',
        robots_txt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://99group.games/sitemap.xml`,
        sitemap_url: '/sitemap.xml',
        google_analytics_id: '',
        google_search_console_id: '',
        twitter_site: '@99group',
        header_code: '',
        body_code: '',
        footer_code: '',
      }
      res.json(defaultGlobalSettings)
    }
  })
})

// ============= SEO SETTINGS API =============

// Get all page SEO settings
app.get('/api/admin/seo/pages', authenticateAdmin, (req, res) => {
  const search = req.query.search || ''

  let whereConditions = []
  let params = []

  if (search) {
    whereConditions.push(
      '(page_path LIKE ? OR page_title LIKE ? OR meta_title LIKE ?)'
    )
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  const query = `
    SELECT 
      id,
      page_path,
      page_title,
      meta_title,
      meta_description,
      canonical_url,
      schema_markup,
      og_title,
      og_description,
      og_image,
      twitter_title,
      twitter_description,
      twitter_image,
      robots_meta,
      keywords,
      created_at,
      updated_at
    FROM seo_settings 
    ${whereClause}
    ORDER BY created_at DESC
  `

  db.all(query, params, (err, pages) => {
    if (err) {
      console.error('Error fetching SEO pages:', err)
      return res.status(500).json({ error: 'Failed to fetch SEO pages' })
    }

    // Parse schema_markup JSON strings
    const processedPages = pages.map(page => ({
      ...page,
      schema_markup: page.schema_markup ? page.schema_markup : null,
    }))

    res.json({ pages: processedPages })
  })
})

// Get single page SEO settings
app.get('/api/admin/seo/pages/:id', authenticateAdmin, (req, res) => {
  const pageId = req.params.id

  const query = `
    SELECT * FROM seo_settings WHERE id = ?
  `

  db.get(query, [pageId], (err, page) => {
    if (err) {
      console.error('Error fetching SEO page:', err)
      return res.status(500).json({ error: 'Failed to fetch SEO page' })
    }

    if (!page) {
      return res.status(404).json({ error: 'SEO page not found' })
    }

    res.json(page)
  })
})

// Create new page SEO settings
app.post('/api/admin/seo/pages', authenticateAdmin, (req, res) => {
  const {
    page_path,
    page_title,
    meta_title,
    meta_description,
    canonical_url,
    schema_markup,
    og_title,
    og_description,
    og_image,
    twitter_title,
    twitter_description,
    twitter_image,
    robots_meta,
    keywords,
  } = req.body

  // Validate required fields - 只验证页面路径是必需的
  if (!page_path) {
    return res.status(400).json({
      error: 'Page path is required',
    })
  }

  // Validate schema markup JSON if provided
  if (schema_markup) {
    try {
      JSON.parse(schema_markup)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON in schema markup' })
    }
  }

  // Check for duplicate page_path
  db.get(
    'SELECT id FROM seo_settings WHERE page_path = ?',
    [page_path],
    (err, existing) => {
      if (err) {
        console.error('Error checking duplicate page path:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (existing) {
        return res.status(400).json({ error: 'Page path already exists' })
      }

      const query = `
      INSERT INTO seo_settings (
        page_path, page_title, meta_title, meta_description, canonical_url,
        schema_markup, og_title, og_description, og_image, twitter_title,
        twitter_description, twitter_image, robots_meta, keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

      db.run(
        query,
        [
          page_path,
          page_title,
          meta_title,
          meta_description,
          canonical_url,
          schema_markup,
          og_title,
          og_description,
          og_image,
          twitter_title,
          twitter_description,
          twitter_image,
          robots_meta || 'index, follow',
          keywords,
        ],
        function (err) {
          if (err) {
            console.error('Error creating SEO page:', err)
            return res.status(500).json({ error: 'Failed to create SEO page' })
          }

          // Fetch the created page
          db.get(
            'SELECT * FROM seo_settings WHERE id = ?',
            [this.lastID],
            (err, page) => {
              if (err) {
                console.error('Error fetching created SEO page:', err)
                return res
                  .status(500)
                  .json({ error: 'SEO page created but failed to fetch' })
              }

              res.status(201).json({
                message: 'SEO page created successfully',
                page: page,
              })
            }
          )
        }
      )
    }
  )
})

// Update page SEO settings
app.put('/api/admin/seo/pages/:id', authenticateAdmin, (req, res) => {
  console.log('PUT /api/admin/seo/pages/:id called with pageId:', req.params.id)
  console.log('Request body:', JSON.stringify(req.body, null, 2))
  console.log('Request body raw:', req.body)

  const pageId = req.params.id
  const {
    page_path,
    page_title,
    meta_title,
    meta_description,
    canonical_url,
    schema_markup,
    og_title,
    og_description,
    og_image,
    twitter_title,
    twitter_description,
    twitter_image,
    robots_meta,
    keywords,
  } = req.body

  // Validate required fields - 只验证页面路径是必需的
  if (!page_path) {
    return res.status(400).json({
      error: 'Page path is required',
    })
  }

  // Validate schema markup JSON if provided
  if (schema_markup) {
    try {
      JSON.parse(schema_markup)
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON in schema markup' })
    }
  }

  // Check if page exists
  db.get(
    'SELECT id FROM seo_settings WHERE id = ?',
    [pageId],
    (err, existing) => {
      if (err) {
        console.error('Error checking page existence:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (!existing) {
        return res.status(404).json({ error: 'SEO page not found' })
      }

      // Check for duplicate page_path (excluding current page)
      db.get(
        'SELECT id FROM seo_settings WHERE page_path = ? AND id != ?',
        [page_path, pageId],
        (err, duplicate) => {
          if (err) {
            console.error('Error checking duplicate page path:', err)
            return res.status(500).json({ error: 'Database error' })
          }

          if (duplicate) {
            return res.status(400).json({ error: 'Page path already exists' })
          }

          const query = `
        UPDATE seo_settings SET
          page_path = ?, page_title = ?, meta_title = ?, meta_description = ?, canonical_url = ?,
          schema_markup = ?, og_title = ?, og_description = ?, og_image = ?, twitter_title = ?,
          twitter_description = ?, twitter_image = ?, robots_meta = ?, keywords = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `

          db.run(
            query,
            [
              page_path,
              page_title,
              meta_title,
              meta_description,
              canonical_url,
              schema_markup,
              og_title,
              og_description,
              og_image,
              twitter_title,
              twitter_description,
              twitter_image,
              robots_meta || 'index, follow',
              keywords,
              pageId,
            ],
            function (err) {
              if (err) {
                console.error('Error updating SEO page:', err)
                return res
                  .status(500)
                  .json({ error: 'Failed to update SEO page' })
              }

              if (this.changes === 0) {
                return res.status(404).json({ error: 'SEO page not found' })
              }

              // Fetch the updated page
              console.log('SEO page updated, fetching updated data...')
              db.get(
                'SELECT * FROM seo_settings WHERE id = ?',
                [pageId],
                (err, page) => {
                  if (err) {
                    console.error('Error fetching updated SEO page:', err)
                    return res
                      .status(500)
                      .json({ error: 'SEO page updated but failed to fetch' })
                  }

                  console.log('Sending successful response:', {
                    message: 'SEO page updated successfully',
                    page,
                  })
                  res.json({
                    message: 'SEO page updated successfully',
                    page: page,
                  })
                }
              )
            }
          )
        }
      )
    }
  )
})

// Delete page SEO settings
app.delete('/api/admin/seo/pages/:id', authenticateAdmin, (req, res) => {
  const pageId = req.params.id

  db.run('DELETE FROM seo_settings WHERE id = ?', [pageId], function (err) {
    if (err) {
      console.error('Error deleting SEO page:', err)
      return res.status(500).json({ error: 'Failed to delete SEO page' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'SEO page not found' })
    }

    res.json({ message: 'SEO page deleted successfully' })
  })
})

// Global SEO Settings
app.get('/api/admin/seo/global', authenticateAdmin, (req, res) => {
  const query = `SELECT * FROM global_seo_settings ORDER BY id DESC LIMIT 1`

  db.get(query, [], (err, settings) => {
    if (err) {
      console.error('Error fetching global SEO settings:', err)
      return res
        .status(500)
        .json({ error: 'Failed to fetch global SEO settings' })
    }

    // Return database settings or default if none exist
    if (settings) {
      res.json(settings)
    } else {
      const defaultGlobalSettings = {
        site_name: '99Group Gaming Platform',
        default_meta_title: '99Group - Premium Gaming Platform',
        default_meta_description:
          'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
        default_og_image: '/images/og-default.jpg',
        favicon_url: '/favicon.ico',
        robots_txt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://99group.games/sitemap.xml`,
        sitemap_url: '/sitemap.xml',
        google_analytics_id: '',
        google_search_console_id: '',
        twitter_site: '@99group',
        header_code: '',
        body_code: '',
        footer_code: '',
      }
      res.json(defaultGlobalSettings)
    }
  })
})

app.put('/api/admin/seo/global', authenticateAdmin, (req, res) => {
  const {
    site_name,
    default_meta_title,
    default_meta_description,
    default_og_image,
    favicon_url,
    robots_txt,
    sitemap_url,
    google_analytics_id,
    google_search_console_id,
    twitter_site,
    header_code,
    body_code,
    footer_code,
    default_canonical_url,
    default_robots_meta,
    default_keywords,
    default_schema_markup,
  } = req.body

  // First check if global settings exist
  db.get(
    'SELECT id FROM global_seo_settings ORDER BY id DESC LIMIT 1',
    [],
    (err, existing) => {
      if (err) {
        console.error('Error checking global SEO settings:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (existing) {
        // Update existing settings
        const query = `
        UPDATE global_seo_settings SET
          site_name = ?, default_meta_title = ?, default_meta_description = ?,
          default_og_image = ?, favicon_url = ?, robots_txt = ?, sitemap_url = ?,
          google_analytics_id = ?, google_search_console_id = ?, twitter_site = ?,
          header_code = ?, body_code = ?, footer_code = ?,
          default_canonical_url = ?, default_robots_meta = ?, default_keywords = ?, default_schema_markup = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `

        db.run(
          query,
          [
            site_name,
            default_meta_title,
            default_meta_description,
            default_og_image,
            favicon_url,
            robots_txt,
            sitemap_url,
            google_analytics_id,
            google_search_console_id,
            twitter_site,
            header_code,
            body_code,
            footer_code,
            default_canonical_url,
            default_robots_meta,
            default_keywords,
            default_schema_markup,
            existing.id,
          ],
          function (err) {
            if (err) {
              console.error('Error updating global SEO settings:', err)
              return res
                .status(500)
                .json({ error: 'Failed to update global SEO settings' })
            }

            res.json({
              message: 'Global SEO settings updated successfully',
              settings: req.body,
            })
          }
        )
      } else {
        // Create new settings
        const query = `
        INSERT INTO global_seo_settings (
          site_name, default_meta_title, default_meta_description, default_og_image,
          favicon_url, robots_txt, sitemap_url, google_analytics_id,
          google_search_console_id, twitter_site, header_code, body_code, footer_code,
          default_canonical_url, default_robots_meta, default_keywords, default_schema_markup
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

        db.run(
          query,
          [
            site_name,
            default_meta_title,
            default_meta_description,
            default_og_image,
            favicon_url,
            robots_txt,
            sitemap_url,
            google_analytics_id,
            google_search_console_id,
            twitter_site,
            header_code,
            body_code,
            footer_code,
            default_canonical_url,
            default_robots_meta,
            default_keywords,
            default_schema_markup,
          ],
          function (err) {
            if (err) {
              console.error('Error creating global SEO settings:', err)
              return res
                .status(500)
                .json({ error: 'Failed to create global SEO settings' })
            }

            res.json({
              message: 'Global SEO settings created successfully',
              settings: req.body,
            })
          }
        )
      }
    }
  )
})

// Sync pages with SEO settings
app.post('/api/admin/seo/sync', authenticateAdmin, (req, res) => {
  const fs = require('fs')
  const path = require('path')

  try {
    // Function to scan Next.js app pages
    function scanAppPages() {
      const appDir = path.join(__dirname, 'src', 'app')
      const pages = []

      function scanDirectory(dir, basePath = '') {
        try {
          if (!fs.existsSync(dir)) return

          const items = fs.readdirSync(dir, { withFileTypes: true })

          for (const item of items) {
            const fullPath = path.join(dir, item.name)
            const relativePath = path.join(basePath, item.name)

            if (item.isDirectory()) {
              // Skip special directories
              if (
                item.name.startsWith('_') ||
                item.name === 'api' ||
                item.name === 'components' ||
                item.name.startsWith('.')
              ) {
                continue
              }

              scanDirectory(fullPath, relativePath)
            } else if (item.name === 'page.tsx' || item.name === 'page.js') {
              // Found a page file
              const routePath =
                basePath === '' ? '/' : `/${basePath.replace(/\\/g, '/')}`

              // Generate page title from path
              const pageTitle =
                basePath === ''
                  ? 'Home Page'
                  : basePath
                      .split(path.sep)
                      .map(segment => {
                        // Handle dynamic routes
                        if (segment.startsWith('[') && segment.endsWith(']')) {
                          return (
                            segment.slice(1, -1).charAt(0).toUpperCase() +
                            segment.slice(2, -1)
                          )
                        }
                        return (
                          segment.charAt(0).toUpperCase() + segment.slice(1)
                        )
                      })
                      .join(' - ')

              pages.push({
                page_path: routePath,
                page_title: pageTitle,
                file_path: fullPath,
                exists_in_seo: false,
              })
            }
          }
        } catch (error) {
          console.error(`Error scanning directory ${dir}:`, error)
        }
      }

      scanDirectory(appDir)
      return pages
    }

    // Scan for pages
    const discoveredPages = scanAppPages()

    // Get existing SEO pages
    const stmt = db.prepare(
      'SELECT * FROM seo_settings ORDER BY created_at DESC'
    )
    const existingPages = stmt.all()

    // Mark which pages already have SEO config
    const existingPaths = new Set(existingPages.map(p => p.page_path))

    discoveredPages.forEach(page => {
      page.exists_in_seo = existingPaths.has(page.page_path)
    })

    // Find new pages (not in SEO config)
    const newPages = discoveredPages.filter(page => !page.exists_in_seo)

    // Find orphaned SEO configs (SEO exists but page doesn't)
    const discoveredPaths = new Set(discoveredPages.map(p => p.page_path))
    const orphanedSeoPages = existingPages.filter(
      seoPage => !discoveredPaths.has(seoPage.page_path)
    )

    res.json({
      success: true,
      summary: {
        total_discovered: discoveredPages.length,
        existing_seo_configs: existingPages.length,
        new_pages: newPages.length,
        orphaned_configs: orphanedSeoPages.length,
      },
      discovered_pages: discoveredPages,
      new_pages: newPages,
      orphaned_configs: orphanedSeoPages,
    })
  } catch (error) {
    console.error('Error syncing pages:', error)
    res.status(500).json({ error: 'Failed to sync pages' })
  }
})

// Create SEO configurations for selected pages
app.put('/api/admin/seo/sync', authenticateAdmin, (req, res) => {
  const { pages_to_create } = req.body

  if (!Array.isArray(pages_to_create)) {
    return res.status(400).json({ error: 'Invalid pages data' })
  }

  const createdPages = []
  const errors = []

  try {
    const stmt = db.prepare(`
      INSERT INTO seo_settings (
        page_path, page_title, meta_title, meta_description, 
        canonical_url, schema_markup, og_title, og_description, og_image,
        twitter_title, twitter_description, twitter_image, robots_meta, keywords,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    for (const page of pages_to_create) {
      try {
        const result = stmt.run(
          page.page_path,
          page.page_title,
          `${page.page_title} - 99Group Gaming Platform`,
          `Experience ${page.page_title.toLowerCase()} on 99Group Gaming Platform. Premium gaming experience with secure environment.`,
          '', // canonical_url
          '', // schema_markup
          page.page_title, // og_title
          `Experience ${page.page_title.toLowerCase()} on 99Group Gaming Platform.`, // og_description
          '', // og_image
          page.page_title, // twitter_title
          `Experience ${page.page_title.toLowerCase()} on 99Group Gaming Platform.`, // twitter_description
          '', // twitter_image
          'index, follow', // robots_meta
          '' // keywords
        )

        createdPages.push({
          id: result.lastInsertRowid,
          page_path: page.page_path,
          page_title: page.page_title,
        })
      } catch (error) {
        errors.push({
          page_path: page.page_path,
          error: error.message,
        })
      }
    }

    res.json({
      success: true,
      created_count: createdPages.length,
      error_count: errors.length,
      created_pages: createdPages,
      errors: errors,
    })
  } catch (error) {
    console.error('Error creating SEO pages:', error)
    res.status(500).json({ error: 'Failed to create SEO pages' })
  }
})

// ============= MEDIA LIBRARY API =============

// Get all media files with filtering and pagination
app.get('/api/admin/media', authenticateAdmin, (req, res) => {
  const {
    page = 1,
    limit = 24,
    search = '',
    type = 'all',
    folder_id,
    date_range = 'all',
  } = req.query

  let whereConditions = []
  let params = []

  // Search filter
  if (search) {
    whereConditions.push(
      '(name LIKE ? OR original_name LIKE ? OR description LIKE ?)'
    )
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  // Type filter
  if (type !== 'all') {
    whereConditions.push('type = ?')
    params.push(type)
  }

  // Folder filter
  if (folder_id) {
    whereConditions.push('folder_id = ?')
    params.push(folder_id)
  } else if (folder_id === 'null') {
    whereConditions.push('folder_id IS NULL')
  }

  // Date range filter
  if (date_range !== 'all') {
    const now = new Date()
    let dateCondition = ''

    switch (date_range) {
      case 'today':
        dateCondition = "DATE(created_at) = DATE('now')"
        break
      case 'week':
        dateCondition = "created_at >= datetime('now', '-7 days')"
        break
      case 'month':
        dateCondition = "created_at >= datetime('now', '-30 days')"
        break
    }

    if (dateCondition) {
      whereConditions.push(dateCondition)
    }
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM media_files ${whereClause}`

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to count media files' })
    }

    const total = countResult.total
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit

    // Get paginated results
    const query = `
      SELECT mf.*, 
             mf.mime_type as file_type,
             mfd.name as folder_name
      FROM media_files mf
      LEFT JOIN media_folders mfd ON mf.folder_id = mfd.id
      ${whereClause}
      ORDER BY mf.created_at DESC
      LIMIT ? OFFSET ?
    `

    const queryParams = [...params, limit, offset]

    db.all(query, queryParams, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch media files' })
      }

      res.json({
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      })
    })
  })
})

// Get media folders - MUST be before /:id route
app.get('/api/admin/media/folders', authenticateAdmin, (req, res) => {
  const query = `
    SELECT mf.*, 
           COUNT(media.id) as file_count
    FROM media_folders mf
    LEFT JOIN media_files media ON mf.id = media.folder_id
    GROUP BY mf.id
    ORDER BY mf.created_at ASC
  `

  db.all(query, [], (err, folders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch folders' })
    }

    res.json(folders)
  })
})

// Create media folder - MUST be before /:id route
app.post('/api/admin/media/folders', authenticateAdmin, (req, res) => {
  const { name, parent_id } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Folder name is required' })
  }

  const query = `
    INSERT INTO media_folders (name, parent_id, created_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `

  db.run(query, [name, parent_id || null], function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Folder name already exists' })
      }
      return res.status(500).json({ error: 'Failed to create folder' })
    }

    res.json({
      id: this.lastID,
      message: 'Folder created successfully',
    })
  })
})

// Delete media folder - MUST be before /:id route
app.delete('/api/admin/media/folders/:id', authenticateAdmin, (req, res) => {
  const folderId = req.params.id

  // Check if folder has files
  db.get(
    'SELECT COUNT(*) as count FROM media_files WHERE folder_id = ?',
    [folderId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'Failed to check folder contents' })
      }

      if (result.count > 0) {
        return res.status(400).json({
          error: `Cannot delete folder. It contains ${result.count} file(s)`,
        })
      }

      // Delete the folder
      db.run(
        'DELETE FROM media_folders WHERE id = ?',
        [folderId],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete folder' })
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Folder not found' })
          }

          res.json({ message: 'Folder deleted successfully' })
        }
      )
    }
  )
})

// Get single media file
app.get('/api/admin/media/:id', authenticateAdmin, (req, res) => {
  const fileId = req.params.id

  const query = `
    SELECT mf.*, 
           mf.mime_type as file_type,
           mfd.name as folder_name
    FROM media_files mf
    LEFT JOIN media_folders mfd ON mf.folder_id = mfd.id
    WHERE mf.id = ?
  `

  db.get(query, [fileId], (err, file) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch media file' })
    }

    if (!file) {
      return res.status(404).json({ error: 'Media file not found' })
    }

    res.json(file)
  })
})

// Upload media files (requires multer middleware)
// multer, path, and fs are already imported at the top

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Use the existing mediaUpload configuration from above

app.post(
  '/api/admin/media/upload',
  authenticateAdmin,
  mediaUpload.array('files', 10),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const { folder_id, alt_text, description } = req.body
    const uploadedFiles = []

    const processFile = (file, index) => {
      return new Promise((resolve, reject) => {
        // Determine file type
        let fileType = 'document'
        if (file.mimetype.startsWith('image/')) {
          fileType = 'image'
        } else if (file.mimetype.startsWith('video/')) {
          fileType = 'video'
        } else if (file.mimetype.startsWith('audio/')) {
          fileType = 'audio'
        }

        // Create URL (you might want to configure this based on your domain)
        // Determine the correct file path based on file type
        let filePath = 'uploads/media/'
        if (file.mimetype.startsWith('image/')) {
          filePath += 'images/'
        } else if (file.mimetype.startsWith('video/')) {
          filePath += 'videos/'
        } else {
          filePath += 'documents/'
        }
        const fileUrl = `/uploads/media/${file.mimetype.startsWith('image/') ? 'images' : file.mimetype.startsWith('video/') ? 'videos' : 'documents'}/${file.filename}`

        // Get image dimensions for images (you might want to add sharp library for this)
        let dimensions = null
        // TODO: Add image dimension extraction using sharp or similar library

        const query = `
        INSERT INTO media_files (
          name, original_name, type, mime_type, size, url, 
          folder_id, uploaded_by, alt_text, description,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `

        db.run(
          query,
          [
            file.filename,
            file.originalname,
            fileType,
            file.mimetype,
            file.size,
            fileUrl,
            folder_id || null,
            req.admin.username,
            alt_text || null,
            description || null,
          ],
          function (err) {
            if (err) {
              reject(err)
            } else {
              uploadedFiles.push({
                id: this.lastID,
                name: file.filename,
                original_name: file.originalname,
                type: fileType,
                size: file.size,
                url: fileUrl,
              })
              resolve()
            }
          }
        )
      })
    }

    // Process all files
    Promise.all(req.files.map((file, index) => processFile(file, index)))
      .then(() => {
        res.json({
          message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
          files: uploadedFiles,
        })
      })
      .catch(err => {
        console.error('Error uploading files:', err)
        res.status(500).json({ error: 'Failed to upload files' })
      })
  }
)

// Update media file
app.put('/api/admin/media/:id', authenticateAdmin, (req, res) => {
  const fileId = req.params.id
  const { name, alt_text, description, folder_id } = req.body

  if (!name) {
    return res.status(400).json({ error: 'File name is required' })
  }

  const query = `
    UPDATE media_files 
    SET name = ?, alt_text = ?, description = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `

  db.run(
    query,
    [name, alt_text, description, folder_id || null, fileId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update media file' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Media file not found' })
      }

      res.json({ message: 'Media file updated successfully' })
    }
  )
})

// Delete media file
app.delete('/api/admin/media/:id', authenticateAdmin, (req, res) => {
  const fileId = req.params.id

  // First get the file info to delete the physical file
  db.get('SELECT * FROM media_files WHERE id = ?', [fileId], (err, file) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch media file' })
    }

    if (!file) {
      return res.status(404).json({ error: 'Media file not found' })
    }

    // Check if file is being used by blogs
    db.get(
      'SELECT COUNT(*) as count FROM blogs WHERE featured_image_id = ?',
      [fileId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to check file usage' })
        }

        if (result.count > 0) {
          return res.status(400).json({
            error: `Cannot delete file. It is being used by ${result.count} blog(s)`,
          })
        }

        // Delete the database record
        db.run(
          'DELETE FROM media_files WHERE id = ?',
          [fileId],
          function (err) {
            if (err) {
              return res
                .status(500)
                .json({ error: 'Failed to delete media file' })
            }

            // Try to delete the physical file
            const filePath = path.join(__dirname, file.url.replace(/^\//, ''))
            fs.unlink(filePath, fsErr => {
              if (fsErr) {
                console.error('Error deleting physical file:', fsErr)
                // Don't fail the request if physical file deletion fails
              }
            })

            res.json({ message: 'Media file deleted successfully' })
          }
        )
      }
    )
  })
})

app.listen(PORT, () => {
  console.log(`Enhanced Game platform server running on port ${PORT}`)
  console.log(`Visit: http://localhost:${PORT}`)
  console.log(`Admin panel: http://localhost:${PORT}/admin`)
  console.log('Default admin: admin/admin123')
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
