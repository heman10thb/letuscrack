import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://letuscrack.com'

    // Fetch all published tutorials
    const { data: tutorials } = await supabase
        .from('tutorials')
        .select('slug, updated_at')
        .eq('status', 'published')

    // Fetch all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug')

    // Fetch all topics (tags)
    const { data: tags } = await supabase
        .from('tags')
        .select('slug')

    // Static routes
    const routes = [
        '',
        '/problems',
        '/categories',
        '/topics',
        '/levels',
        '/about',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic routes: Tutorials
    const tutorialRoutes = (tutorials || []).map((tutorial) => ({
        url: `${baseUrl}/problems/${tutorial.slug}`,
        lastModified: new Date(tutorial.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    // Dynamic routes: Categories
    const categoryRoutes = (categories || []).map((category) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Dynamic routes: Topics
    const topicRoutes = (tags || []).map((tag) => ({
        url: `${baseUrl}/topics/${tag.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...tutorialRoutes, ...categoryRoutes, ...topicRoutes]
}
