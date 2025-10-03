import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3006'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const backendUrl = `${BACKEND_URL}/api/captcha/${params.sessionId}${queryString ? `?${queryString}` : ''}`

    console.log('Captcha proxy request to:', backendUrl)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js Proxy',
      },
    })

    console.log('Backend response status:', response.status)
    console.log(
      'Backend response headers:',
      Object.fromEntries(response.headers.entries())
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      return NextResponse.json(
        { error: 'Backend error', details: errorText },
        { status: response.status }
      )
    }

    // Get the response content as text first
    const content = await response.text()
    console.log(
      'Backend response content (first 100 chars):',
      content.substring(0, 100)
    )

    // Check if it's SVG content
    if (content.includes('<svg')) {
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    } else {
      // Try to parse as JSON
      try {
        const data = JSON.parse(content)
        return NextResponse.json(data, { status: response.status })
      } catch {
        return NextResponse.json(
          { error: 'Invalid response format', content },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Captcha proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
