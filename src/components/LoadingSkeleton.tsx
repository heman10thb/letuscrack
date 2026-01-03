interface LoadingSkeletonProps {
    type?: 'card' | 'text' | 'title' | 'code'
    count?: number
}

function SkeletonCard() {
    return (
        <div className="animate-pulse p-5 bg-white rounded-xl border border-gray-100">
            <div className="flex gap-2 mb-3">
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="pt-3 border-t border-gray-50 flex gap-4">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
        </div>
    )
}

function SkeletonText() {
    return (
        <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
    )
}

function SkeletonTitle() {
    return <div className="animate-pulse h-8 bg-gray-200 rounded w-2/3"></div>
}

function SkeletonCode() {
    return (
        <div className="animate-pulse bg-gray-900 rounded-lg p-4 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-700 rounded w-3/5"></div>
        </div>
    )
}

export function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
    const skeletons = Array(count).fill(null)

    switch (type) {
        case 'card':
            return (
                <>
                    {skeletons.map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </>
            )
        case 'text':
            return <SkeletonText />
        case 'title':
            return <SkeletonTitle />
        case 'code':
            return <SkeletonCode />
        default:
            return <SkeletonCard />
    }
}
