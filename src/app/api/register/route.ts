import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/utils/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward the request to your backend server
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
