import type { Metadata } from 'next'
import { Kanit } from 'next/font/google'
import './globals.css'
import ClientLayoutProvider from '@/components/ClientLayoutProvider'
import HydrationSuppressor from '@/components/HydrationSuppressor'
import { HydrationProvider } from '@/components/HydrationProvider'
import ClientOnlyScript from '@/components/ClientOnlyScript'
import '@/utils/suppressHydrationWarnings'
import { getGlobalSEOSettings } from '@/utils/seo'

const kanit = Kanit({
  variable: '--font-kanit',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

// 生成默认的metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    const globalSettings = await getGlobalSEOSettings()

    return {
      title: globalSettings.default_meta_title,
      description: globalSettings.default_meta_description,
      openGraph: {
        title: globalSettings.default_meta_title,
        description: globalSettings.default_meta_description,
        siteName: globalSettings.site_name,
        images: globalSettings.default_og_image
          ? [globalSettings.default_og_image]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: globalSettings.default_meta_title,
        description: globalSettings.default_meta_description,
        site: globalSettings.twitter_site,
        images: globalSettings.default_og_image
          ? [globalSettings.default_og_image]
          : undefined,
      },
      icons: {
        icon: globalSettings.favicon_url,
      },
      robots: 'index, follow',
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    // Fallback metadata
    return {
      title: '99Group Gaming Platform',
      description:
        'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
      robots: 'index, follow',
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Use consistent default settings to prevent hydration mismatches
  const defaultSettings = {
    site_name: '99Group Gaming Platform',
    default_meta_title: '99Group - Premium Gaming Platform',
    default_meta_description:
      'Experience the best online gaming platform with 99Group. Get $50 free credits, premium games, and secure gaming environment.',
    default_og_image: '/images/og-default.jpg',
    favicon_url: '/favicon.ico',
    twitter_site: '@99group',
    header_code: '',
    body_code: '',
    footer_code: '',
  }

  let globalSettings = defaultSettings

  try {
    const fetchedSettings = await getGlobalSEOSettings()
    // Only use fetched settings if they're valid and complete
    if (fetchedSettings && typeof fetchedSettings === 'object') {
      globalSettings = { ...defaultSettings, ...fetchedSettings }
      // Ensure header_code is always a string to prevent hydration issues
      globalSettings.header_code = globalSettings.header_code || ''
    }
  } catch (error) {
    console.error('Error loading global SEO settings:', error)
    // Use default settings on error
  }

  return (
    <html lang="en">
      <head>
        {/* 注入自定义header代码 - 使用客户端组件防止hydration不匹配 */}
        <ClientOnlyScript code={globalSettings.header_code} />
        <script
          suppressHydrationWarning={true}
          dangerouslySetInnerHTML={{
            __html: `
              // Ultra-aggressive hydration fix - runs before React hydration
              (function() {
                // Suppress hydration warnings in console
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && (
                    message.includes('A tree hydrated but some attributes') ||
                    message.includes('bis_skin_checked') ||
                    message.includes('hydration') ||
                    message.includes('server rendered HTML') ||
                    message.includes('client properties') ||
                    message.includes('React has detected a change in the order of Hooks') ||
                    message.includes('Rules of Hooks') ||
                    message.includes('Previous render') ||
                    message.includes('Next render') ||
                    message.includes("didn't match the client properties") ||
                    message.includes("This won't be patched up")
                  )) {
                    return; // Suppress hydration warnings
                  }
                  originalError.apply(console, args);
                };
                
                // Override setAttribute to block bis_skin_checked
                const originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  if (name === 'bis_skin_checked' || name === 'data-adblock' || name === 'data-extension') {
                    return; // Block these attributes completely
                  }
                  return originalSetAttribute.call(this, name, value);
                };
                
                function cleanupAttributes() {
                  try {
                    const attrs = ['bis_skin_checked', 'data-adblock', 'data-extension', 'data-darkreader', 'data-grammarly-shadow-root'];
                    attrs.forEach(attr => {
                      const elements = document.querySelectorAll('[' + attr + ']');
                      elements.forEach(el => {
                        try {
                          el.removeAttribute(attr);
                        } catch(e) {}
                      });
                    });
                  } catch(e) {}
                }
                
                // Run cleanup immediately and frequently
                cleanupAttributes();
                setInterval(cleanupAttributes, 10);
                
                // Run before DOMContentLoaded
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', cleanupAttributes);
                } else {
                  cleanupAttributes();
                }
                
                // Also run before React hydration
                if (window.requestIdleCallback) {
                  window.requestIdleCallback(cleanupAttributes);
                } else {
                  setTimeout(cleanupAttributes, 0);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${kanit.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
        suppressContentEditableWarning={true}
        data-hydration-suppressed="true"
      >
        {/* 注入自定义body代码 - 使用客户端组件防止hydration不匹配 */}
        <ClientOnlyScript code={globalSettings.body_code} />

        <HydrationProvider>
          <HydrationSuppressor />
          <ClientLayoutProvider>{children}</ClientLayoutProvider>
        </HydrationProvider>

        {/* 注入自定义footer代码 - 使用客户端组件防止hydration不匹配 */}
        <ClientOnlyScript code={globalSettings.footer_code} />
      </body>
    </html>
  )
}
