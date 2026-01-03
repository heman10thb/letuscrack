import Link from 'next/link'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-8 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0">
                Home
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-400 dark:text-gray-600 flex-shrink-0"
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-gray-900 dark:hover:text-white transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                            title={item.label}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className="text-gray-900 dark:text-gray-200 truncate max-w-[150px] sm:max-w-none font-medium"
                            title={item.label}
                        >
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    )
}
