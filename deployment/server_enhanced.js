const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

// Game API Configuration
const GAME_CONFIG = {
  agency_uid: "45370b4f27dfc8a2875ba78d07e8a81a",
  aes_key: "08970240475e1255d2b4ac023ac658f3",
  player_prefix: "h4944d",
  server_url: "https://jsgame.live",
  initial_credit: 50
};

const JWT_SECRET = 'your-secret-key-change-in-production';

// Public Domain Configuration  
const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN || 'https://api.99group.games';

// Wallet Rules
const WALLET_RULES = {
  FREE_CREDIT_AMOUNT: 50.0,
  MIN_BALANCE_THRESHOLD: 0.1,
  WITHDRAWAL_THRESHOLD: 1000.0,
  WITHDRAWAL_AMOUNT: 50.0
};

// Ensure directories exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/kyc')) {
  fs.mkdirSync('uploads/kyc');
}

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/kyc/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and PDF files are allowed'));
    }
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Add headers for iframe embedding
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('Content-Security-Policy', "frame-ancestors 'self' *");
  next();
});

// Initialize SQLite Database with better error handling
const db = new sqlite3.Database('game_platform.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database successfully');
    // Enable WAL mode for better concurrency
    db.run('PRAGMA journal_mode=WAL;');
    db.run('PRAGMA synchronous=NORMAL;');
    db.run('PRAGMA cache_size=10000;');
    db.run('PRAGMA temp_store=memory;');
  }
});

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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    game_uid TEXT,
    session_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

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
  )`);

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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS kyc_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, key)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS captcha_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  )`);

  // Create default admin account
  db.get("SELECT COUNT(*) as count FROM admins", [], (err, row) => {
    if (!err && row.count === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT INTO admins (username, password, role) VALUES (?, ?, ?)`, 
        ['admin', hashedPassword, 'super_admin']);
      console.log('Default admin account created: admin/admin123');
    }
  });

  // Initialize default system settings
  db.get("SELECT COUNT(*) as count FROM system_settings", [], (err, row) => {
    if (!err && row.count === 0) {
      const defaultSettings = [
        ['wallet', 'initialBalance', '50.0'],
        ['wallet', 'freeCreditAmount', '50.0'],
        ['wallet', 'minBalanceThreshold', '0.1'],
        ['wallet', 'withdrawalThreshold', '1000.0'],
        ['wallet', 'withdrawalAmount', '50.0'],
        ['game', 'apiUrl', 'https://jsgame.live'],
        ['game', 'agencyUid', '45370b4f27dfc8a2875ba78d07e8a81a'],
        ['game', 'playerPrefix', 'h4944d'],
        ['game', 'aesKey', '08970240475e1255d2b4ac023ac658f3']
      ];
      
      const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (category, key, value) VALUES (?, ?, ?)');
      defaultSettings.forEach(setting => {
        stmt.run(setting);
      });
      stmt.finalize();
      console.log('Default system settings initialized');
    }
  });
});

// AES Encryption/Decryption functions
function aesEncrypt(text, key) {
  const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

function aesDecrypt(encryptedText, key) {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Demo game URL fallback function
function getDemoGameUrl(gameType, gameUid) {
  const demoUrls = {
    'Fish Game': {
      'e794bf5717aca371152df192341fe68b': 'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20goldfever&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      'e333695bcff28acdbecc641ae6ee2b23': 'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fishprize&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      'default': 'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20goldfever&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net'
    },
    'Slot Game': {
      '24da72b49b0dd0e5cbef9579d09d8981': 'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20olympgate&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      '4b1d7ffaf9f66e6152ea93a6d0e4215b': 'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net',
      'default': 'https://demo.pragmaticplay.net/gs2c/openGame.do?gameSymbol=vs20fruitsw&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fdemogamesfree.pragmaticplay.net'
    }
  };

  const typeUrls = demoUrls[gameType] || demoUrls['Slot Game'];
  return typeUrls[gameUid] || typeUrls.default;
}

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Admin JWT Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err || !admin.isAdmin) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }
    req.admin = admin;
    next();
  });
}

// Helper function to record game transaction
function recordTransaction(userId, type, amount, balanceBefore, balanceAfter, gameUid = null, description = '') {
  db.run(`INSERT INTO game_transactions (user_id, transaction_type, amount, balance_before, balance_after, game_uid, description) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, amount, balanceBefore, balanceAfter, gameUid, description]);
}

// Universal Game Provider Balance Query Response Format
function getProviderSpecificResponse(provider, user, playerAccount) {
  const balance = user.balance;
  
  // 通用标准格式 - 包含所有提供商可能需要的字段
  const universalResponse = {
    // 玩家账户 (多种命名方式)
    player_account: playerAccount,          // 标准格式
    accountName: playerAccount,             // JILI格式
    username: playerAccount,                // PG格式
    user_id: playerAccount,                 // PP格式
    userId: playerAccount,                  // NetEnt格式
    playerId: playerAccount,                // Evolution格式
    PlayerId: playerAccount,                // Microgaming格式
    
    // 余额信息 (多种格式和精度)
    balance: parseFloat(balance.toFixed(2)), // 标准美元格式
    Balance: parseFloat(balance.toFixed(2)), // 大写格式
    
    // 货币
    currency: 'USD',
    Currency: 'USD',                        // 大写格式
    
    // 状态 (多种格式)
    status: 0,                              // 数字状态 (JILI)
    success: true,                          // 布尔状态
    result: 'OK',                           // 字符串状态
    active: true,                           // 活跃状态
    
    // 错误处理 (多种格式)
    errorCode: 0,                           // 标准错误代码
    error_code: 0,                          // 下划线格式
    ErrorCode: 0,                           // 大写格式
    errorMessage: "Success",                // 错误消息
    ErrorDescription: "Success",            // Microgaming格式
    error: null,                            // 错误对象
    message: "Success",                     // 通用消息
    
    // 时间戳
    timestamp: Date.now()
  };

  // 提供商特定的微调
  switch (provider.toUpperCase()) {
    case 'JILI':
      // JILI使用数字状态码
      universalResponse.status = 0;
      break;
      
    case 'PG':
    case 'PRAGMATIC':
      // Pragmatic使用字符串状态
      universalResponse.status = 'success';
      break;
      
    case 'EVOLUTION':
      // Evolution需要更高精度
      universalResponse.balance = parseFloat(balance.toFixed(4));
      universalResponse.Balance = parseFloat(balance.toFixed(4));
      universalResponse.status = 'OK';
      break;
      
    case 'NETENT':
      // NetEnt使用大写状态
      universalResponse.status = 'SUCCESS';
      break;
      
    default:
      // 保持通用格式，适用于大多数提供商
      break;
  }

  console.log(`📤 Universal balance response for ${provider}:`, {
    player_account: playerAccount,
    balance: universalResponse.balance,
    status: universalResponse.status
  });
  
  return universalResponse;
}

