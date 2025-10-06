// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL:
    process.env.NODE_ENV === 'production'
      ? 'http://15.235.215.3:5001'
      : process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' &&
        window.location.hostname === 'localhost'
          ? 'http://localhost:5002'
          : 'http://15.235.215.3:5001'),

  // Frontend base URL
  FRONTEND_URL:
    process.env.NODE_ENV === 'production'
      ? 'https://fun88.game'
      : 'http://localhost:3007',

  // HUIDU API Configuration
  HUIDU: {
    agency_uid: '8dee1e401b87408cca3ca813c2250cb4',
    aes_key: '68b074393ec7c5a975856a90bd6fdf47',
    server_url: 'https://jsgame.live',
  },

  // Legacy/Production Configuration
  LEGACY: {
    agency_uid: '45370b4f27dfc8a2875ba78d07e8a81a',
    aes_key: '08970240475e1255d2b4ac023ac658f3',
    server_url: 'https://jsgame.live',
  },
}

// API endpoint builder
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Environment check
export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'
