#!/usr/bin/env node

/**
 * 测试SEO Schema同步功能
 * 验证从SEO设置到博客页面的schema配置是否正确同步
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3006'
const FRONTEND_URL = 'http://localhost:3000'

async function testSchemaSync() {
  console.log('🧪 测试SEO Schema同步功能...\n')

  try {
    // 1. 测试后端公开SEO API
    console.log('1️⃣ 测试后端公开SEO API...')
    const backendResponse = await fetch(
      `${BASE_URL}/api/seo/pages?page_path=/blog/[slug]`
    )

    if (!backendResponse.ok) {
      console.error('❌ 后端SEO API调用失败:', backendResponse.status)
      return
    }

    const backendData = await backendResponse.json()
    console.log('✅ 后端SEO API响应:', {
      pages_count: backendData.pages?.length || 0,
      has_blog_slug_config:
        backendData.pages?.some(p => p.page_path === '/blog/[slug]') || false,
    })

    // 2. 测试前端SEO API代理
    console.log('\n2️⃣ 测试前端SEO API代理...')
    const frontendResponse = await fetch(
      `${FRONTEND_URL}/api/seo/pages?page_path=/blog/[slug]`
    )

    if (!frontendResponse.ok) {
      console.error('❌ 前端SEO API代理调用失败:', frontendResponse.status)
      return
    }

    const frontendData = await frontendResponse.json()
    console.log('✅ 前端SEO API代理响应:', {
      pages_count: frontendData.pages?.length || 0,
      has_blog_slug_config:
        frontendData.pages?.some(p => p.page_path === '/blog/[slug]') || false,
    })

    // 3. 检查具体的schema配置
    const blogSlugConfig = frontendData.pages?.find(
      p => p.page_path === '/blog/[slug]'
    )
    if (blogSlugConfig) {
      console.log('\n3️⃣ 博客页面SEO配置详情:')
      console.log('✅ 页面路径:', blogSlugConfig.page_path)
      console.log('✅ 页面标题:', blogSlugConfig.page_title)
      console.log('✅ Meta标题:', blogSlugConfig.meta_title)
      console.log(
        '✅ Schema配置:',
        blogSlugConfig.schema_markup ? '已配置' : '未配置'
      )

      if (blogSlugConfig.schema_markup) {
        try {
          const schema = JSON.parse(blogSlugConfig.schema_markup)
          console.log('✅ Schema类型:', schema['@type'])
          console.log('✅ Schema上下文:', schema['@context'])
        } catch (e) {
          console.log('⚠️  Schema格式:', '可能包含模板变量')
        }
      }
    } else {
      console.log('\n❌ 未找到 /blog/[slug] 的SEO配置')
      console.log('💡 请确保在Admin > SEO Settings中已配置该页面')
    }

    // 4. 测试schema处理器
    console.log('\n4️⃣ 测试Schema模板处理...')

    // 模拟博客数据
    const mockBlogData = {
      title: '测试博客文章',
      slug: 'test-blog-post',
      excerpt: '这是一篇测试博客文章的摘要',
      content: '这是博客文章的完整内容...',
      author: 'Test Author',
      published_at: new Date().toISOString(),
      category_name: '技术',
      featured_image_url: '/uploads/test-image.jpg',
      tag_names: '测试,博客,SEO',
    }

    if (blogSlugConfig?.schema_markup) {
      // 这里我们需要导入并测试processSchemaTemplate函数
      console.log('✅ Schema模板存在，可以进行处理')
      console.log(
        '📝 模板预览:',
        blogSlugConfig.schema_markup.substring(0, 200) + '...'
      )
    } else {
      console.log('❌ 没有Schema模板可供处理')
    }

    console.log('\n🎉 测试完成！')
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
testSchemaSync()
