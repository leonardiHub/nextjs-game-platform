import { Metadata } from 'next'
import { generateMetadata } from '@/utils/seo'

// 为首页生成metadata
export async function generateHomeMetadata(): Promise<Metadata> {
  return await generateMetadata('/')
}

// 为其他页面生成metadata
export async function generatePageMetadata(pagePath: string): Promise<Metadata> {
  return await generateMetadata(pagePath)
}
