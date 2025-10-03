import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3006'

interface SuggestionRequest {
  page_path: string
  page_title?: string
  page_type?: 'home' | 'blog' | 'game' | 'about' | 'contact' | 'generic'
}

interface GlobalSEOSettings {
  site_name: string
  default_meta_title: string
  default_meta_description: string
  default_og_image: string
  default_canonical_url?: string
  default_robots_meta?: string
  default_keywords?: string
  default_schema_markup?: string
  twitter_site?: string
}

interface SEOSuggestions {
  meta_title: string
  meta_description: string
  og_title: string
  og_description: string
  og_image: string
  twitter_title: string
  twitter_description: string
  twitter_image: string
  canonical_url: string
  robots_meta: string
  keywords: string
  schema_markup: string
}

/**
 * 根据页面类型和路径生成智能SEO建议
 */
function generateSEOSuggestions(
  request: SuggestionRequest,
  globalSettings: GlobalSEOSettings
): SEOSuggestions {
  const { page_path, page_title, page_type } = request
  const siteName = globalSettings.site_name || '99Group Gaming Platform'
  const baseUrl =
    globalSettings.default_canonical_url || 'https://99group.games'

  // 根据页面路径推断页面类型
  const inferredType = page_type || inferPageType(page_path)

  // 生成页面标题（如果没有提供）
  const inferredTitle = page_title || generatePageTitle(page_path, inferredType)

  // 根据页面类型生成不同的内容模板
  const templates = getContentTemplates(inferredType, inferredTitle, siteName)

  return {
    meta_title: `${inferredTitle} - ${siteName}`,
    meta_description: templates.description,
    og_title: inferredTitle,
    og_description: templates.socialDescription,
    og_image:
      globalSettings.default_og_image ||
      `${baseUrl}/images/og-${inferredType}.jpg`,
    twitter_title: inferredTitle,
    twitter_description: templates.socialDescription,
    twitter_image:
      globalSettings.default_og_image ||
      `${baseUrl}/images/twitter-${inferredType}.jpg`,
    canonical_url: `${baseUrl}${page_path}`,
    robots_meta: globalSettings.default_robots_meta || 'index, follow',
    keywords: generateKeywords(
      inferredType,
      inferredTitle,
      globalSettings.default_keywords
    ),
    schema_markup: generateSchemaMarkup(
      inferredType,
      inferredTitle,
      page_path,
      baseUrl,
      globalSettings
    ),
  }
}

/**
 * 根据页面路径推断页面类型
 */
function inferPageType(pagePath: string): string {
  if (pagePath === '/') return 'home'
  if (pagePath.startsWith('/blog')) return 'blog'
  if (pagePath.startsWith('/games') || pagePath.includes('game')) return 'game'
  if (pagePath.includes('about')) return 'about'
  if (pagePath.includes('contact')) return 'contact'
  return 'generic'
}

/**
 * 根据页面路径和类型生成页面标题
 */
function generatePageTitle(pagePath: string, pageType: string): string {
  if (pagePath === '/') return 'Home'

  // 从路径中提取并格式化标题
  const segments = pagePath.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  // 处理动态路由
  if (lastSegment?.startsWith('[') && lastSegment?.endsWith(']')) {
    const param = lastSegment.slice(1, -1)
    if (param === 'slug') return 'Blog Post'
    if (param === 'id') return 'Game Details'
    return param.charAt(0).toUpperCase() + param?.slice(1)
  }

  // 格式化普通路径
  return segments
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' - ')
}

/**
 * 根据页面类型获取内容模板
 */
function getContentTemplates(
  pageType: string,
  pageTitle: string,
  siteName: string
) {
  const templates = {
    home: {
      description: `Experience premium online gaming at ${siteName}. Get $50 free credits, enjoy secure gaming environment, and access top-quality games. Join thousands of satisfied players today.`,
      socialDescription: `Premium online gaming platform with $50 free credits and secure gaming environment.`,
    },
    blog: {
      description: `Read the latest gaming news, tips, and insights on ${siteName} blog. Stay updated with industry trends, game reviews, and expert gaming strategies.`,
      socialDescription: `Latest gaming news, tips and insights from ${siteName}.`,
    },
    game: {
      description: `Play ${pageTitle} on ${siteName}. Premium gaming experience with secure environment, fair gameplay, and exciting rewards. Start playing now!`,
      socialDescription: `Play ${pageTitle} - Premium gaming experience with exciting rewards.`,
    },
    about: {
      description: `Learn about ${siteName} - your trusted premium gaming platform. Discover our mission, values, and commitment to providing the best online gaming experience.`,
      socialDescription: `Learn about ${siteName} - your trusted premium gaming platform.`,
    },
    contact: {
      description: `Contact ${siteName} support team. Get help with your account, games, or any questions. We're here to provide excellent customer service 24/7.`,
      socialDescription: `Contact ${siteName} support team for help and assistance.`,
    },
    generic: {
      description: `${pageTitle} - ${siteName}. Experience premium online gaming with secure environment, exciting games, and excellent customer support.`,
      socialDescription: `${pageTitle} on ${siteName} - Premium gaming experience.`,
    },
  }

  return templates[pageType as keyof typeof templates] || templates.generic
}

