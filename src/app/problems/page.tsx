import { createClient } from "@/lib/supabase/server";
import { TutorialCard } from "@/components";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ArticleSearch } from "@/components/ArticleSearch";
import { Tutorial } from "@/types";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Problems",
    description: "Browse all coding problems and practice for interviews.",
};

interface TutorialsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TutorialsPage({ searchParams }: TutorialsPageProps) {
    const params = await searchParams;

    // Parse multi-select params (comma-separated)
    const difficulties = typeof params.difficulty === "string" ? params.difficulty.split(",").filter(Boolean) : [];
    const categoryFilters = typeof params.category === "string" ? params.category.split(",").filter(Boolean) : [];
    const topicFilters = typeof params.topic === "string" ? params.topic.split(",").filter(Boolean) : [];
    const searchQuery = typeof params.q === "string" ? params.q.trim() : "";
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Get categories and tags for filter sidebar
    const { data: categories } = await supabase.from("categories").select("id, name, slug").order("name");
    const { data: tags } = await supabase.from("tags").select("id, name, slug").order("name");

    // Get difficulty counts
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const d of ["easy", "medium", "hard"] as const) {
        const { count } = await supabase
            .from("tutorials")
            .select("*", { count: "exact", head: true })
            .eq("status", "published")
            .eq("difficulty", d);
        counts[d] = count || 0;
    }

    // Build main query
    let tutorialIds: string[] | null = null;

    // If topics are selected, first get tutorial IDs that have these tags
    if (topicFilters.length > 0) {
        const { data: tagData } = await supabase.from("tags").select("id").in("slug", topicFilters);
        if (tagData && tagData.length > 0) {
            const tagIds = tagData.map(t => t.id);
            const { data: tutorialTags } = await supabase
                .from("tutorial_tags")
                .select("tutorial_id")
                .in("tag_id", tagIds);
            tutorialIds = [...new Set(tutorialTags?.map(tt => tt.tutorial_id) || [])];
        } else {
            tutorialIds = [];
        }
    }

    let query = supabase
        .from("tutorials")
        .select("*, category:categories(*)", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false });

    // Apply search filter
    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply topic filter (tutorial IDs)
    if (tutorialIds !== null) {
        if (tutorialIds.length === 0) {
            query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
        } else {
            query = query.in("id", tutorialIds);
        }
    }

    // Apply difficulty filter (multi-select)
    if (difficulties.length > 0) {
        query = query.in("difficulty", difficulties);
    }

    // Apply category filter (multi-select)
    if (categoryFilters.length > 0) {
        const { data: catData } = await supabase.from("categories").select("id").in("slug", categoryFilters);
        if (catData && catData.length > 0) {
            query = query.in("category_id", catData.map(c => c.id));
        }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tutorials, count } = await query;
    const totalPages = Math.ceil((count || 0) / limit);

    const hasFilters = difficulties.length > 0 || categoryFilters.length > 0 || topicFilters.length > 0 || searchQuery;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-zinc-900 dark:to-black overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-12">
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600"><polyline points="9 18 15 12 9 6" /></svg>
                        <span className="text-white font-medium">Problems</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                All Problems
                            </h1>
                            <p className="text-gray-400 max-w-xl">
                                Master data structures and algorithms with our curated collection of coding challenges.
                            </p>
                        </div>

                        <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-white">{count || 0}</div>
                            <div className="text-xs text-gray-400">{hasFilters ? "Matching" : "Total"} Problems</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* Filter Sidebar */}
                    <FilterSidebar
                        categories={categories || []}
                        tags={tags || []}
                        counts={counts}
                    />

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Search Bar */}
                        <div className="flex items-center gap-4 mb-6">
                            <ArticleSearch />
                            <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {count || 0} result{count !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {hasFilters && (
                            <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Filters:</span>
                                {searchQuery && (
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                        &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                                {difficulties.map(d => (
                                    <span key={d} className={`px-2 py-1 rounded text-xs font-medium capitalize ${d === "easy" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                        d === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                                            "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                        }`}>
                                        {d}
                                    </span>
                                ))}
                                {categoryFilters.map(slug => (
                                    <span key={slug} className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
                                        {categories?.find(c => c.slug === slug)?.name || slug}
                                    </span>
                                ))}
                                {topicFilters.map(slug => (
                                    <span key={slug} className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                                        {tags?.find(t => t.slug === slug)?.name || slug}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Grid */}
                        {tutorials && tutorials.length > 0 ? (
                            <>
                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-12">
                                    {tutorials.map((t: Tutorial) => (
                                        <TutorialCard key={t.id} tutorial={t} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-3">
                                        {page > 1 && (
                                            <Link
                                                href={`/problems?${new URLSearchParams({
                                                    ...(searchQuery && { q: searchQuery }),
                                                    ...(difficulties.length > 0 && { difficulty: difficulties.join(",") }),
                                                    ...(categoryFilters.length > 0 && { category: categoryFilters.join(",") }),
                                                    ...(topicFilters.length > 0 && { topic: topicFilters.join(",") }),
                                                    page: String(page - 1),
                                                }).toString()}`}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                                Prev
                                            </Link>
                                        )}
                                        <span className="px-4 py-2 text-sm text-gray-500">
                                            Page {page} of {totalPages}
                                        </span>
                                        {page < totalPages && (
                                            <Link
                                                href={`/problems?${new URLSearchParams({
                                                    ...(searchQuery && { q: searchQuery }),
                                                    ...(difficulties.length > 0 && { difficulty: difficulties.join(",") }),
                                                    ...(categoryFilters.length > 0 && { category: categoryFilters.join(",") }),
                                                    ...(topicFilters.length > 0 && { topic: topicFilters.join(",") }),
                                                    page: String(page + 1),
                                                }).toString()}`}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                                            >
                                                Next
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No problems found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your filters."}
                                </p>
                                <Link href="/problems" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">Clear all filters →</Link>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
