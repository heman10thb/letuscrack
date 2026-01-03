import Link from 'next/link'
import { Tutorial } from '@/types'

interface TutorialCardProps {
    tutorial: Tutorial & { category?: { name: string; slug: string } | null }
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
    const difficultyConfig = {
        easy: {
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-500/30',
            dot: 'bg-emerald-500'
        },
        medium: {
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            text: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-500/30',
            dot: 'bg-amber-500'
        },
        hard: {
            bg: 'bg-red-50 dark:bg-red-500/10',
            text: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-500/30',
            dot: 'bg-red-500'
        },
    }

    const difficulty = difficultyConfig[tutorial.difficulty] || difficultyConfig.easy

    const languageCount = Object.keys(tutorial.solutions || {}).filter(
        (k) => tutorial.solutions?.[k]?.code
    ).length

    return (
        <Link href={`/problems/${tutorial.slug}`} className="block group">
            <article className="h-full flex flex-col p-5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 transition-all duration-200">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
                    {tutorial.title}
                </h3>

                {/* Description */}
                {tutorial.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                        {tutorial.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                    {/* Left: Badges */}
                    <div className="flex items-center gap-2">
                        {/* Difficulty Badge */}
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md border capitalize ${difficulty.bg} ${difficulty.text} ${difficulty.border}`}>
                            {tutorial.difficulty}
                        </span>

                        {/* Category */}
                        {tutorial.category && (
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                {tutorial.category.name}
                            </span>
                        )}
                    </div>

                    {/* Right: Stats */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        {languageCount > 0 && (
                            <span className="flex items-center gap-1" title={`${languageCount} solutions`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="16 18 22 12 16 6" />
                                    <polyline points="8 6 2 12 8 18" />
                                </svg>
                                {languageCount}
                            </span>
                        )}
                        <span className="flex items-center gap-1" title={`${tutorial.views} views`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            {tutorial.views >= 1000 ? `${(tutorial.views / 1000).toFixed(1)}k` : tutorial.views}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    )
}
