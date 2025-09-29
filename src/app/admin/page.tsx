import type { Metadata } from 'next'
import AdminPageClient from './AdminPageClient'
import { getPageSEOSettings, getGlobalSEOSettings } from '@/utils/seo'

export async function generateMetadata(): Promise<Metadata> {
  try {
    // 尝试获取页面特定的SEO设置
    const pageSEO = await getPageSEOSettings('/admin')
    const globalSettings = await getGlobalSEOSettings()
    
    console.log('Admin page SEO data:', pageSEO)
    console.log('Global settings:', globalSettings)
    
    // 临时硬编码测试
    const testPageSEO = {
      meta_title: "Admin - 99Group Gaming Platform",
      meta_description: "Experience admin on 99Group Gaming Platform. Premium gaming experience with secure environment.",
      canonical_url: "https://99group.games/admin",
      robots_meta: "index, follow",
      keywords: "gaming, casino, online games, 99group, free credits, slots, page, gaming, online, admin",
      og_title: "Admin",
      og_description: "Experience admin on 99Group Gaming Platform.",
      og_image: "/images/og-default.jpg",
      twitter_title: "Admin",
      twitter_description: "Experience admin on 99Group Gaming Platform.",
      twitter_image: "/images/og-default.jpg",
      schema_markup: '{"@context":"https://schema.org","url":"https://99group.games/admin","name":"Admin","publisher":{"@type":"Organization","name":"99Group Gaming Platform","logo":{"@type":"ImageObject","url":"https://99group.games/logo.png"}},"inLanguage":"en-US","@type":"WebPage","description":"Admin"}'
    }
    
    // 使用测试数据而不是API数据
    const finalPageSEO = pageSEO || testPageSEO
    
    if (finalPageSEO) {
      const metadata: any = {
        title: finalPageSEO.meta_title || globalSettings.default_meta_title,
        description: finalPageSEO.meta_description || globalSettings.default_meta_description,
        robots: finalPageSEO.robots_meta || globalSettings.default_robots_meta || 'index, follow',
        openGraph: {
          title: finalPageSEO.og_title || finalPageSEO.meta_title || globalSettings.default_meta_title,
          description: finalPageSEO.og_description || finalPageSEO.meta_description || globalSettings.default_meta_description,
          siteName: globalSettings.site_name,
          images: finalPageSEO.og_image ? [finalPageSEO.og_image] : (globalSettings.default_og_image ? [globalSettings.default_og_image] : undefined),
        },
        twitter: {
          card: 'summary_large_image',
          title: finalPageSEO.twitter_title || finalPageSEO.og_title || finalPageSEO.meta_title || globalSettings.default_meta_title,
          description: finalPageSEO.twitter_description || finalPageSEO.og_description || finalPageSEO.meta_description || globalSettings.default_meta_description,
          site: globalSettings.twitter_site,
          images: finalPageSEO.twitter_image ? [finalPageSEO.twitter_image] : (finalPageSEO.og_image ? [finalPageSEO.og_image] : (globalSettings.default_og_image ? [globalSettings.default_og_image] : undefined)),
        },
      }

      // 添加keywords（如果有的话）
      const keywords = finalPageSEO.keywords || globalSettings.default_keywords
      if (keywords && keywords.trim()) {
        metadata.keywords = keywords
      }

      // 添加canonical URL（如果有的话）
      const canonicalUrl = finalPageSEO.canonical_url || (globalSettings.default_canonical_url ? `${globalSettings.default_canonical_url}/admin` : undefined)
      if (canonicalUrl && canonicalUrl.trim()) {
        metadata.alternates = {
          canonical: canonicalUrl,
        }
      }

      // Schema markup will be added in the component itself

      return metadata
    }
    
    // 如果没有页面特定设置，使用全局默认设置
    return {
      title: globalSettings.default_meta_title,
      description: globalSettings.default_meta_description,
      robots: 'index, follow',
    }
  } catch (error) {
    console.error('Error generating admin page metadata:', error)
    return {
      title: 'Admin Panel - 99Group Gaming Platform',
      description: 'Access the admin panel for 99Group Gaming Platform management.',
      robots: 'index, follow',
    }
  }
}

export default async function AdminPage() {
  // 获取schema markup用于JSON-LD
  const pageSEO = await getPageSEOSettings('/admin')
  const globalSettings = await getGlobalSEOSettings()
  const finalPageSEO = pageSEO || {}
  const schemaMarkup = finalPageSEO.schema_markup || globalSettings.default_schema_markup
  
  return (
    <>
      {schemaMarkup && schemaMarkup.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaMarkup
          }}
        />
      )}
      <AdminPageClient />
    </>
  )
}
