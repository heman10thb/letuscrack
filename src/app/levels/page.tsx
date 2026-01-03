import { createClient } from "@/lib/supabase/server";
import { TutorialCard } from "@/components";
import { Tutorial } from "@/types";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Levels",
    description: "Browse coding problems by difficulty level.",
};

const levels = [
    { name: "Easy", slug: "easy", icon: "🌱" },
    { name: "Medium", slug: "medium", icon: "⚡" },
    { name: "Hard", slug: "hard", icon: "🔥" },
];

const colorConfig = {
    easy: {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        dot: 'bg-emerald-500',
        activeBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    },
    medium: {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-500/30',
        dot: 'bg-amber-500',
        activeBg: 'bg-amber-100 dark:bg-amber-500/20',
    },
    hard: {
        bg: 'bg-red-50 dark:bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-500/30',
        dot: 'bg-red-500',
        activeBg: 'bg-red-100 dark:bg-red-500/20',
    },
};

interface LevelsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LevelsPage({ searchParams }: LevelsPageProps) {
    const params = await searchParams;
    const selectedLevel = typeof params.level === "string" ? params.level : undefined;
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Get counts for each difficulty
    const counts: Record<string, number> = {};
    for (const level of levels) {
        const { count } = await supabase
            .from("tutorials")
            .select("*", { count: "exact", head: true })
            .eq("status", "published")
            .eq("difficulty", level.slug);
        counts[level.slug] = count || 0;
    }

    // Get tutorials with optional level filter
    let query = supabase
        .from("tutorials")
        .select("*, category:categories(*)", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (selectedLevel) {
        query = query.eq("difficulty", selectedLevel);
    }

    const { data: tutorials, count } = await query;
    const totalPages = Math.ceil((count || 0) / limit);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    const buildUrl = (newLevel?: string, newPage?: number) => {
        const url = new URLSearchParams();
        if (newLevel) url.set("level", newLevel);
        if (newPage && newPage > 1) url.set("page", String(newPage));
        return `/levels${url.toString() ? `?${url.toString()}` : ""}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-zinc-900 dark:to-black overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="relative max-w-6xl mx-auto px-6 py-12">
                    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600"><polyline points="9 18 15 12 9 6" /></svg>
                        <span className="text-white font-medium">Levels</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                Difficulty Levels
                            </h1>
                            <p className="text-gray-400 max-w-xl">
                                Choose your challenge. Start easy and work your way up.
                            </p>
                        </div>

                        <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl font-bold text-white">{total}</div>
                            <div className="text-xs text-gray-400">Total Problems</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Level Filter Tabs */}
                <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">Level:</span>

                    <Link
                        href="/levels"
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${!selectedLevel
                                ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white"
                                : "bg-transparent text-gray-600 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:border-white/20 dark:hover:bg-white/10"
                            }`}
                    >
                        All ({total})
                    </Link>

                    {levels.map((level) => {
                        const colors = colorConfig[level.slug as keyof typeof colorConfig];
                        const isActive = selectedLevel === level.slug;
                        return (
                            <Link
                                key={level.slug}
                                href={buildUrl(selectedLevel === level.slug ? undefined : level.slug)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isActive
                                        ? `${colors.activeBg} ${colors.text} ${colors.border}`
                                        : `bg-transparent ${colors.text} ${colors.border} hover:${colors.bg}`
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                                {level.name} ({counts[level.slug]})
                            </Link>
                        );
                    })}

                    {selectedLevel && (
                        <Link href="/levels" className="ml-auto text-xs font-medium text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                            Clear
                        </Link>
                    )}
                </div>

                {/* Grid */}
                {tutorials && tutorials.length > 0 ? (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                            {tutorials.map((t: Tutorial) => (
                                <TutorialCard key={t.id} tutorial={t} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3">
                                {page > 1 && (
                                    <Link
                                        href={buildUrl(selectedLevel, page - 1)}
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
                                        href={buildUrl(selectedLevel, page + 1)}
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
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Try selecting a different level.</p>
                        <Link href="/levels" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">View all levels →</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
