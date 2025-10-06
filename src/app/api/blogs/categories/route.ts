import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002'

export async function GET(request: NextRequest) {
  try {
    // Get all published blogs to extract unique categories
    const response = await fetch(`${API_BASE_URL}/api/blogs?limit=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()

    // Extract unique categories from published blogs
    const categoryMap = new Map()

    data.blogs.forEach((blog: any) => {
      if (blog.category_name && blog.category_path) {
        categoryMap.set(blog.category_name, {
          name: blog.category_name,
          path: blog.category_path,
          count: (categoryMap.get(blog.category_name)?.count || 0) + 1,
        })
      }
    })

    const categories = Array.from(categoryMap.values())

    return NextResponse.json({
      categories,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog categories', success: false },
      { status: 500 }
    )
  }
}
