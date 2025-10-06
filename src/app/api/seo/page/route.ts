import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5002'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Page path is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/seo/page?path=${encodeURIComponent(path)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching page SEO:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page SEO' },
      { status: 500 }
    )
  }
}
