import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002'
console.log('Frontend API: BACKEND_URL is:', BACKEND_URL)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/seo/pages/${params.id}`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching SEO page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO page' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Frontend API: PUT request received for pageId:', params.id)
    console.log('Frontend API: Request body:', body)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    console.log('Frontend API: Sending request to backend:', `${BACKEND_URL}/api/admin/seo/pages/${params.id}`)
    const response = await fetch(`${BACKEND_URL}/api/admin/seo/pages/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log('Frontend API: Backend response status:', response.status)
    console.log('Frontend API: Backend response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Frontend API: Backend error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('Frontend API: Parsing JSON response...')
    const data = await response.json()
    console.log('Frontend API: Parsed data:', data)
    console.log('Frontend API: Returning successful response')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating SEO page:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : error,
      cause: error instanceof Error ? error.cause : undefined
    })
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - backend server not responding' },
          { status: 504 }
        )
      }
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Backend server connection refused', details: error.message },
          { status: 503 }
        )
      }
      if (error.message.includes('fetch failed')) {
        return NextResponse.json(
          { error: 'Network error - fetch failed', details: error.message },
          { status: 502 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update SEO page', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/seo/pages/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting SEO page:', error)
    return NextResponse.json(
      { error: 'Failed to delete SEO page' },
      { status: 500 }
    )
  }
}
