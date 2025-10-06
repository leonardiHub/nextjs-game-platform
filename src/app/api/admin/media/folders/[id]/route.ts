import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id
    console.log('DELETE folder request - ID:', folderId)
    console.log('API_BASE_URL:', API_BASE_URL)

    const response = await fetch(
      `${API_BASE_URL}/api/admin/media/folders/${folderId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    )

    console.log('Backend response status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('Backend error:', error)
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    console.log('Backend success:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
