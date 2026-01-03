import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Categories",
    description: "Browse coding problems by category - master data structures and algorithms.",
};

export default async function CategoriesPage() {
    const supabase = await createClient();

    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

    const totalProblems = categories?.reduce((sum, cat) => sum + (cat.tutorial_count || 0), 0) || 0;

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
                        <span className="text-white font-medium">Categories</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                                Categories
                            </h1>
                            <p className="text-gray-400 max-w-xl">
                                Choose a data structure or algorithm family to practice.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3">
                            <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <div className="text-2xl font-bold text-white">{categories?.length || 0}</div>
                                <div className="text-xs text-gray-400">Categories</div>
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categories?.map((category: Category) => (
                        <Link
                            key={category.slug}
                            href={`/categories/${category.slug}`}
                            className="group flex flex-col p-6 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-200"
                        >
                            <div className="text-3xl mb-4">{category.icon || "📁"}</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-2">
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                                    {category.description}
                                </p>
                            )}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                    {category.tutorial_count || 0} problems
                                </span>
                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {(!categories || categories.length === 0) && (
                    <div className="text-center py-16 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                        <div className="text-5xl mb-4">📚</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No categories yet</h3>
                        <p className="text-gray-500">Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