// Universal Game Provider Callback Response Format
function getProviderCallbackResponse(provider, balance, transactionId) {
  // 通用标准格式 - 包含所有提供商可能需要的字段
  const universalResponse = {
    // 核心成功状态 (多种格式支持)
    status: 0,                              // 数字状态码 (0 = 成功)
    success: true,                          // 布尔成功标志
    result: 'OK',                           // 字符串结果状态
    response: 'OK',                         // 响应状态
    
    // 余额信息 (多种格式)
    balance: parseFloat(balance.toFixed(2)), // 标准美元格式
    Balance: parseFloat(balance.toFixed(2)), // 大写格式 (Microgaming)
    currency: 'USD',                        // 货币类型
    
    // 交易ID (多种命名方式)
    transaction_id: transactionId,          // 标准格式
    txn_id: transactionId,                  // PG格式
    transactionId: transactionId,           // 驼峰格式
    TransactionId: transactionId,           // 大写格式
    
    // 错误处理 (多种格式)
    errorCode: 0,                           // 标准错误代码
    error_code: 0,                          // 下划线格式
    ErrorCode: 0,                           // 大写格式
    errorMessage: "Success",                // 错误消息
    ErrorDescription: "Success",            // Microgaming格式
    error: null,                            // 错误对象
    message: "Success",                     // 通用消息
    
    // 时间戳
    timestamp: Date.now(),                  // Unix时间戳
    
    // 通用代码和消息
    code: 0,                                // 通用代码
    msg: "Success"                          // 简短消息
  };

  // 提供商特定的微调 (如果需要)
  switch (provider.toUpperCase()) {
    case 'JILI':
      // JILI可能需要特定字段
      universalResponse.accountName = transactionId;
      break;
      
    case 'EVOLUTION':
      // Evolution可能需要更高精度
      universalResponse.balance = parseFloat(balance.toFixed(4));
      universalResponse.Balance = parseFloat(balance.toFixed(4));
      break;
      
    case 'NETENT':
      // NetEnt使用大写状态
      universalResponse.status = 'SUCCESS';
      break;
      
    default:
      // 保持通用格式，适用于大多数提供商
      break;
  }

  console.log(`📤 Universal callback response for ${provider}:`, {
    balance: universalResponse.balance,
    status: universalResponse.status,
    success: universalResponse.success,
    transaction_id: universalResponse.transaction_id
  });
  
  return universalResponse;
}

// Helper function to get system settings
function getSystemSettings(callback) {
  db.all('SELECT category, key, value FROM system_settings', [], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    
    const settings = {
      wallet: {},
      game: {}
    };
    
    rows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      settings[row.category][row.key] = row.value;
    });
    
    callback(null, settings);
  });
}

// Helper function to update system setting
function updateSystemSetting(category, key, value, callback) {
  db.run('INSERT OR REPLACE INTO system_settings (category, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', 
    [category, key, value], callback);
}

// Captcha helper functions
function generateCaptchaCode() {
  // Generate 4-digit numeric captcha
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function storeCaptcha(sessionId, code, callback) {
  // Clean up expired captchas first
  db.run('DELETE FROM captcha_codes WHERE expires_at < CURRENT_TIMESTAMP', [], (err) => {
    if (err) {
      console.error('Error cleaning up captchas:', err);
    }
  });
  
  // Store new captcha (expires in 5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  db.run('INSERT INTO captcha_codes (session_id, code, expires_at) VALUES (?, ?, ?)',
    [sessionId, code, expiresAt], callback);
}

function verifyCaptcha(sessionId, userCode, callback) {
  db.get('SELECT code FROM captcha_codes WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1',
    [sessionId], (err, row) => {
      if (err) {
        return callback(err, false);
      }
      
      if (!row || row.code !== userCode) {
        return callback(null, false);
      }
      
      // Delete used captcha
      db.run('DELETE FROM captcha_codes WHERE session_id = ?', [sessionId], (deleteErr) => {
        if (deleteErr) {
          console.error('Error deleting used captcha:', deleteErr);
        }
      });
      
      callback(null, true);
    });
}

// Helper function to check and update wallet rules
function checkWalletRules(userId, newBalance, callback) {
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) return callback(err);
    
    let updateFields = [];
    let updateValues = [];
    
    getSystemSettings((settingsErr, settings) => {
      if (settingsErr) return callback(settingsErr);
      
      const minBalanceThreshold = parseFloat(settings.wallet.minBalanceThreshold || '0.1');
      const withdrawalThreshold = parseFloat(settings.wallet.withdrawalThreshold || '1000.0');
      
      // Check if balance falls below threshold - burn all free credit
      if (newBalance <= minBalanceThreshold && user.free_credit > 0) {
        updateFields.push('free_credit = 0');
        updateFields.push('balance = 0');
        newBalance = 0;
        recordTransaction(userId, 'BURN', user.balance, user.balance, 0, null, 'Balance burned - fell below minimum threshold');
      }
      
      // Check if total balance reaches withdrawal threshold
      if (newBalance >= withdrawalThreshold && !user.can_withdraw) {
        updateFields.push('can_withdraw = 1');
      }
      
      if (updateFields.length > 0) {
        updateFields.push('balance = ?');
        updateValues.push(newBalance);
        updateValues.push(userId);
        
        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        db.run(sql, updateValues, callback);
      } else {
        db.run(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, userId], callback);
      }
    });
  });
}