/**
 * 生成关键词
 */
function generateKeywords(
  pageType: string,
  pageTitle: string,
  defaultKeywords?: string
): string {
  const baseKeywords =
    defaultKeywords || 'gaming, online games, casino, 99group'

  const typeKeywords = {
    home: 'home, main page, gaming platform, online casino',
    blog: 'blog, gaming news, tips, strategies, reviews',
    game: 'games, play online, casino games, slots',
    about: 'about us, company, gaming platform, trusted',
    contact: 'contact, support, help, customer service',
    generic: 'page, gaming, online',
  }

  const specificKeywords =
    typeKeywords[pageType as keyof typeof typeKeywords] || typeKeywords.generic
  const titleKeywords = pageTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .join(', ')

  return `${baseKeywords}, ${specificKeywords}, ${titleKeywords}`
}

/**
 * 生成Schema标记
 */
function generateSchemaMarkup(
  pageType: string,
  pageTitle: string,
  pagePath: string,
  baseUrl: string,
  globalSettings: GlobalSEOSettings
): string {
  const commonSchema = {
    '@context': 'https://schema.org',
    url: `${baseUrl}${pagePath}`,
    name: pageTitle,
    publisher: {
      '@type': 'Organization',
      name: globalSettings.site_name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    inLanguage: 'en-US',
  }

  let schema = {}

  switch (pageType) {
    case 'home':
      schema = {
        ...commonSchema,
        '@type': 'WebSite',
        description: `Premium online gaming platform - ${globalSettings.site_name}`,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
      break

    case 'blog':
      if (pagePath === '/blog') {
        schema = {
          ...commonSchema,
          '@type': 'Blog',
          description: 'Gaming news, tips and insights',
        }
      } else {
        schema = {
          ...commonSchema,
          '@type': 'BlogPosting',
          headline: pageTitle,
          author: {
            '@type': 'Person',
            name: 'Admin',
          },
          datePublished: new Date().toISOString(),
          dateModified: new Date().toISOString(),
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}${pagePath}`,
          },
        }
      }
      break

    case 'game':
      schema = {
        ...commonSchema,
        '@type': 'Game',
        description: `Play ${pageTitle} online`,
        genre: 'Casino Game',
        gamePlatform: 'Web Browser',
      }
      break

    case 'about':
      schema = {
        ...commonSchema,
        '@type': 'AboutPage',
        description: `About ${globalSettings.site_name}`,
        mainEntity: {
          '@type': 'Organization',
          name: globalSettings.site_name,
          description: 'Premium online gaming platform',
        },
      }
      break

    case 'contact':
      schema = {
        ...commonSchema,
        '@type': 'ContactPage',
        description: 'Contact us for support and assistance',
      }
      break

    default:
      schema = {
        ...commonSchema,
        '@type': 'WebPage',
        description: pageTitle,
      }
  }

  return JSON.stringify(schema, null, 2)
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const suggestionRequest: SuggestionRequest = await request.json()

    if (!suggestionRequest.page_path) {
      return NextResponse.json(
        { error: 'page_path is required' },
        { status: 400 }
      )
    }

    // 获取全局SEO设置
    const globalResponse = await fetch(`${BACKEND_URL}/api/admin/seo/global`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    })

    if (!globalResponse.ok) {
      throw new Error('Failed to fetch global SEO settings')
    }

    const globalSettings: GlobalSEOSettings = await globalResponse.json()

    // 生成SEO建议
    const suggestions = generateSEOSuggestions(
      suggestionRequest,
      globalSettings
    )

    return NextResponse.json({
      success: true,
      suggestions,
      generated_at: new Date().toISOString(),
      based_on: {
        page_path: suggestionRequest.page_path,
        page_title: suggestionRequest.page_title,
        page_type:
          suggestionRequest.page_type ||
          inferPageType(suggestionRequest.page_path),
        global_settings_applied: true,
      },
    })
  } catch (error) {
    console.error('Error generating SEO suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate SEO suggestions' },
      { status: 500 }
    )
  }
}
