import { Metadata } from 'next'

interface SEOData {
  id?: number
  page_path: string
  page_title?: string
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  schema_markup?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  robots_meta?: string
  keywords?: string
}

interface GlobalSEOSettings {
  site_name: string
  default_meta_title: string
  default_meta_description: string
  default_og_image: string
  favicon_url: string
  twitter_site?: string
  header_code?: string
  body_code?: string
  footer_code?: string
  default_canonical_url?: string
  default_robots_meta?: string
  default_keywords?: string
  default_schema_markup?: string
}

// 获取页面的SEO数据
export async function getPageSEO(pagePath: string): Promise<SEOData | null> {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002'

    // 首先尝试获取管理员token（如果有的话）
    const url = `${BACKEND_URL}/api/seo/page?path=${encodeURIComponent(pagePath)}`
    console.log('Fetching page SEO from:', url)

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 确保获取最新数据
    })

    if (response.ok) {
      const data = await response.json()
      return data.seo || null
    } else {
      console.log(
        'SEO API response not ok:',
        response.status,
        response.statusText
      )
    }
  } catch (error) {
    console.error('Error fetching page SEO:', error)
  }

  return null
}

// 获取页面特定的SEO设置（从管理后台配置）
export async function getPageSEOSettings(
  pagePath: string
): Promise<SEOData | null> {
  try {
    // 在服务器端渲染时，直接调用后端API
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002'
    const url = `${BACKEND_URL}/api/seo/pages?page_path=${encodeURIComponent(pagePath)}`

    console.log('Fetching page SEO settings for:', pagePath)
    console.log('API URL:', url)

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (response.ok) {
      const data = await response.json()
      console.log('Response data:', JSON.stringify(data, null, 2))
      const pages = data.pages || []
      console.log('Pages array length:', pages.length)
      const pageConfig = pages.find((page: any) => page.page_path === pagePath)
      console.log('Found page config:', pageConfig ? 'YES' : 'NO')
      if (pageConfig) {
        console.log('Page config meta_title:', pageConfig.meta_title)
      }
      return pageConfig || null
    } else {
      console.log('Response not ok, status:', response.status)
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
  } catch (error) {
    console.error('Error fetching page SEO settings:', error)
  }

  return null
}

// 获取全局SEO设置
export async function getGlobalSEOSettings(): Promise<GlobalSEOSettings> {
  const defaultSettings: GlobalSEOSettings = {
    site_name: '99Group Gaming Platform',
    default_meta_title: '99Group - Premium Gaming Platform',
    default_meta_description:
      'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
    default_og_image: '/images/og-default.jpg',
    favicon_url: '/favicon.ico',
    twitter_site: '@99group',
    default_canonical_url: '',
    default_robots_meta: 'index, follow',
    default_keywords: 'gaming, casino, online games, 99group, free credits',
    default_schema_markup: '',
  }

  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002'
    const response = await fetch(`${BACKEND_URL}/api/seo/global`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (response.ok) {
      const data = await response.json()
      return { ...defaultSettings, ...data }
    }
  } catch (error) {
    console.error('Error fetching global SEO settings:', error)
  }

  return defaultSettings
}

// 生成Next.js Metadata对象
export async function generateMetadata(pagePath: string): Promise<Metadata> {
  const [pageSEO, globalSettings] = await Promise.all([
    getPageSEO(pagePath),
    getGlobalSEOSettings(),
  ])

  // 页面级别设置优先，然后是全局设置，最后是默认值
  const title =
    pageSEO?.meta_title ||
    pageSEO?.page_title ||
    globalSettings.default_meta_title
  const description =
    pageSEO?.meta_description || globalSettings.default_meta_description
  const ogTitle = pageSEO?.og_title || title
  const ogDescription = pageSEO?.og_description || description
  const ogImage = pageSEO?.og_image || globalSettings.default_og_image
  const twitterTitle = pageSEO?.twitter_title || ogTitle
  const twitterDescription = pageSEO?.twitter_description || ogDescription
  const twitterImage = pageSEO?.twitter_image || ogImage

  // 使用页面设置 > 全局设置 > 默认值的优先级
  const robots =
    pageSEO?.robots_meta ||
    globalSettings.default_robots_meta ||
    'index, follow'
  const keywords =
    pageSEO?.keywords || globalSettings.default_keywords || undefined
  const canonicalUrl =
    pageSEO?.canonical_url || globalSettings.default_canonical_url || undefined
  const schemaMarkup =
    pageSEO?.schema_markup || globalSettings.default_schema_markup || undefined

  const metadata: Metadata = {
    title,
    description,
    robots,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
      siteName: globalSettings.site_name,
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : undefined,
      site: globalSettings.twitter_site,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {},
  }

  // 添加schema markup作为结构化数据（优先使用页面级别，然后全局）
  if (schemaMarkup) {
    try {
      JSON.parse(schemaMarkup) // 验证JSON格式
      metadata.other!['structured-data'] = schemaMarkup
    } catch (error) {
      console.error('Invalid schema markup JSON:', error)
    }
  }

  return metadata
}

// 生成结构化数据脚本
export function generateStructuredDataScript(
  schemaMarkup?: string
): string | null {
  if (!schemaMarkup) return null

  try {
    JSON.parse(schemaMarkup) // 验证JSON格式
    return `<script type="application/ld+json">${schemaMarkup}</script>`
  } catch (error) {
    console.error('Invalid schema markup JSON:', error)
    return null
  }
}