// Generate Captcha
app.get('/api/captcha/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  if (!sessionId || sessionId.length < 10) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }
  
  const captchaCode = generateCaptchaCode();
  
  storeCaptcha(sessionId, captchaCode, (err) => {
    if (err) {
      console.error('Error storing captcha:', err);
      return res.status(500).json({ error: 'Failed to generate captcha' });
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
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });
});

// User Registration
app.post('/api/register', (req, res) => {
  const { full_name, username, captcha, session_id } = req.body;

  if (!full_name || !username || !captcha || !session_id) {
    return res.status(400).json({ error: 'Full name, username, captcha, and session ID are required' });
  }

  if (full_name.trim().length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters long' });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  // Verify captcha first
  verifyCaptcha(session_id, captcha, (captchaErr, isValid) => {
    if (captchaErr) {
      console.error('Captcha verification error:', captchaErr);
      return res.status(500).json({ error: 'Captcha verification failed' });
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired captcha' });
    }

    // Get current system settings for wallet
    getSystemSettings((err, settings) => {
      if (err) {
        console.error('Error getting system settings:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }

      const initialBalance = parseFloat(settings.wallet.initialBalance || '50.0');
      const freeCreditAmount = parseFloat(settings.wallet.freeCreditAmount || '50.0');
      const playerPrefix = settings.game.playerPrefix || GAME_CONFIG.player_prefix;

      // Generate a random password for the user (they can change it later)
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(randomPassword, 10);
      const gameAccount = playerPrefix + Date.now();

      db.run('INSERT INTO users (full_name, username, password, game_account, balance, free_credit) VALUES (?, ?, ?, ?, ?, ?)', 
        [full_name.trim(), username.trim(), hashedPassword, gameAccount, initialBalance, freeCreditAmount], 
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: 'Registration failed' });
          }

          const userId = this.lastID;

          // Record initial credit transaction
          recordTransaction(userId, 'CREDIT', freeCreditAmount, 0, freeCreditAmount, null, 'Initial free credit');

          // Generate JWT token for immediate login
          const token = jwt.sign({ userId, username: username.trim() }, JWT_SECRET, { expiresIn: '7d' });

          res.status(201).json({ 
            message: 'Registration successful! You are now logged in.',
            token: token,
            user: {
              id: userId,
              full_name: full_name.trim(),
              username: username.trim(),
              gameAccount: gameAccount
            },
            initialCredit: freeCreditAmount,
            initialBalance: initialBalance,
            temporaryPassword: randomPassword // Send this so user knows their password
          });
        }
      );
    });
  });
});

// User Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        balance: user.balance,
        free_credit: user.free_credit,
        can_withdraw: user.can_withdraw,
        kyc_status: user.kyc_status
      } 
    });
  });
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username, role: admin.role, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      admin: { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role
      } 
    });
  });
});

// Get User Profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, username, game_account, balance, free_credit, total_wagered, total_won, can_withdraw, kyc_status, created_at FROM users WHERE id = ?', 
    [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  });
});

// Get User Balance
app.get('/api/balance', authenticateToken, (req, res) => {
  db.get('SELECT balance, free_credit, can_withdraw FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    getSystemSettings((settingsErr, settings) => {
      if (settingsErr) {
        return res.status(500).json({ error: 'Failed to get system settings' });
      }

      res.json({ 
        balance: user.balance, 
        free_credit: user.free_credit,
        can_withdraw: user.can_withdraw,
        withdrawal_threshold: parseFloat(settings.wallet.withdrawalThreshold || '1000.0'),
        withdrawal_amount: parseFloat(settings.wallet.withdrawalAmount || '50.0')
      });
    });
  });
});

