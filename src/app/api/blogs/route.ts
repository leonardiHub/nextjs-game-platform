import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const author = searchParams.get('author') || ''

    const queryParams = new URLSearchParams({
      page,
      limit,
      search,
      status: 'published', // Only return published blogs
      category,
      author,
    })

    const response = await fetch(`${API_BASE_URL}/api/blogs?${queryParams}`, {
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

    // Transform the data to return only necessary fields for public consumption
    const publicBlogs = data.blogs.map((blog: any) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content, // Include HTML content
      author: blog.author,
      published_at: blog.published_at,
      category_name: blog.category_name,
      category_path: blog.category_path,
      featured_image_url: blog.featured_image_url,
      full_url: blog.full_url,
      views: blog.views,
      tags: blog.tags || [],
      tag_names: blog.tag_names || '',
    }))

    return NextResponse.json({
      blogs: publicBlogs,
      pagination: data.pagination,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching public blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs', success: false },
      { status: 500 }
    )
  }
}
