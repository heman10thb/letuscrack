import { createClient } from "@/lib/supabase/server";
import { TutorialCard, Breadcrumbs } from "@/components";
import { Tutorial, Category } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: category } = await supabase
        .from("categories")
        .select("name, description")
        .eq("slug", slug)
        .single();

    if (!category) {
        return { title: "Category Not Found" };
    }

    return {
        title: category.name,
        description: category.description || `Browse ${category.name} coding problems`,
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!category) {
        notFound();
    }

    const { data: tutorials } = await supabase
        .from("tutorials")
        .select("*, category:categories(*)")
        .eq("category_id", category.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });

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
                        <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600"><polyline points="9 18 15 12 9 6" /></svg>
                        <span className="text-white font-medium">{category.name}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <span className="text-4xl">{category.icon || "📁"}</span>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                                    {category.name}
                                </h1>
                            </div>
                            {category.description && (
                                <p className="text-gray-400 max-w-xl">
                                    {category.description}
                                </p>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="px-5 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shrink-0">
                            <div className="text-2xl font-bold text-white">{tutorials?.length || 0}</div>
                            <div className="text-xs text-gray-400">Problems</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-10">
                {tutorials && tutorials.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tutorials.map((tutorial: Tutorial) => (
                            <TutorialCard key={tutorial.id} tutorial={tutorial} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No problems yet</h3>
                        <p className="text-gray-500 mb-6">Problems for this category coming soon.</p>
                        <Link href="/categories" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                            ← Browse all categories
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