// Launch Game
app.post('/api/game/launch', authenticateToken, async (req, res) => {
  const { game_uid } = req.body;

  if (!game_uid) {
    return res.status(400).json({ error: 'game_uid is required' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check minimum balance requirement (must be above wallet clear threshold)
    const MIN_GAME_BALANCE = 0.1; // $0.1 minimum to play (below this amount wallet gets cleared)
    if (user.balance < MIN_GAME_BALANCE) {
      return res.status(400).json({ 
        error: 'Insufficient balance', 
        message: `Minimum balance of $${MIN_GAME_BALANCE} required to play games. Current balance: $${user.balance.toFixed(2)}`,
        current_balance: user.balance,
        required_balance: MIN_GAME_BALANCE
      });
    }

    const timestamp = Date.now().toString();
    
    try {
      // Convert balance to cents for some game providers
      const balanceInCents = Math.floor(user.balance * 100);
      
      const payloadData = {
        timestamp: timestamp,
        agency_uid: GAME_CONFIG.agency_uid,
        member_account: user.game_account,
        game_uid: game_uid,
        credit_amount: user.balance.toFixed(2), // Ensure 2 decimal places
        currency_code: "USD",
        language: "en",
        home_url: PUBLIC_DOMAIN,
        platform: 1,
        callback_url: `${PUBLIC_DOMAIN}/api/game/callback`,
        balance_url: `${PUBLIC_DOMAIN}/api/game/balance`,
        wallet_url: `${PUBLIC_DOMAIN}/api/game/wallet`
      };

      console.log('User balance:', user.balance, 'Credit amount:', payloadData.credit_amount);

      const payloadString = JSON.stringify(payloadData);
      const encryptedPayload = aesEncrypt(payloadString, GAME_CONFIG.aes_key);

      const requestData = {
        agency_uid: GAME_CONFIG.agency_uid,
        timestamp: timestamp,
        payload: encryptedPayload
      };

      console.log('Game launch request:', requestData);

      const response = await axios.post(`${GAME_CONFIG.server_url}/game/v1`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('Game API Response:', response.data);

      if (response.data.code === 0 && response.data.payload && response.data.payload.game_launch_url) {
        // Save game session
        db.run('INSERT INTO game_sessions (user_id, game_uid, session_token) VALUES (?, ?, ?)', 
          [user.id, game_uid, timestamp]);

        res.json({
          success: true,
          game_url: response.data.payload.game_launch_url,
          session_token: timestamp
        });
      } else {
        throw new Error('Invalid API response');
      }

    } catch (error) {
      console.error('Game launch error:', error.message);
      
      // Fallback to demo game
      const gameInfo = getGameInfo(game_uid);
      const demoUrl = getDemoGameUrl(gameInfo.type, game_uid);
      
      res.json({
        success: true,
        game_url: demoUrl,
        session_token: timestamp,
        demo_mode: true
      });
    }
  });
});

// Game Balance Query API (for third-party games to check balance)
app.post('/api/game/balance', async (req, res) => {
  try {
    const { agency_uid, payload, timestamp } = req.body;

    console.log('🔍 Balance query request:', { agency_uid, timestamp });

    if (agency_uid !== GAME_CONFIG.agency_uid) {
      console.error('❌ Invalid agency UID:', agency_uid);
      return res.status(400).json({ code: 10002, msg: 'Invalid agency' });
    }

    const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key);
    const queryData = JSON.parse(decryptedPayload);

    console.log('🔍 Balance query data:', queryData);

    const { player_account } = queryData;

    db.get('SELECT * FROM users WHERE game_account = ?', [player_account], (err, user) => {
      if (err || !user) {
        console.error('❌ User not found:', player_account, err);
        return res.status(400).json({ code: 10004, msg: 'Player not found' });
      }

      const responsePayload = {
        balance: parseFloat(user.balance.toFixed(2)),
        currency: 'USD',
        player_account: player_account,
        status: 'active',
        errorCode: 0,
        errorMessage: 'No Error',
        timestamp: Date.now()
      };

      console.log('✅ Returning balance:', responsePayload);

      const encryptedResponse = aesEncrypt(JSON.stringify(responsePayload), GAME_CONFIG.aes_key);

      res.json({
        code: 0,
        msg: 'Success',
        payload: encryptedResponse
      });
    });

  } catch (error) {
    console.error('❌ Balance query error:', error);
    res.status(500).json({ code: 10005, msg: 'System error' });
  }
});

// Universal Game Provider API (supports JILI, PG, PP, etc.)
app.post('/api/game/wallet', async (req, res) => {
  try {
    const { agency_uid, payload, timestamp, provider } = req.body;

    console.log('🎮 Universal Wallet API request:', { agency_uid, provider, timestamp });

    if (agency_uid !== GAME_CONFIG.agency_uid) {
      return res.status(400).json({ code: 10002, msg: 'Invalid agency' });
    }

    const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key);
    const queryData = JSON.parse(decryptedPayload);

    console.log('🎮 Wallet query data:', queryData);

    const { player_account } = queryData;

    db.get('SELECT * FROM users WHERE game_account = ?', [player_account], (err, user) => {
      if (err || !user) {
        console.error('❌ Player not found for wallet query:', player_account);
        return res.status(400).json({ code: 10004, msg: 'Player not found' });
      }

      // Standard response format that works for all providers
      const responsePayload = getProviderSpecificResponse(provider || 'STANDARD', user, player_account);

      console.log('🎮 Provider response:', { provider: provider || 'STANDARD', responsePayload });

      const encryptedResponse = aesEncrypt(JSON.stringify(responsePayload), GAME_CONFIG.aes_key);

      res.json({
        code: 0,
        msg: 'Success',
        payload: encryptedResponse
      });
    });

  } catch (error) {
    console.error('❌ Universal Wallet error:', error);
    res.status(500).json({ code: 10005, msg: 'System error' });
  }
});

// Game Player Status API (for third-party games to verify player)
app.post('/api/game/player/status', async (req, res) => {
  try {
    const { agency_uid, payload, timestamp } = req.body;

    console.log('🔍 Player status query:', { agency_uid, timestamp });

    if (agency_uid !== GAME_CONFIG.agency_uid) {
      return res.status(400).json({ code: 10002, msg: 'Invalid agency' });
    }

    const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key);
    const queryData = JSON.parse(decryptedPayload);

    const { player_account } = queryData;

    db.get('SELECT * FROM users WHERE game_account = ?', [player_account], (err, user) => {
      if (err || !user) {
        console.error('❌ Player not found:', player_account);
        return res.status(400).json({ code: 10004, msg: 'Player not found' });
      }

      const responsePayload = {
        player_account: player_account,
        balance: parseFloat(user.balance.toFixed(2)),
        currency: 'USD',
        status: 'active',
        can_bet: user.balance >= 0.1, // Must meet minimum game balance
        min_bet: 0.01,
        max_bet: Math.max(user.balance, 0),
        errorCode: 0,
        errorMessage: 'No Error',
        timestamp: Date.now()
      };

      console.log('✅ Player status:', responsePayload);

      const encryptedResponse = aesEncrypt(JSON.stringify(responsePayload), GAME_CONFIG.aes_key);

      res.json({
        code: 0,
        msg: 'Success',
        payload: encryptedResponse
      });
    });

  } catch (error) {
    console.error('❌ Player status error:', error);
    res.status(500).json({ code: 10005, msg: 'System error' });
  }
});

