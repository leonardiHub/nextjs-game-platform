import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5002'

interface DiscoveredPage {
  page_path: string
  page_title: string
  file_path: string
  exists_in_seo: boolean
}

// 扫描Next.js应用页面的函数
function scanAppPages(): DiscoveredPage[] {
  const appDir = path.join(process.cwd(), 'src', 'app')
  const pages: DiscoveredPage[] = []

  function scanDirectory(dir: string, basePath: string = '') {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true })

      for (const item of items) {
        const fullPath = path.join(dir, item.name)
        const relativePath = path.join(basePath, item.name)

        if (item.isDirectory()) {
          // 跳过特殊目录
          if (
            item.name.startsWith('_') ||
            item.name === 'api' ||
            item.name === 'components' ||
            item.name.startsWith('.')
          ) {
            continue
          }

          scanDirectory(fullPath, relativePath)
        } else if (item.name === 'page.tsx' || item.name === 'page.js') {
          // 找到页面文件
          let routePath =
            basePath === '' ? '/' : `/${basePath.replace(/\\/g, '/')}`

          // 确保路径格式正确
          routePath = routePath.replace(/\/+/g, '/') // 移除重复的斜杠

          // 生成页面标题（从路径推断）
          let pageTitle = ''
          if (basePath === '') {
            pageTitle = 'Home Page'
          } else {
            const segments = basePath.split(path.sep)
            pageTitle = segments
              .map(segment => {
                // 处理动态路由
                if (segment.startsWith('[') && segment.endsWith(']')) {
                  const param = segment?.slice(1, -1)
                  // 特殊处理常见的动态路由参数
                  if (param === 'slug') {
                    return 'Post'
                  } else if (param === 'id') {
                    return 'Detail'
                  } else {
                    return param.charAt(0).toUpperCase() + param?.slice(1)
                  }
                }
                // 特殊处理已知页面
                if (segment === 'blog') {
                  return 'Blog'
                }
                return segment.charAt(0).toUpperCase() + segment?.slice(1)
              })
              .join(' - ')
          }

          console.log(`Found page: ${routePath} (${pageTitle}) at ${fullPath}`)

          pages.push({
            page_path: routePath,
            page_title: pageTitle,
            file_path: fullPath,
            exists_in_seo: false, // 这个会在后面检查
          })
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error)
    }
  }

  if (fs.existsSync(appDir)) {
    scanDirectory(appDir)
  }

  return pages
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. 扫描应用页面
    console.log('Starting page scan...')
    const discoveredPages = scanAppPages()
    console.log(
      `Discovered ${discoveredPages.length} pages:`,
      discoveredPages.map(p => `${p.page_path} (${p.page_title})`).join(', ')
    )

    // 2. 获取现有的SEO页面配置
    const existingPagesResponse = await fetch(
      `${BACKEND_URL}/api/admin/seo/pages`,
      {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!existingPagesResponse.ok) {
      throw new Error('Failed to fetch existing SEO pages')
    }

    const existingData = await existingPagesResponse.json()
    const existingPages = existingData.pages || []

    // 3. 比较并标记哪些页面已经存在SEO配置
    const existingPaths = new Set(existingPages.map((p: any) => p.page_path))

    discoveredPages.forEach(page => {
      page.exists_in_seo = existingPaths.has(page.page_path)
    })

    // 4. 找出新页面（不在SEO配置中的页面）
    const newPages = discoveredPages.filter(page => !page.exists_in_seo)

    // 5. 找出孤立的SEO配置（SEO中存在但页面不存在的）
    const discoveredPaths = new Set(discoveredPages.map(p => p.page_path))
    const orphanedSeoPages = existingPages.filter(
      (seoPage: any) => !discoveredPaths.has(seoPage.page_path)
    )

    return NextResponse.json({
      success: true,
      summary: {
        total_discovered: discoveredPages.length,
        existing_seo_configs: existingPages.length,
        new_pages: newPages.length,
        orphaned_configs: orphanedSeoPages.length,
      },
      discovered_pages: discoveredPages,
      new_pages: newPages,
      orphaned_configs: orphanedSeoPages,
    })
  } catch (error) {
    console.error('Error syncing pages:', error)
    return NextResponse.json({ error: 'Failed to sync pages' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pages_to_create } = await request.json()

    if (!Array.isArray(pages_to_create)) {
      return NextResponse.json({ error: 'Invalid pages data' }, { status: 400 })
    }

    const createdPages = []
    const errors = []

    // 为每个新页面创建SEO配置
    for (const page of pages_to_create) {
      try {
        const seoData = {
          page_path: page.page_path,
          page_title: page.page_title,
          meta_title: `${page.page_title} - 99Group Gaming Platform`,
          meta_description: `Experience ${page.page_title.toLowerCase()} on 99Group Gaming Platform. Premium gaming experience with secure environment.`,
          robots_meta: 'index, follow',
          canonical_url: '',
          schema_markup: '',
          keywords: '',
          og_title: page.page_title,
          og_description: `Experience ${page.page_title.toLowerCase()} on 99Group Gaming Platform.`,
          og_image: '',
          twitter_title: page.page_title,
          twitter_description: `Experience ${page.page_title.toLowerCase()} on 99Group Gaming Platform.`,
          twitter_image: '',
        }

        const response = await fetch(`${BACKEND_URL}/api/admin/seo/pages`, {
          method: 'POST',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(seoData),
        })

        if (response.ok) {
          const created = await response.json()
          createdPages.push(created)
        } else {
          errors.push({
            page_path: page.page_path,
            error: `HTTP ${response.status}`,
          })
        }
      } catch (error) {
        errors.push({
          page_path: page.page_path,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      created_count: createdPages.length,
      error_count: errors.length,
      created_pages: createdPages,
      errors: errors,
    })
  } catch (error) {
    console.error('Error creating SEO pages:', error)
    return NextResponse.json(
      { error: 'Failed to create SEO pages' },
      { status: 500 }
    )
  }
}
