interface BlogData {
  title: string
  excerpt: string
  content: string
  author: string
  published_at: string
  slug: string
  category_name?: string
  featured_image_url?: string | null
  tag_names?: string
  seo_title?: string
  seo_description?: string
}

interface SchemaVariables {
  title: string
  excerpt: string
  featured_image: string
  author: string
  published_date: string
  modified_date: string
  canonical_url: string
  tags: string
  category: string
  word_count: string
}

/**
 * 处理Schema模板中的动态变量替换
 * @param schemaTemplate - 包含变量占位符的Schema模板字符串
 * @param blogData - 博客文章数据
 * @param baseUrl - 网站基础URL
 * @returns 处理后的Schema字符串
 */
export function processSchemaTemplate(
  schemaTemplate: string, 
  blogData: BlogData, 
  baseUrl: string = 'https://99group.games'
): string {
  if (!schemaTemplate) return ''

  // 计算字数（简单估算）
  const wordCount = blogData.content
    ? blogData.content.replace(/<[^>]*>/g, '').split(/\s+/).length.toString()
    : '0'

  // 处理特色图片URL
  const getFeaturedImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return `${baseUrl}/images/default-blog.jpg`
    
    // Handle external URLs
    if (imageUrl.startsWith('http') && !imageUrl.includes('localhost')) {
      return imageUrl
    }
    
    // For local files, use backend server directly
    let cleanUrl = imageUrl
      .replace('http://localhost:3002', '')
      .replace('http://localhost:3001', '')
    
    // Ensure URL starts with /uploads
    if (!cleanUrl.startsWith('/uploads')) {
      cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`
    }
    
    // Return full URL
    return `http://localhost:3002${cleanUrl}`
  }

  // 格式化日期为ISO 8601格式
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  // 构建变量映射
  const variables: SchemaVariables = {
    title: blogData.seo_title || blogData.title || 'Blog Post',
    excerpt: blogData.seo_description || blogData.excerpt || 'Read our latest blog post',
    featured_image: getFeaturedImageUrl(blogData.featured_image_url || null),
    author: blogData.author || 'Admin',
    published_date: formatDate(blogData.published_at),
    modified_date: formatDate(blogData.published_at), // 如果没有修改日期，使用发布日期
    canonical_url: `${baseUrl}/blog/${blogData.slug}`,
    tags: blogData.tag_names || '',
    category: blogData.category_name || 'General',
    word_count: wordCount
  }

  // 替换所有变量占位符
  let processedSchema = schemaTemplate
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    processedSchema = processedSchema.replace(new RegExp(placeholder, 'g'), value)
  })

  // 验证生成的JSON是否有效
  try {
    JSON.parse(processedSchema)
    return processedSchema
  } catch (error) {
    console.error('Invalid JSON schema after variable replacement:', error)
    return ''
  }
}

/**
 * 从SEO设置中获取页面的Schema配置
 * @param pagePath - 页面路径（如 /blog/[slug]）
 * @returns Schema模板字符串
 */
export async function getPageSchemaTemplate(pagePath: string): Promise<string> {
  try {
    console.log(`🔍 Fetching schema template for page: ${pagePath}`)
    
    // 检测运行环境并构建正确的API URL
    const isServer = typeof window === 'undefined'
    const baseUrl = isServer ? 'http://localhost:3002' : ''
    const apiUrl = `${baseUrl}/api/seo/pages?page_path=${encodeURIComponent(pagePath)}`
    
    console.log(`📡 API URL (${isServer ? 'server' : 'client'}): ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`📊 API Response status: ${response.status}`)
    
    if (!response.ok) {
      console.warn(`❌ SEO API returned ${response.status} for page: ${pagePath}`)
      return ''
    }
    
    const data = await response.json()
    console.log(`📋 API Response data:`, { 
      pages_count: data.pages?.length || 0,
      page_paths: data.pages?.map((p: any) => p.page_path) || []
    })
    
    const pages = data.pages || []
    
    // 查找匹配的页面配置
    const pageConfig = pages.find((page: any) => page.page_path === pagePath)
    
    if (pageConfig?.schema_markup) {
      console.log(`✅ Found schema template for ${pagePath}`)
      console.log(`📝 Schema preview:`, pageConfig.schema_markup.substring(0, 200) + '...')
      return pageConfig.schema_markup
    } else {
      console.warn(`⚠️  No schema template found for page: ${pagePath}`)
      console.log(`🔍 Available pages:`, pages.map((p: any) => p.page_path))
      return ''
    }
  } catch (error) {
    console.error('❌ Error fetching page schema template:', error)
    return ''
  }
}