// Universal Game Callback Handler (supports all providers)
app.post('/api/game/callback', async (req, res) => {
  try {
    let gameData;
    let detectedProvider = 'STANDARD';

    console.log('Game callback request:', req.body);

    // Check if request is encrypted format (with agency_uid and payload) or direct JSON
    if (req.body.agency_uid && req.body.payload) {
      // Encrypted format (original implementation)
      const { agency_uid, payload, timestamp, provider } = req.body;

      console.log('Encrypted callback request:', { agency_uid, timestamp, provider });

      if (agency_uid !== GAME_CONFIG.agency_uid) {
        return res.status(400).json({ code: 10002, msg: 'Invalid agency' });
      }

      const decryptedPayload = aesDecrypt(payload, GAME_CONFIG.aes_key);
      const rawGameData = JSON.parse(decryptedPayload);
      
      // Map different field names to our standard format (same as direct JSON)
      gameData = {
        player_account: rawGameData.member_account || rawGameData.player_account,
        bet_amount: parseFloat(rawGameData.bet_amount || 0),
        win_amount: parseFloat(rawGameData.win_amount || 0),
        transaction_id: rawGameData.serial_number || rawGameData.transaction_id,
        action_type: rawGameData.action_type || (rawGameData.bet_amount > 0 ? 'bet' : 'win'),
        game_uid: rawGameData.game_uid,
        game_round: rawGameData.game_round,
        currency_code: rawGameData.currency_code || 'USD',
        timestamp: rawGameData.timestamp
      };
      
      detectedProvider = provider || 'JILI';

    } else {
      // Direct JSON format (for game providers that don't use encryption)
      console.log('Direct JSON callback request:', req.body);
      
      // Map different field names to our standard format
      gameData = {
        player_account: req.body.member_account || req.body.player_account,
        bet_amount: parseFloat(req.body.bet_amount || 0),
        win_amount: parseFloat(req.body.win_amount || 0),
        transaction_id: req.body.serial_number || req.body.transaction_id,
        action_type: req.body.action_type || (req.body.bet_amount > 0 ? 'bet' : 'win'),
        game_uid: req.body.game_uid,
        game_round: req.body.game_round,
        currency_code: req.body.currency_code || 'USD',
        timestamp: req.body.timestamp
      };
      
      // Detect provider based on request format
      if (req.body.member_account && req.body.serial_number) {
        detectedProvider = 'JILI';
      }
    }

    console.log('Processed game callback data:', gameData);

    const { player_account, bet_amount, win_amount, transaction_id, action_type } = gameData;

    console.log('🔍 Looking for player:', player_account, 'at', new Date().toISOString());
    
    // Database query with retry mechanism for SQLITE_BUSY errors
    const queryWithRetry = (query, params, callback, retries = 3) => {
      db.get(query, params, (err, result) => {
        if (err && err.code === 'SQLITE_BUSY' && retries > 0) {
          console.log(`⚠️ Database busy, retrying... (${3 - retries + 1}/3)`);
          setTimeout(() => queryWithRetry(query, params, callback, retries - 1), 100);
          return;
        }
        callback(err, result);
      });
    };
    
    queryWithRetry('SELECT * FROM users WHERE game_account = ?', [player_account], (err, user) => {
      if (err) {
        console.error('❌ CALLBACK ERROR - Database error:', {
          player_account: player_account,
          error: err.message,
          error_code: err.code,
          timestamp: new Date().toISOString(),
          request_body: req.body
        });
        return res.status(500).json({ code: 10005, msg: 'Database error: ' + err.message });
      }
      
      if (!user) {
        console.error('❌ CALLBACK ERROR - Player not found:', {
          player_account: player_account,
          timestamp: new Date().toISOString(),
          request_body: req.body
        });
        return res.status(400).json({ code: 10004, msg: 'Player not found' });
      }
      
      console.log('✅ Player found successfully:', player_account, 'Balance:', user.balance);

      const currentBalance = user.balance;
      let newBalance = currentBalance;
      let responseCode = 0;
      let responseMsg = 'Success';

      // Correct logic: if current balance >= bet amount, allow transaction and process normally
      // Otherwise, return error code
      if (action_type === 'bet' || (bet_amount && bet_amount > 0)) {
        if (currentBalance >= bet_amount) {
          // Allow transaction: balance = balance - bet + win
          newBalance = currentBalance - bet_amount;
          recordTransaction(user.id, 'BET', -bet_amount, currentBalance, newBalance, gameData.game_uid, `Bet: ${transaction_id}`);
          console.log(`Bet processed (balance sufficient): ${bet_amount}, balance: ${currentBalance} -> ${newBalance}`);
          responseCode = 0;
          responseMsg = 'Success';
        } else {
          // Balance < bet amount: return error code with current balance (no deduction)
          console.log('Insufficient balance for bet:', { currentBalance, bet_amount, player_account });
          responseCode = 1;
          responseMsg = 'Insufficient balance';
          
          const errorPayload = {
            balance: currentBalance,
            transaction_id: transaction_id,
            error: 'Insufficient balance',
            status: responseCode,
            success: false
          };
          
          // Check if this is a JILI provider request (encrypted format)
          if (detectedProvider === 'JILI' || (req.body.agency_uid && req.body.payload)) {
            // JILI API compliant error response format
            const jiliErrorPayload = {
              credit_amount: "0.00",
              timestamp: Date.now().toString()
            };
            
            const encryptedResponse = aesEncrypt(JSON.stringify(jiliErrorPayload), GAME_CONFIG.aes_key);
            
            return res.json({
              code: responseCode,
              msg: responseMsg,
              payload: encryptedResponse
            });
          } else {
            const encryptedResponse = aesEncrypt(JSON.stringify(errorPayload), GAME_CONFIG.aes_key);
            
            return res.json({
              code: responseCode,
              msg: responseMsg,
              payload: encryptedResponse
            });
          }
        }
      }

      if (action_type === 'win' || (win_amount && win_amount > 0)) {
        newBalance += win_amount;
        recordTransaction(user.id, 'WIN', win_amount, newBalance - win_amount, newBalance, gameData.game_uid, `Win: ${transaction_id}`);
        console.log(`Win processed: ${win_amount}, new balance: ${newBalance}`);
      }

      // Handle refund/cancel
      if (action_type === 'refund' && bet_amount && bet_amount > 0) {
        newBalance += bet_amount;
        recordTransaction(user.id, 'REFUND', bet_amount, newBalance - bet_amount, newBalance, gameData.game_uid, `Refund: ${transaction_id}`);
        console.log(`Refund processed: ${bet_amount}, new balance: ${newBalance}`);
      }

      // Update wagered and won totals
      db.run('UPDATE users SET total_wagered = total_wagered + ?, total_won = total_won + ? WHERE id = ?',
        [bet_amount || 0, win_amount || 0, user.id]);

      // Check wallet rules and update balance
      checkWalletRules(user.id, newBalance, (err) => {
        if (err) {
          console.error('Wallet rules error:', err);
          return res.status(500).json({ code: 10005, msg: 'System error' });
        }

        // 使用之前检测到的提供商类型
        // detectedProvider 已在请求解析时设置

        // Check if this is a JILI provider request (encrypted format)
        if (detectedProvider === 'JILI' || (req.body.agency_uid && req.body.payload)) {
          // JILI API compliant response format
          const jiliResponsePayload = {
            credit_amount: newBalance.toFixed(2),
            timestamp: Date.now().toString()
          };
          
          console.log('JILI Response payload:', jiliResponsePayload);
          
          const encryptedResponse = aesEncrypt(JSON.stringify(jiliResponsePayload), GAME_CONFIG.aes_key);

          res.json({
            code: responseCode,
            msg: responseMsg,
            payload: encryptedResponse
          });
        } else {
          // Standard response for direct JSON callbacks
          const responsePayload = getProviderCallbackResponse(detectedProvider, newBalance, transaction_id);
          
          console.log('Detected provider:', detectedProvider, 'Response format:', Object.keys(responsePayload));

          console.log('Callback response:', responsePayload);

          const encryptedResponse = aesEncrypt(JSON.stringify(responsePayload), GAME_CONFIG.aes_key);

          res.json({
            code: responseCode,
            msg: responseMsg,
            payload: encryptedResponse
          });
        }
      });
    });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ code: 10005, msg: 'System error' });
  }
});

