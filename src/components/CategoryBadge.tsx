import Link from 'next/link'
import { Category } from '@/types'

interface CategoryBadgeProps {
    category: Category | { name: string; slug: string }
    size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
    const sizeClasses =
        size === 'sm'
            ? 'text-xs px-2 py-0.5'
            : 'text-sm px-3 py-1'

    return (
        <Link
            href={`/categories/${category.slug}`}
            className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-medium transition-colors`}
        >
            {'icon' in category && category.icon && (
                <span>{category.icon}</span>
            )}
            {category.name}
        </Link>
    )
}
