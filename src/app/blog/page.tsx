import type { Metadata } from 'next'
import BlogPageClient from './BlogPageClient'
import { getPageSEOSettings, getGlobalSEOSettings } from '@/utils/seo'

export async function generateMetadata(): Promise<Metadata> {
  try {
    // 尝试获取页面特定的SEO设置
    const pageSEO = await getPageSEOSettings('/blog')
    const globalSettings = await getGlobalSEOSettings()

    console.log('Blog page SEO data:', pageSEO)
    console.log('Global settings:', globalSettings)

    // 使用页面特定设置或全局设置作为fallback
    const finalPageSEO: any = pageSEO || {}

    if (finalPageSEO) {
      const metadata: any = {
        title: finalPageSEO.meta_title || globalSettings.default_meta_title,
        description:
          finalPageSEO.meta_description ||
          globalSettings.default_meta_description,
        robots:
          finalPageSEO.robots_meta ||
          globalSettings.default_robots_meta ||
          'index, follow',
        openGraph: {
          title:
            finalPageSEO.og_title ||
            finalPageSEO.meta_title ||
            globalSettings.default_meta_title,
          description:
            finalPageSEO.og_description ||
            finalPageSEO.meta_description ||
            globalSettings.default_meta_description,
          siteName: globalSettings.site_name,
          images: finalPageSEO.og_image
            ? [finalPageSEO.og_image]
            : globalSettings.default_og_image
              ? [globalSettings.default_og_image]
              : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title:
            finalPageSEO.twitter_title ||
            finalPageSEO.og_title ||
            finalPageSEO.meta_title ||
            globalSettings.default_meta_title,
          description:
            finalPageSEO.twitter_description ||
            finalPageSEO.og_description ||
            finalPageSEO.meta_description ||
            globalSettings.default_meta_description,
          site: globalSettings.twitter_site,
          images: finalPageSEO.twitter_image
            ? [finalPageSEO.twitter_image]
            : finalPageSEO.og_image
              ? [finalPageSEO.og_image]
              : globalSettings.default_og_image
                ? [globalSettings.default_og_image]
                : undefined,
        },
      }

      // 添加keywords（如果有的话）
      const keywords = finalPageSEO.keywords || globalSettings.default_keywords
      if (keywords && keywords.trim()) {
        metadata.keywords = keywords
      }

      // 添加canonical URL（如果有的话）
      const canonicalUrl =
        finalPageSEO.canonical_url ||
        (globalSettings.default_canonical_url
          ? `${globalSettings.default_canonical_url}/blog`
          : undefined)
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
    console.error('Error generating blog page metadata:', error)
    return {
      title: 'Blog - 99Group Gaming Platform',
      description:
        'Read the latest gaming news, tips, and insights on 99Group blog.',
      robots: 'index, follow',
    }
  }
}

export default async function BlogPage() {
  // 获取schema markup用于JSON-LD
  const pageSEO = await getPageSEOSettings('/blog')
  const globalSettings = await getGlobalSEOSettings()
  const finalPageSEO: any = pageSEO || {}
  const schemaMarkup =
    finalPageSEO.schema_markup || globalSettings.default_schema_markup

  return (
    <>
      {schemaMarkup && schemaMarkup.trim() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaMarkup,
          }}
        />
      )}
      <BlogPageClient />
    </>
  )
}