// KYC Document Upload (Simplified - ID Front & Back only)
app.post('/api/kyc/upload', authenticateToken, upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 }
]), (req, res) => {
  const userId = req.user.userId;
  const files = req.files;
  
  if (!files || !files.id_front || !files.id_back) {
    return res.status(400).json({ error: 'Both ID front and back images are required' });
  }

  // Save document records
  const documentPromises = [];
  
  Object.keys(files).forEach(fieldname => {
    const file = files[fieldname][0];
    documentPromises.push(
      new Promise((resolve, reject) => {
        db.run('INSERT INTO kyc_documents (user_id, document_type, file_path) VALUES (?, ?, ?)',
          [userId, fieldname, file.path], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      })
    );
  });

  Promise.all(documentPromises)
    .then(() => {
      // Update user KYC status
      db.run('UPDATE users SET kyc_status = ? WHERE id = ?', ['submitted', userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update KYC status' });
        }
        
        res.json({ 
          message: 'KYC documents uploaded successfully',
          status: 'submitted'
        });
      });
    })
    .catch(err => {
      console.error('KYC upload error:', err);
      res.status(500).json({ error: 'Failed to save documents' });
    });
});

// Submit Withdrawal Request
app.post('/api/withdrawal/request', authenticateToken, (req, res) => {
  const { bank_details } = req.body;
  const userId = req.user.userId;

  if (!bank_details) {
    return res.status(400).json({ error: 'Bank details are required' });
  }

  getSystemSettings((settingsErr, settings) => {
    if (settingsErr) {
      return res.status(500).json({ error: 'Failed to get system settings' });
    }

    const withdrawalThreshold = parseFloat(settings.wallet.withdrawalThreshold || '1000.0');
    const withdrawalAmount = parseFloat(settings.wallet.withdrawalAmount || '50.0');

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check withdrawal eligibility
      if (!user.can_withdraw) {
        return res.status(400).json({ 
          error: `You need to reach $${withdrawalThreshold} total balance to withdraw` 
        });
      }

      if (user.balance < withdrawalAmount) {
        return res.status(400).json({ 
          error: `Insufficient balance. You can withdraw $${withdrawalAmount}` 
        });
      }

    if (user.kyc_status !== 'approved') {
      return res.status(400).json({ 
        error: 'KYC verification required. Please complete KYC first.' 
      });
    }

    // Create withdrawal request
    db.run('INSERT INTO withdrawals (user_id, amount, bank_details) VALUES (?, ?, ?)',
      [userId, withdrawalAmount, JSON.stringify(bank_details)], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create withdrawal request' });
        }

        res.json({
          message: 'Withdrawal request submitted successfully',
          withdrawal_id: this.lastID,
          amount: withdrawalAmount,
          status: 'pending'
        });
      });
    });
  });
});

// Get Withdrawal History
app.get('/api/withdrawal/history', authenticateToken, (req, res) => {
  db.all('SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC', 
    [req.user.userId], (err, withdrawals) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ withdrawals });
    });
});

// Get Transaction History
app.get('/api/transactions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM game_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', 
    [req.user.userId], (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ transactions });
    });
});

// Admin Routes

