import { generateHomeMetadata } from './metadata'
import ClientHomePage from '@/components/ClientHomePage'

// 生成动态SEO metadata
export async function generateMetadata() {
  return await generateHomeMetadata()
}

export default function Home() {
  // 返回客户端组件
  return <ClientHomePage />
}