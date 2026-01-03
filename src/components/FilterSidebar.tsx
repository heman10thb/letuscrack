"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useMemo } from "react";

interface FilterSidebarProps {
    categories: { name: string; slug: string }[];
    tags: { name: string; slug: string }[];
    counts?: {
        easy: number;
        medium: number;
        hard: number;
    };
}

export function FilterSidebar({ categories, tags, counts }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse current filters from URL
    const currentDifficulty = searchParams.get("difficulty")?.split(",").filter(Boolean) || [];
    const currentCategory = searchParams.get("category")?.split(",").filter(Boolean) || [];
    const currentTopic = searchParams.get("topic")?.split(",").filter(Boolean) || [];

    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllTopics, setShowAllTopics] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [topicSearch, setTopicSearch] = useState("");

    // Filtered lists based on search
    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return categories;
        return categories.filter(c =>
            c.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    }, [categories, categorySearch]);

    const filteredTopics = useMemo(() => {
        if (!topicSearch.trim()) return tags;
        return tags.filter(t =>
            t.name.toLowerCase().includes(topicSearch.toLowerCase())
        );
    }, [tags, topicSearch]);

    const visibleCategories = showAllCategories || categorySearch ? filteredCategories : filteredCategories.slice(0, 6);
    const visibleTopics = showAllTopics || topicSearch ? filteredTopics : filteredTopics.slice(0, 8);

    const buildUrl = useCallback((type: string, values: string[]) => {
        const params = new URLSearchParams(searchParams.toString());

        if (values.length > 0) {
            params.set(type, values.join(","));
        } else {
            params.delete(type);
        }

        // Reset page when filters change
        params.delete("page");

        return `/problems${params.toString() ? `?${params.toString()}` : ""}`;
    }, [searchParams]);

    const toggleFilter = (type: string, value: string, currentValues: string[]) => {
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        router.push(buildUrl(type, newValues));
    };

    const clearAll = () => {
        router.push("/problems");
    };

    const totalFilters = currentDifficulty.length + currentCategory.length + currentTopic.length;

    const difficultyConfig = [
        { slug: "easy", name: "Easy", color: "emerald", count: counts?.easy },
        { slug: "medium", name: "Medium", color: "amber", count: counts?.medium },
        { slug: "hard", name: "Hard", color: "red", count: counts?.hard },
    ];

    return (
        <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        Filters
                        {totalFilters > 0 && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                                {totalFilters}
                            </span>
                        )}
                    </h2>
                    {totalFilters > 0 && (
                        <button
                            onClick={clearAll}
                            className="text-xs text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Difficulty */}
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Difficulty
                    </h3>
                    <div className="space-y-2">
                        {difficultyConfig.map((d) => {
                            const isSelected = currentDifficulty.includes(d.slug);
                            const colorClasses = {
                                emerald: isSelected
                                    ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/40"
                                    : "border-gray-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-500/40",
                                amber: isSelected
                                    ? "bg-amber-50 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/40"
                                    : "border-gray-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-500/40",
                                red: isSelected
                                    ? "bg-red-50 border-red-300 dark:bg-red-500/10 dark:border-red-500/40"
                                    : "border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-500/40",
                            };
                            const textClasses = {
                                emerald: "text-emerald-600 dark:text-emerald-400",
                                amber: "text-amber-600 dark:text-amber-400",
                                red: "text-red-600 dark:text-red-400",
                            };
                            const dotClasses = {
                                emerald: "bg-emerald-500",
                                amber: "bg-amber-500",
                                red: "bg-red-500",
                            };

                            return (
                                <button
                                    key={d.slug}
                                    onClick={() => toggleFilter("difficulty", d.slug, currentDifficulty)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${colorClasses[d.color as keyof typeof colorClasses]}`}
                                >
                                    <span className={`flex items-center gap-2 text-sm font-medium ${textClasses[d.color as keyof typeof textClasses]}`}>
                                        {d.name}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        {d.count !== undefined && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">{d.count}</span>
                                        )}
                                        {isSelected && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={textClasses[d.color as keyof typeof textClasses]}>
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Categories */}
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Category
                        {currentCategory.length > 0 && (
                            <span className="ml-2 text-cyan-600 dark:text-cyan-400">({currentCategory.length})</span>
                        )}
                    </h3>

                    {/* Search Input */}
                    <div className="relative mb-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                        />
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {visibleCategories.length > 0 ? visibleCategories.map((cat) => {
                            const isSelected = currentCategory.includes(cat.slug);
                            return (
                                <button
                                    key={cat.slug}
                                    onClick={() => toggleFilter("category", cat.slug, currentCategory)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${isSelected
                                        ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                    {isSelected && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            );
                        }) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500 py-2 text-center">No categories found</p>
                        )}
                    </div>
                    {!categorySearch && filteredCategories.length > 6 && (
                        <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                        >
                            {showAllCategories ? "Show less" : `Show all ${filteredCategories.length}`}
                        </button>
                    )}
                </div>

                {/* Topics */}
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Topics
                        {currentTopic.length > 0 && (
                            <span className="ml-2 text-cyan-600 dark:text-cyan-400">({currentTopic.length})</span>
                        )}
                    </h3>

                    {/* Search Input */}
                    <div className="relative mb-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={topicSearch}
                            onChange={(e) => setTopicSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                        />
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {visibleTopics.length > 0 ? visibleTopics.map((tag) => {
                            const isSelected = currentTopic.includes(tag.slug);
                            return (
                                <button
                                    key={tag.slug}
                                    onClick={() => toggleFilter("topic", tag.slug, currentTopic)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${isSelected
                                        ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    <span>{tag.name}</span>
                                    {isSelected && (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </button>
                            );
                        }) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500 py-2 text-center">No topics found</p>
                        )}
                    </div>
                    {!topicSearch && filteredTopics.length > 8 && (
                        <button
                            onClick={() => setShowAllTopics(!showAllTopics)}
                            className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                        >
                            {showAllTopics ? "Show less" : `Show all ${filteredTopics.length}`}
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
