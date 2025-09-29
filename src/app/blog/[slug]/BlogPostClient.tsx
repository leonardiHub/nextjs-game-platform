'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  published_at: string
  category_name: string
  category_path: string
  featured_image_url: string | null
  full_url: string
  views: number
  tags: string[]
  tag_names: string
  seo_title?: string
  seo_description?: string
}

interface BlogListResponse {
  blogs: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

interface BlogPostClientProps {
  slug: string
}

const BlogPostClient = ({ slug }: BlogPostClientProps) => {
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [htmlContent, setHtmlContent] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        // Fetch all blogs from the list API
        const response = await fetch('/api/blogs?limit=1000')

        if (!response.ok) {
          throw new Error('Failed to fetch blogs')
        }

        const data: BlogListResponse = await response.json()

        // Find the blog with matching slug
        const foundBlog = data.blogs.find(blog => blog.slug === slug)

        if (!foundBlog) {
          throw new Error('Blog post not found')
        }

        setBlog(foundBlog)
        setHtmlContent(foundBlog.content)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching blog:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBlog()
    }
  }, [slug])

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

  const goBack = () => {
    router.back()
  }

  // Function to decode HTML entities
  const decodeHtml = (html: string) => {
    if (typeof window === 'undefined') return html

    try {
      const txt = document.createElement('textarea')
      txt.innerHTML = html
      const decoded = txt.value

      // Additional decoding for common entities
      return decoded
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
    } catch (error) {
      console.error('Error decoding HTML:', error)
      return html
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-dark">
        <div className="text-xl text-yellow-500 font-semibold">
          Loading blog post...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-dark">
        <div className="text-center">
          <div className="text-xl text-red-500 font-semibold mb-4">
            Error: {error}
          </div>
          <button
            onClick={goBack}
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-dark">
        <div className="text-center">
          <div className="text-xl text-gray-400 font-semibold mb-4">
            Blog post not found
          </div>
          <button
            onClick={goBack}
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-dark text-white">
      {/* Custom styles for blog content */}
      <style jsx global>{`
        .blog-content {
          color: #e5e7eb !important;
          line-height: 1.8;
          font-size: 1.125rem;
        }

        .blog-content * {
          color: inherit !important;
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          font-weight: bold !important;
          margin-top: 1.5rem !important;
          margin-bottom: 1rem !important;
        }

        .blog-content h1 {
          font-size: 2rem !important;
        }

        .blog-content h2 {
          font-size: 1.5rem !important;
        }

        .blog-content h3 {
          font-size: 1.25rem !important;
        }

        .blog-content p {
          margin-bottom: 1rem !important;
        }

        .blog-content ul {
          margin-bottom: 1rem !important;
          padding-left: 0 !important;
          list-style: none !important;
        }

        .blog-content ol {
          margin-bottom: 1rem !important;
          padding-left: 2rem !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
        }

        .blog-content ul li {
          margin-bottom: 0.5rem !important;
          padding-left: 2rem !important;
          position: relative !important;
        }

        .blog-content ul li::before {
          content: '•' !important;
          color: #e5e7eb !important;
          font-weight: bold !important;
          position: absolute !important;
          left: 0.5rem !important;
          top: 0 !important;
        }

        .blog-content ol li {
          margin-bottom: 0.5rem !important;
        }

        .blog-content strong {
          font-weight: bold !important;
        }

        .blog-content em {
          font-style: italic !important;
        }

        .blog-content blockquote {
          border-left: 4px solid #fbbf24 !important;
          padding-left: 1rem !important;
          margin: 1rem 0 !important;
          font-style: italic !important;
        }
      `}</style>

      {/* Blog Content */}
      <div className="w-full flex flex-col items-center justify-center">
        {/* Featured Image */}
        {blog.featured_image_url && (
          <div className="mb-6 sm:mb-8 lg:mb-10 lg:w-[80%] w-full">
            <img
              src={(() => {
                if (!blog.featured_image_url) return ''

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
              className="w-full aspect-[3/2] sm:aspect-[16/9] md:aspect-[18/9] lg:aspect-[20/9] object-contain sm:object-cover rounded-lg shadow-lg bg-dark"
            />
          </div>
        )}

        <div className="w-full max-w-5xl mx-auto lg:px-0 px-6">
          {/* Enhanced Blog Header */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            {/* Category Badge */}
            <div className="primary-gradient-to-r w-max px-2 py-1 rounded-md font-semibold lg:text-sm">
              {blog.category_name}
            </div>

            {/* Main Title */}

            <span className="gradient-gold text-3xl font-semibold my-3">
              {blog.title}
            </span>

            {/* Author and Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-0">
                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-gray-300 font-medium">
                      By {blog.author}
                    </p>
                    <p className="text-gray-500 text-sm">Content Creator</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-gray-600"></div>

                {/* Date and Views */}
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">
                      {formatDate(blog.published_at)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-sm">
                      {getFakeViews(blog.id).toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Reading Time Estimate */}
              <div className="flex items-center space-x-2 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">5 min read</span>
              </div>
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg"></div>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed relative z-10 p-6 rounded-lg border border-gray-700/50">
                  {blog.excerpt}
                </p>
              </div>
            )}

            {/* Tags */}
            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Blog Content */}
          {htmlContent && (
            <div
              className="blog-content prose prose-lg sm:prose-xl lg:prose-2xl max-w-none"
              dangerouslySetInnerHTML={{ __html: decodeHtml(htmlContent) }}
              style={{
                color: '#e5e7eb',
                lineHeight: '1.8',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              }}
            />
          )}

          {/* Enhanced Blog Footer */}
          <div className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
              {/* Share and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm font-medium">
                    Share this article:
                  </span>
                  <div className="flex items-center space-x-3">
                    <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={goBack}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:from-yellow-400 hover:to-yellow-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Blog</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPostClient
