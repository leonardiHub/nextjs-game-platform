'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string // Add content field
  author: string
  published_at: string
  category_name: string
  category_path: string
  featured_image_url: string | null
  full_url: string
  views: number
  tags: string[]
  tag_names: string
}

interface BlogResponse {
  blogs: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

const BlogPageClient = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/blogs?limit=100')

        if (!response.ok) {
          throw new Error('Failed to fetch blogs')
        }

        const data: BlogResponse = await response.json()
        setBlogs(data.blogs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching blogs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getFakeViews = (blogId: number) => {
    // Generate fake views based on blog ID for consistency
    const baseViews = blogId * 47 + 123
    return Math.floor(baseViews + Math.random() * 100)
  }

  const handleBlogClick = (blog: BlogPost) => {
    router.push(`/blog/${blog.slug}`)
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px] bg-dark">
        <div className="text-xl text-yellow-500 font-semibold">
          Loading blog articles...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px] bg-dark">
        <div className="text-xl text-red-500 font-semibold">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-dark text-white flex flex-col items-center pb-8">
      <span className="text-3xl gradient-gold font-semibold my-8">
        Blog Articles
      </span>

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-400">No blog articles found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1200px] px-4">
          {blogs.map(blog => (
            <div
              key={blog.id}
              onClick={() => handleBlogClick(blog)}
              className="group bg-dark rounded-lg border border-gray-700 shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl relative cursor-pointer"
            >
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={(() => {
                    if (!blog.featured_image_url) return '/promotion-3.webp'

                    // Handle external URLs
                    if (
                      blog.featured_image_url.startsWith('http') &&
                      !blog.featured_image_url.includes('localhost')
                    ) {
                      return blog.featured_image_url
                    }

                    // For local files, use backend server directly
                    let cleanUrl = blog.featured_image_url
                      .replace('http://localhost:3002', '')
                      .replace('http://localhost:3001', '')

                    // Ensure URL starts with /uploads
                    if (!cleanUrl.startsWith('/uploads')) {
                      cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
                    }

                    // Return backend server URL directly
                    return `http://localhost:3002${cleanUrl}`
                  })()}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.src = '/promotion-3.webp'
                  }}
                />
              </div>
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div className="w-max primary-gradient-to-r px-2 py-1 rounded-md font-semibold text-xs lg:text-sm mb-2">
                  {blog.category_name}
                </div>
                <h3 className="text-2xl font-semibold gradient-gold">
                  {blog.title}
                </h3>
                <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                  {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-gray-400 text-xs mt-4">
                  <div className="flex items-center">
                    <span className="mr-2">{blog.author}</span>
                    <span>{formatDate(blog.published_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">
                      <Eye className="w-3 h-3" />
                    </span>
                    <span className="text-yellow-500">
                      {getFakeViews(blog.id)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BlogPageClient
