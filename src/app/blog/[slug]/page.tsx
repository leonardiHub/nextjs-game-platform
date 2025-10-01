import { Metadata } from 'next'
import BlogPostClient from './BlogPostClient'
import {
  processSchemaTemplate,
  getPageSchemaTemplate,
} from '@/utils/schemaProcessor'

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

// Fetch blog data for metadata
async function fetchBlogForMetadata(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`http://localhost:3002/api/blogs/${slug}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.blog
  } catch (error) {
    console.error('Error fetching blog for metadata:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const blog = await fetchBlogForMetadata(slug)

  if (!blog) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  // Process featured image URL
  const getFeaturedImageUrl = (imageUrl: string | null): string | undefined => {
    if (!imageUrl) return undefined

    // Handle external URLs
    if (
      imageUrl.startsWith('http') &&
      !imageUrl.includes('localhost') &&
      !imageUrl.includes('99group.games')
    ) {
      return imageUrl
    }

    // For local files, use backend server directly
    let cleanUrl = imageUrl
      .replace('http://localhost:3002', '')
      .replace('http://localhost:3001', '')
      .replace('https://99group.games', '')
      .replace('https://api.99group.games', '')

    // Ensure URL starts with /uploads
    if (!cleanUrl.startsWith('/uploads')) {
      cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
    }

    // Return appropriate backend URL based on environment
    // In server-side code, check process.env instead of window
    const apiUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://api.99group.games'
        : 'http://localhost:3002'
    return `${apiUrl}${cleanUrl}`
  }

  const title = blog.seo_title || blog.title || 'Blog Post'
  const description =
    blog.seo_description || blog.excerpt || 'Read our latest blog post'
  const featuredImage = getFeaturedImageUrl(blog.featured_image_url)

  // 获取并处理Schema模板
  let structuredData: any = undefined
  try {
    console.log('🚀 Starting schema processing for blog:', blog.title)
    const schemaTemplate = await getPageSchemaTemplate('/blog/[slug]')
    console.log('📄 Schema template received:', schemaTemplate ? 'Yes' : 'No')

    if (schemaTemplate) {
      console.log('🔄 Processing schema template with blog data')
      const processedSchema = processSchemaTemplate(schemaTemplate, blog)
      console.log(
        '✨ Processed schema:',
        processedSchema ? 'Success' : 'Failed'
      )

      if (processedSchema) {
        try {
          structuredData = JSON.parse(processedSchema)
          console.log('✅ Schema JSON parsed successfully')
        } catch (parseError) {
          console.error(
            '❌ Failed to parse processed schema as JSON:',
            parseError
          )
        }
      }
    } else {
      console.warn('⚠️  No schema template found for /blog/[slug]')
    }
  } catch (error) {
    console.error('❌ Error processing schema template:', error)
  }

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(featuredImage && { images: [{ url: featuredImage }] }),
      url: `/blog/${blog.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(featuredImage && { images: [featuredImage] }),
    },
    alternates: {
      canonical: `/blog/${blog.slug}`,
    },
  }

  return metadata
}

// Server component that handles metadata and renders the client component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blog = await fetchBlogForMetadata(slug)

  // 获取并处理Schema模板
  let structuredData: any = null
  if (blog) {
    try {
      console.log('🔄 Page component: Processing schema for blog:', blog.title)
      const schemaTemplate = await getPageSchemaTemplate('/blog/[slug]')
      console.log(
        '📋 Page component: Schema template received:',
        schemaTemplate ? 'Yes' : 'No'
      )

      if (schemaTemplate) {
        console.log('⚙️  Page component: Processing schema template')
        const processedSchema = processSchemaTemplate(schemaTemplate, blog)
        console.log(
          '🎯 Page component: Processed schema result:',
          processedSchema ? 'Success' : 'Failed'
        )

        if (processedSchema) {
          try {
            structuredData = JSON.parse(processedSchema)
            console.log('✅ Page component: Schema JSON parsed successfully')
            console.log(
              '📊 Page component: Final structured data:',
              JSON.stringify(structuredData, null, 2)
            )
          } catch (parseError) {
            console.error(
              '❌ Page component: Failed to parse schema JSON:',
              parseError
            )
          }
        }
      } else {
        console.warn('⚠️  Page component: No schema template available')
      }
    } catch (error) {
      console.error(
        '❌ Page component: Error processing schema template:',
        error
      )
    }
  } else {
    console.warn(
      '⚠️  Page component: No blog data available for schema processing'
    )
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
      <BlogPostClient slug={slug} />
    </>
  )
}
