import {
  aesEncrypt,
  aesDecrypt,
  createEncryptedPayload,
  parseEncryptedResponse,
} from './crypto'

/**
 * Make an encrypted API call to game endpoints
 * @param endpoint - API endpoint path
 * @param data - Data to send (will be encrypted)
 * @param options - Additional fetch options
 * @returns Promise with API response
 */
export async function makeEncryptedGameCall(
  endpoint: string,
  data: Record<string, unknown>,
  options: RequestInit = {}
) {
  try {
    // Create encrypted payload
    const encryptedPayload = createEncryptedPayload(data)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(encryptedPayload),
      ...options,
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.error || 'API call failed')
    }

    // Try to decrypt response if it contains encrypted payload
    if (responseData.payload) {
      try {
        const decryptedData = parseEncryptedResponse(responseData)
        return {
          ...responseData,
          decrypted: decryptedData,
        }
      } catch (decryptError) {
        console.warn('Could not decrypt response payload:', decryptError)
        return responseData
      }
    }

    return responseData
  } catch (error) {
    console.error('Encrypted API call failed:', error)
    throw error
  }
}

/**
 * Launch a game with encrypted payload
 * @param gameUid - Game unique identifier
 * @param token - Authentication token
 * @returns Promise with game launch response
 */
export async function launchGameEncrypted(gameUid: string, token: string) {
  return makeEncryptedGameCall(
    '/api/game/launch',
    {
      game_uid: gameUid,
      encrypt: true,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

/**
 * Test encryption/decryption functionality
 * @param plaintext - Text to encrypt and decrypt
 * @returns Object with encryption results
 */
export function testEncryption(plaintext: string = 'Hello World') {
  try {
    const encrypted = aesEncrypt(plaintext)
    const decrypted = aesDecrypt(encrypted)

    return {
      success: decrypted === plaintext,
      original: plaintext,
      encrypted,
      decrypted,
      match: decrypted === plaintext,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
