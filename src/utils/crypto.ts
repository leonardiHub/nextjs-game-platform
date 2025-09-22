import CryptoJS from 'crypto-js'

// API Configuration - Support both HUIDU official and legacy keys
export const API_CONFIG = {
  // HUIDU Official (from API documentation)
  HUIDU: {
    agency_uid: '8dee1e401b87408cca3ca813c2250cb4',
    aes_key: '68b074393ec7c5a975856a90bd6fdf47',
    server_url: 'https://jsgame.live',
  },
  // Legacy/Production (current server configuration)
  LEGACY: {
    agency_uid: '45370b4f27dfc8a2875ba78d07e8a81a',
    aes_key: '08970240475e1255d2b4ac023ac658f3',
    server_url: 'https://jsgame.live',
  },
}

// Default to HUIDU official keys as per your requirement
const AES_KEY = API_CONFIG.HUIDU.aes_key

/**
 * Encrypt text using AES-256-ECB
 * @param text - Plain text to encrypt
 * @param key - Optional encryption key (defaults to AES_KEY)
 * @returns Base64 encoded encrypted string
 */
export function aesEncrypt(text: string, key: string = AES_KEY): string {
  const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

/**
 * Decrypt AES-256-ECB encrypted text
 * @param encryptedText - Base64 encoded encrypted string
 * @param key - Optional decryption key (defaults to AES_KEY)
 * @returns Decrypted plain text
 */
export function aesDecrypt(
  encryptedText: string,
  key: string = AES_KEY
): string {
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

/**
 * Create encrypted payload for API requests
 * @param data - Data object to encrypt
 * @returns Encrypted payload object with agency_uid and payload
 */
export function createEncryptedPayload(data: Record<string, unknown>) {
  const payloadString = JSON.stringify(data)
  const encryptedPayload = aesEncrypt(payloadString)

  return {
    agency_uid: API_CONFIG.HUIDU.agency_uid,
    payload: encryptedPayload,
    timestamp: Date.now().toString(),
  }
}

/**
 * Parse encrypted API response
 * @param response - Response object with encrypted payload
 * @returns Decrypted data object
 */
export function parseEncryptedResponse(response: { payload: string }) {
  const decryptedPayload = aesDecrypt(response.payload)
  return JSON.parse(decryptedPayload)
}
