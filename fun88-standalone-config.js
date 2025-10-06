// FUN88 Standalone Configuration
// This project is now completely separated from 99group.games

module.exports = {
  // Frontend Configuration
  frontend: {
    port: 3010,
    domain: 'https://fun88tha.com',
    apiUrl: 'https://api-staging.4d99.co',
  },

  // Backend Configuration
  backend: {
    port: 3001,
    domain: 'https://api-staging.4d99.co',
    database: 'fun88_platform.db',
    jwtSecret: 'fun88-secret-key-change-in-production',
  },

  // Game Provider Configuration (separate from 99group.games)
  gameProvider: {
    agency_uid: '8dee1e401b87408cca3ca813c2250cb4',
    aes_key: '68b074393ec7c5a975856a90bd6fdf47',
    player_prefix: 'fun88',
    server_url: 'https://jsgame.live',
    initial_credit: 50,
  },

  // Database Configuration
  database: {
    name: 'fun88_platform.db',
    tables: [
      'users',
      'game_sessions',
      'game_transactions',
      'withdrawals',
      'kyc_documents',
      'system_settings',
    ],
  },

  // Deployment Status
  status: 'STANDALONE',
  separatedFrom: '99group.games',
  lastUpdated: new Date().toISOString(),
}
