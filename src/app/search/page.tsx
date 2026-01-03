import { createClient } from "@/lib/supabase/server";
import { TutorialCard, Breadcrumbs } from "@/components";
import { Tutorial } from "@/types";
import { Metadata } from "next";
import Link from "next/link";

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Search: ${q}` : "Search",
        description: "Search coding problems and tutorials.",
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const supabase = await createClient();

    let tutorials: Tutorial[] = [];

    if (q) {
        const { data } = await supabase
            .from("tutorials")
            .select("*, category:categories(*)")
            .eq("status", "published")
            .or(`title.ilike.%${q}%,description.ilike.%${q}%,problem_statement.ilike.%${q}%`)
            .order("views", { ascending: false })
            .limit(20);
        tutorials = data || [];
    }

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
                        <span className="text-white font-medium">Search</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="w-full max-w-2xl">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
                                {q ? `Results for "${q}"` : "Search Problems"}
                            </h1>

                            {/* Search Form */}
                            <form action="/search" method="GET" className="relative">
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={q}
                                    placeholder="Search by title, description, or content..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:bg-white/15 transition-all backdrop-blur-sm"
                                    autoFocus
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                    <path strokeWidth="2" d="m21 21-4.3-4.3" />
                                </svg>
                            </form>
                        </div>

                        {/* Stats */}
                        {q && (
                            <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shrink-0">
                                <div className="text-2xl font-bold text-white">{tutorials.length}</div>
                                <div className="text-xs text-gray-400">Results Found</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-10">
                {tutorials.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tutorials.map((t) => (
                            <TutorialCard key={t.id} tutorial={t} />
                        ))}
                    </div>
                ) : q ? (
                    <div className="text-center py-16 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                        <p className="text-gray-500 mb-6">We couldn&apos;t find any problems matching &quot;{q}&quot;.</p>
                        <Link href="/problems" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                            Browse all problems →
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-gray-100 dark:bg-zinc-800 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                <path strokeWidth="2" d="m21 21-4.3-4.3" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Start searching</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-1">
                            Enter a keyword above to find coding problems, tutorials, and guides.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
