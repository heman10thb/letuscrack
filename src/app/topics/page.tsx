import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/types";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Topics",
    description: "Browse coding problems by technique and pattern.",
};

export default async function TopicsPage() {
    const supabase = await createClient();

    const { data: tags } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

    // Group by first letter
    const grouped: Record<string, Tag[]> = {};
    tags?.forEach((tag: Tag) => {
        const letter = tag.name[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(tag);
    });

    const totalProblems = tags?.reduce((sum, tag) => sum + (tag.tutorial_count || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-zinc-900 dark:to-black overflow-hidden">
                {/* Dot Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="relative max-w-6xl mx-auto px-6 py-12">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600"><polyline points="9 18 15 12 9 6" /></svg>
                        <span className="text-white font-medium">Topics</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                Topics
                            </h1>
                            <p className="text-gray-400 max-w-xl">
                                Filter by algorithm technique or pattern.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3">
                            <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <div className="text-2xl font-bold text-white">{tags?.length || 0}</div>
                                <div className="text-xs text-gray-400">Topics</div>
                            </div>
                            <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <div className="text-2xl font-bold text-white">{totalProblems}</div>
                                <div className="text-xs text-gray-400">Problems</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Tag Grid */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {tags?.map((tag: Tag) => (
                        <Link
                            key={tag.slug}
                            href={`/topics/${tag.slug}`}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-md transition-all text-sm text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                        >
                            {tag.name}
                            {tag.tutorial_count > 0 && (
                                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{tag.tutorial_count}</span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* A-Z Listing */}
                {Object.keys(grouped).length > 0 && (
                    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
                            Browse A-Z
                        </h2>
                        <div className="space-y-4">
                            {Object.keys(grouped).sort().map((letter) => (
                                <div key={letter} className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{letter}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 flex-1 items-center pt-2">
                                        {grouped[letter].map((tag) => (
                                            <Link
                                                key={tag.slug}
                                                href={`/topics/${tag.slug}`}
                                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                            >
                                                {tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!tags || tags.length === 0) && (
                    <div className="text-center py-16 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                        <div className="text-5xl mb-4">🏷️</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No topics yet</h3>
                        <p className="text-gray-500">Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
