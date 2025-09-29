import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3002'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    // Get the specific blog post by slug
    const response = await fetch(`${API_BASE_URL}/api/blogs/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Blog post not found', success: false },
          { status: 404 }
        )
      }
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    const blog = data.blog

    // Return only necessary fields for public consumption
    const publicBlog = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      published_at: blog.published_at,
      category_name: blog.category_name,
      category_path: blog.category_path,
      featured_image_url: blog.featured_image_url,
      full_url: blog.full_url,
      views: blog.views,
      tags: blog.tags || [],
      tag_names: blog.tag_names || '',
      seo_title: blog.seo_title,
      seo_description: blog.seo_description,
    }

    return NextResponse.json({
      blog: publicBlog,
      success: true,
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post', success: false },
      { status: 500 }
    )
  }
}
