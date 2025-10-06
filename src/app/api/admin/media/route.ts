import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '24'
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const folder_id = searchParams.get('folder_id') || ''
    const date_range = searchParams.get('date_range') || 'all'

    const queryParams = new URLSearchParams()
    if (page) queryParams.set('page', page)
    if (limit) queryParams.set('limit', limit)
    if (search) queryParams.set('search', search)
    if (type) queryParams.set('type', type)
    if (folder_id) queryParams.set('folder_id', folder_id)
    if (date_range) queryParams.set('date_range', date_range)

    const response = await fetch(
      `${API_BASE_URL}/api/admin/media?${queryParams}`,
      {
        method: 'GET',
        headers: {
          Authorization: request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
