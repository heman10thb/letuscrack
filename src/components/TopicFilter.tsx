"use client";

import { useRouter } from "next/navigation";

interface TopicFilterProps {
    tags: { id: string; name: string; slug: string }[];
    currentTopic?: string;
    currentDifficulty?: string;
    currentCategory?: string;
}

export function TopicFilter({ tags, currentTopic, currentDifficulty, currentCategory }: TopicFilterProps) {
    const router = useRouter();

    const buildUrl = (newTopic?: string) => {
        const url = new URLSearchParams();
        if (currentDifficulty) url.set("difficulty", currentDifficulty);
        if (currentCategory) url.set("category", currentCategory);
        if (newTopic) url.set("topic", newTopic);
        return `/problems${url.toString() ? `?${url.toString()}` : ""}`;
    };

    return (
        <div className="relative">
            <select
                className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-xs font-medium bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                value={currentTopic || ""}
                onChange={(e) => {
                    const newTopic = e.target.value || undefined;
                    router.push(buildUrl(newTopic));
                }}
            >
                <option value="">All Topics</option>
                {tags?.map((tag) => (
                    <option key={tag.slug} value={tag.slug}>{tag.name}</option>
                ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
            </svg>
        </div>
    );
}
