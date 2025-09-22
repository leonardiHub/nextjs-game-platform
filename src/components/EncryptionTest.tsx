'use client'

import { useState } from 'react'
import { testEncryption } from '@/utils/api'
import { aesEncrypt, aesDecrypt } from '@/utils/crypto'

export default function EncryptionTest() {
  const [plaintext, setPlaintext] = useState('Hello World')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const handleTest = () => {
    const testResult = testEncryption(plaintext)
    setResult(testResult)
  }

  const handleManualTest = () => {
    try {
      const encrypted = aesEncrypt(plaintext)
      const decrypted = aesDecrypt(encrypted)

      setResult({
        success: decrypted === plaintext,
        original: plaintext,
        encrypted,
        decrypted,
        match: decrypted === plaintext,
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AES Encryption Test</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Text to encrypt:
        </label>
        <input
          type="text"
          value={plaintext}
          onChange={e => setPlaintext(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter text to encrypt"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleTest}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Test with API Function
        </button>
        <button
          onClick={handleManualTest}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Test Manual Encryption
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Results:</h3>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <strong>Success:</strong> {result.success ? '✅' : '❌'}
            </div>
            <div>
              <strong>Original:</strong> {String(result.original || '')}
            </div>
            {result.encrypted && (
              <div>
                <strong>Encrypted:</strong>{' '}
                <span className="break-all">{String(result.encrypted)}</span>
              </div>
            )}
            {result.decrypted && (
              <div>
                <strong>Decrypted:</strong> {String(result.decrypted)}
              </div>
            )}
            <div>
              <strong>Match:</strong> {result.match ? '✅' : '❌'}
            </div>
            {result.error && (
              <div className="text-red-600">
                <strong>Error:</strong> {String(result.error)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold mb-2">Usage Example:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {`import { aesEncrypt, aesDecrypt, createEncryptedPayload } from '@/utils/crypto'

// Basic encryption
const encrypted = aesEncrypt('Hello World')
const decrypted = aesDecrypt(encrypted)

// Create encrypted payload for API
const payload = createEncryptedPayload({
  game_uid: 'test-game-123',
  player_account: 'player123'
})`}
        </pre>
      </div>
    </div>
  )
}
