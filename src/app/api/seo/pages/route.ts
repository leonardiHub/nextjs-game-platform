import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002'

/**
 * 公开的SEO配置API - 用于前端页面获取SEO设置
 * 不需要认证，只返回必要的SEO信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('page_path')
    
    // 直接调用后端的公开SEO API
    const queryParams = new URLSearchParams()
    if (pagePath) {
      queryParams.set('page_path', pagePath)
    }
    
    const response = await fetch(`${BACKEND_URL}/api/seo/pages?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // 如果后端没有公开API，返回空配置
      return NextResponse.json({ pages: [] })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching public SEO pages:', error)
    // 返回空配置而不是错误，避免页面渲染失败
    return NextResponse.json({ pages: [] })
  }
}
