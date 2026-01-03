// Database types matching Supabase schema

export interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    display_order: number
    tutorial_count: number
    created_at: string
    updated_at: string
}

export interface Tag {
    id: string
    name: string
    slug: string
    tutorial_count: number
    created_at: string
}

export interface Example {
    input: string
    output: string
    explanation?: string
}

export interface Solution {
    code: string
    explanation: string
}

export interface Solutions {
    python?: Solution
    java?: Solution
    cpp?: Solution
    javascript?: Solution
    c?: Solution
    [key: string]: Solution | undefined
}

export interface Tutorial {
    id: string
    title: string
    slug: string
    description: string | null
    category_id: string | null
    difficulty: 'easy' | 'medium' | 'hard'
    problem_statement: string
    input_format: string | null
    output_format: string | null
    constraints: string | null
    examples: Example[]
    solutions: Solutions
    approach: string | null
    time_complexity: string | null
    space_complexity: string | null
    related_tutorial_ids: string[] | null
    featured_image_url: string | null
    views: number
    status: 'draft' | 'published'
    created_at: string
    updated_at: string
    published_at: string | null
    // Joined fields
    category?: Category | null
    tags?: Tag[]
}

export type TutorialWithCategory = Tutorial & {
    category: Category | null
}


export interface SiteStats {
    id: number
    total_tutorials: number
    total_views: number
    total_categories: number
    total_tags: number
    last_updated: string
}

// API response types
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// Programming language display names
export const LANGUAGE_NAMES: Record<string, string> = {
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    javascript: 'JavaScript',
    c: 'C',
}

export const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
    easy: { bg: 'bg-green-100', text: 'text-green-800' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    hard: { bg: 'bg-red-100', text: 'text-red-800' },
}
