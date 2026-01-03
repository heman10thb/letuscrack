'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFilterProps {
    categories: { name: string; slug: string }[]
    currentCategory?: string
    currentDifficulty?: string
}

export function CategoryFilter({ categories, currentCategory, currentDifficulty }: CategoryFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString())
        if (e.target.value) {
            params.set('category', e.target.value)
        } else {
            params.delete('category')
        }
        params.delete('page')
        router.push(`/problems?${params.toString()}`)
    }

    return (
        <select
            value={currentCategory || ''}
            onChange={handleChange}
            className="px-3 py-1.5 rounded-lg text-sm"
        >
            <option value="">All categories</option>
            {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
        </select>
    )
}