// Get All Users (Admin)
// Get all users with pagination and search
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  let params = [];
  
  if (search) {
    whereClause = 'WHERE username LIKE ? OR game_account LIKE ? OR id = ?';
    params = [`%${search}%`, `%${search}%`, search];
  }
  
  // Get total count
  db.get(`SELECT COUNT(*) as total FROM users ${whereClause}`, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get users with pagination
    const sql = `SELECT id, username, game_account, balance, free_credit, total_wagered, total_won, 
                 can_withdraw, kyc_status, created_at, 
                 (SELECT COUNT(*) FROM game_transactions WHERE user_id = users.id) as total_transactions
                 FROM users ${whereClause} 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`;
    
    const queryParams = search ? [...params, limit, offset] : [limit, offset];
    
    db.all(sql, queryParams, (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ 
        users,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Get single user details
app.get('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id;
  
  db.get(`SELECT id, username, game_account, balance, free_credit, total_wagered, total_won, 
          can_withdraw, kyc_status, created_at FROM users WHERE id = ?`, 
    [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get user's transactions
      db.all(`SELECT * FROM game_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
        [userId], (err, transactions) => {
          if (err) {
            console.error('Error fetching transactions:', err);
            transactions = [];
          }
          
          // Get user's withdrawals
          db.all(`SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC`,
            [userId], (err, withdrawals) => {
              if (err) {
                console.error('Error fetching withdrawals:', err);
                withdrawals = [];
              }
              
              // Get user's KYC documents
              db.all(`SELECT * FROM kyc_documents WHERE user_id = ? ORDER BY created_at DESC`,
                [userId], (err, kycDocuments) => {
                  if (err) {
                    console.error('Error fetching KYC documents:', err);
                    kycDocuments = [];
                  }
                  
                  res.json({
                    user,
                    transactions,
                    withdrawals,
                    kycDocuments
                  });
                });
            });
        });
    });
});

// Update user
app.put('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id;
  const { balance, free_credit, can_withdraw, kyc_status } = req.body;
  
  // Validate input
  if (balance !== undefined && balance < 0) {
    return res.status(400).json({ error: 'Balance cannot be negative' });
  }
  
  if (free_credit !== undefined && free_credit < 0) {
    return res.status(400).json({ error: 'Free credit cannot be negative' });
  }
  
  if (kyc_status && !['pending', 'submitted', 'approved', 'rejected'].includes(kyc_status)) {
    return res.status(400).json({ error: 'Invalid KYC status' });
  }
  
  // Build update query dynamically
  const updateFields = [];
  const updateValues = [];
  
  if (balance !== undefined) {
    updateFields.push('balance = ?');
    updateValues.push(balance);
  }
  
  if (free_credit !== undefined) {
    updateFields.push('free_credit = ?');
    updateValues.push(free_credit);
  }
  
  if (can_withdraw !== undefined) {
    updateFields.push('can_withdraw = ?');
    updateValues.push(can_withdraw ? 1 : 0);
  }
  
  if (kyc_status !== undefined) {
    updateFields.push('kyc_status = ?');
    updateValues.push(kyc_status);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updateValues.push(userId);
  
  const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(sql, updateValues, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Record admin action if balance was changed
    if (balance !== undefined) {
      recordTransaction(userId, 'ADMIN_ADJUST', balance, 0, balance, null, `Admin balance adjustment by ${req.admin.username}`);
    }
    
    res.json({ message: 'User updated successfully' });
  });
});

// Delete user (soft delete - mark as inactive)
app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id;
  
  // Check if user exists and get current data
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Instead of hard delete, we'll mark user as inactive and archive data
    const archivedUsername = `deleted_${user.username}_${Date.now()}`;
    
    db.run('UPDATE users SET username = ?, balance = 0, free_credit = 0, can_withdraw = 0, kyc_status = ? WHERE id = ?',
      [archivedUsername, 'deleted', userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete user' });
        }
        
        // Record deletion transaction
        recordTransaction(userId, 'ADMIN_DELETE', 0, user.balance, 0, null, `User deleted by admin ${req.admin.username}`);
        
        res.json({ message: 'User deleted successfully' });
      });
  });
});

// Create new user (admin only)
app.post('/api/admin/users', authenticateAdmin, (req, res) => {
  const { username, password, initial_balance, initial_credit } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  // Get system settings for defaults
  getSystemSettings((err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get system settings' });
    }
    
    const balance = initial_balance !== undefined ? initial_balance : parseFloat(settings.wallet.initialBalance || '50.0');
    const credit = initial_credit !== undefined ? initial_credit : parseFloat(settings.wallet.freeCreditAmount || '50.0');
    const playerPrefix = settings.game.playerPrefix || 'h4944d';
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const gameAccount = `${playerPrefix}_admin_${Date.now()}`;
    
    db.run('INSERT INTO users (username, password, game_account, balance, free_credit) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, gameAccount, balance, credit], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        const userId = this.lastID;
        
        // Record initial credit transaction
        if (credit > 0) {
          recordTransaction(userId, 'ADMIN_CREATE', credit, 0, credit, null, `User created by admin ${req.admin.username}`);
        }
        
        res.status(201).json({
          message: 'User created successfully',
          userId: userId,
          username: username,
          gameAccount: gameAccount,
          initialBalance: balance,
          initialCredit: credit
        });
      });
  });
});

// Get All Withdrawals (Admin)
app.get('/api/admin/withdrawals', authenticateAdmin, (req, res) => {
  db.all(`SELECT w.*, u.username, u.game_account 
          FROM withdrawals w 
          JOIN users u ON w.user_id = u.id 
          ORDER BY w.created_at DESC`, 
    [], (err, withdrawals) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ withdrawals });
    });
});

// Process Withdrawal (Admin)
app.post('/api/admin/withdrawal/:id/process', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { action, admin_notes, attachments } = req.body; // action: 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Use approve or reject' });
  }

  db.get('SELECT w.*, u.balance FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.id = ?', 
    [id], (err, withdrawal) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!withdrawal) {
        return res.status(404).json({ error: 'Withdrawal not found' });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({ error: 'Withdrawal already processed' });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const attachmentsJson = JSON.stringify(attachments || []);

      db.run('UPDATE withdrawals SET status = ?, admin_notes = ?, attachments = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, admin_notes, attachmentsJson, id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update withdrawal' });
          }

          // If approved, deduct amount from user balance
          if (action === 'approve') {
            const newBalance = withdrawal.balance - withdrawal.amount;
            db.run('UPDATE users SET balance = ? WHERE id = ?', [newBalance, withdrawal.user_id], (err) => {
              if (err) {
                console.error('Failed to update user balance:', err);
              } else {
                recordTransaction(withdrawal.user_id, 'WITHDRAWAL', -withdrawal.amount, 
                  withdrawal.balance, newBalance, null, `Withdrawal approved: ${id}`);
              }
            });
          }

          res.json({
            message: `Withdrawal ${action}d successfully`,
            withdrawal_id: id,
            status: newStatus
          });
        });
    });
});

// Get KYC Documents (Admin)
app.get('/api/admin/kyc', authenticateAdmin, (req, res) => {
  db.all(`SELECT k.*, u.username, u.kyc_status 
          FROM kyc_documents k 
          JOIN users u ON k.user_id = u.id 
          ORDER BY k.created_at DESC`, 
    [], (err, documents) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ documents });
    });
});

// Process KYC (Admin)
app.post('/api/admin/kyc/:userId/process', authenticateAdmin, (req, res) => {
  const { userId } = req.params;
  const { action, admin_notes } = req.body; // action: 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Use approve or reject' });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  db.run('UPDATE users SET kyc_status = ? WHERE id = ?', [newStatus, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update KYC status' });
    }

    // Update all documents for this user
    db.run('UPDATE kyc_documents SET status = ?, admin_notes = ? WHERE user_id = ?',
      [newStatus, admin_notes, userId], (err) => {
        if (err) {
          console.error('Failed to update KYC documents:', err);
        }
      });

    res.json({
      message: `KYC ${action}d successfully`,
      user_id: userId,
      status: newStatus
    });
  });
});

// Admin Settings APIs

// Get system settings
app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
  getSystemSettings((err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to get settings' });
    }
    
    // Convert string values to appropriate types
    const walletSettings = {
      initialBalance: parseFloat(settings.wallet.initialBalance || '50.0'),
      freeCreditAmount: parseFloat(settings.wallet.freeCreditAmount || '50.0'),
      minBalanceThreshold: parseFloat(settings.wallet.minBalanceThreshold || '0.1'),
      withdrawalThreshold: parseFloat(settings.wallet.withdrawalThreshold || '1000.0'),
      withdrawalAmount: parseFloat(settings.wallet.withdrawalAmount || '50.0')
    };
    
    const gameSettings = {
      apiUrl: settings.game.apiUrl || 'https://jsgame.live',
      agencyUid: settings.game.agencyUid || '45370b4f27dfc8a2875ba78d07e8a81a',
      playerPrefix: settings.game.playerPrefix || 'h4944d',
      aesKey: settings.game.aesKey || '08970240475e1255d2b4ac023ac658f3'
    };
    
    res.json({
      wallet: walletSettings,
      game: gameSettings
    });
  });
});

// Update wallet settings
app.post('/api/admin/settings/wallet', authenticateAdmin, (req, res) => {
  const { initialBalance, freeCreditAmount, minBalanceThreshold, withdrawalThreshold, withdrawalAmount } = req.body;
  
  // Validate input
  if (initialBalance < 0 || freeCreditAmount < 0 || minBalanceThreshold < 0 || 
      withdrawalThreshold < 0 || withdrawalAmount < 0) {
    return res.status(400).json({ error: 'All values must be non-negative' });
  }
  
  const updates = [
    ['wallet', 'initialBalance', initialBalance.toString()],
    ['wallet', 'freeCreditAmount', freeCreditAmount.toString()],
    ['wallet', 'minBalanceThreshold', minBalanceThreshold.toString()],
    ['wallet', 'withdrawalThreshold', withdrawalThreshold.toString()],
    ['wallet', 'withdrawalAmount', withdrawalAmount.toString()]
  ];
  
  let completed = 0;
  let hasError = false;
  
  updates.forEach(([category, key, value]) => {
    updateSystemSetting(category, key, value, (err) => {
      if (err && !hasError) {
        hasError = true;
        return res.status(500).json({ error: 'Failed to update wallet settings' });
      }
      
      completed++;
      if (completed === updates.length && !hasError) {
        res.json({ message: 'Wallet settings updated successfully' });
      }
    });
  });
});

// Update game settings
app.post('/api/admin/settings/game', authenticateAdmin, (req, res) => {
  const { apiUrl, agencyUid, playerPrefix } = req.body;
  
  // Validate input
  if (!apiUrl || !agencyUid || !playerPrefix) {
    return res.status(400).json({ error: 'All game settings are required' });
  }
  
  const updates = [
    ['game', 'apiUrl', apiUrl],
    ['game', 'agencyUid', agencyUid],
    ['game', 'playerPrefix', playerPrefix]
  ];
  
  let completed = 0;
  let hasError = false;
  
  updates.forEach(([category, key, value]) => {
    updateSystemSetting(category, key, value, (err) => {
      if (err && !hasError) {
        hasError = true;
        return res.status(500).json({ error: 'Failed to update game settings' });
      }
      
      completed++;
      if (completed === updates.length && !hasError) {
        res.json({ message: 'Game settings updated successfully' });
      }
    });
  });
});

// Test game API connection
app.post('/api/admin/settings/test-game-api', authenticateAdmin, async (req, res) => {
  const { apiUrl } = req.body;
  
  if (!apiUrl) {
    return res.status(400).json({ error: 'API URL is required' });
  }
  
  try {
    // Simple connectivity test - try to reach the API
    const response = await axios.get(apiUrl, { timeout: 5000 });
    
    res.json({ 
      success: true, 
      message: 'Game API is reachable',
      status: response.status
    });
  } catch (error) {
    console.error('Game API test failed:', error.message);
    
    res.json({ 
      success: false, 
      message: 'Game API is not reachable',
      error: error.message
    });
  }
});

// Get available games
app.get('/api/games', (req, res) => {
  const fishGames = [
    { name: "Royal Fishing", game_uid: "e794bf5717aca371152df192341fe68b", type: "Fish Game", code: 1 },
    { name: "Bombing Fishing", game_uid: "e333695bcff28acdbecc641ae6ee2b23", type: "Fish Game", code: 20 },
    { name: "Dinosaur Tycoon", game_uid: "eef3e28f0e3e7b72cbca61e7924d00f1", type: "Fish Game", code: 42 },
    { name: "Jackpot Fishing", game_uid: "3cf4a85cb6dcf4d8836c982c359cd72d", type: "Fish Game", code: 32 },
    { name: "Dragon Fortune", game_uid: "1200b82493e4788d038849bca884d773", type: "Fish Game", code: 60 }
  ];

  const slotGames = [
    { name: "Chin Shi Huang", game_uid: "24da72b49b0dd0e5cbef9579d09d8981", type: "Slot Game", code: 2 },
    { name: "God Of Martial", game_uid: "21ef8a7ddd39836979170a2e7584e333", type: "Slot Game", code: 4 },
    { name: "Hot Chilli", game_uid: "c845960c81d27d7880a636424e53964d", type: "Slot Game", code: 5 },
    { name: "Fortune Tree", game_uid: "6a7e156ceec5c581cd6b9251854fe504", type: "Slot Game", code: 6 },
    { name: "War Of Dragons", game_uid: "4b1d7ffaf9f66e6152ea93a6d0e4215b", type: "Slot Game", code: 9 }
  ];

  res.json({
    success: true,
    games: {
      fishGames,
      slotGames
    }
  });
});

function getGameInfo(gameUid) {
  const allGames = [
    { name: "Royal Fishing", game_uid: "e794bf5717aca371152df192341fe68b", type: "Fish Game" },
    { name: "Bombing Fishing", game_uid: "e333695bcff28acdbecc641ae6ee2b23", type: "Fish Game" },
    { name: "Chin Shi Huang", game_uid: "24da72b49b0dd0e5cbef9579d09d8981", type: "Slot Game" },
    { name: "War Of Dragons", game_uid: "4b1d7ffaf9f66e6152ea93a6d0e4215b", type: "Slot Game" }
  ];

  return allGames.find(game => game.game_uid === gameUid) || { name: "Unknown Game", type: "Slot Game" };
}

app.listen(PORT, () => {
  console.log(`Enhanced Game platform server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log('Default admin: admin/admin123');
});

