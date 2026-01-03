import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TutorialCard } from "@/components";
import { Tutorial, Category } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured tutorials
  const { data: featuredTutorials } = await supabase
    .from("tutorials")
    .select("*, category:categories(*)")
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(3);

  // Fetch recent tutorials
  const { data: recentTutorials } = await supabase
    .from("tutorials")
    .select("*, category:categories(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(6);

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true })
    .limit(8);

  // Stats
  const { count: totalProblems } = await supabase
    .from("tutorials")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { count: totalCategories } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  const { count: totalTopics } = await supabase
    .from("tags")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      {/* Hero Section with Geometric Boxes */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-white dark:bg-transparent transition-colors">
        {/* Geometric background boxes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large tilted rectangle - top right */}
          <div className="absolute -top-20 -right-20 w-96 h-96 border border-gray-100 rounded-3xl rotate-12 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.02]"></div>
          {/* Medium box - left side */}
          <div className="absolute top-40 -left-10 w-72 h-72 border border-blue-50/50 rounded-2xl -rotate-6 bg-blue-50/30 dark:border-white/5 dark:bg-white/[0.02]"></div>
          {/* Small box - center right */}
          <div className="absolute top-1/2 right-1/4 w-48 h-48 border border-indigo-50/50 rounded-xl rotate-45 bg-purple-50/30 dark:border-white/10 dark:bg-white/[0.03]"></div>
          {/* Tiny accent box */}
          <div className="absolute bottom-20 left-1/4 w-32 h-32 border border-cyan-500/20 rounded-xl rotate-12 bg-cyan-500/[0.05] dark:bg-cyan-500/[0.02]"></div>
          {/* Another accent */}
          <div className="absolute top-20 left-1/3 w-20 h-20 border border-emerald-500/20 rounded-lg -rotate-12 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.02]"></div>
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 backdrop-blur-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{totalProblems || 0}+ problems available</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">Master Coding</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-500">
                Interview Questions
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Clear explanations. Multiple languages. Real interview patterns.
              <span className="font-medium text-gray-900 dark:text-white"> Crack FAANG and beyond.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/problems"
                className="px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:shadow-white/10"
              >
                Start Practicing →
              </Link>
              <Link
                href="/categories"
                className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all backdrop-blur-sm shadow-sm dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 dark:shadow-none"
              >
                Browse Categories
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex justify-center gap-12 md:gap-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{totalProblems || 0}+</div>
                <div className="text-sm text-gray-500 mt-1">Problems</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{totalCategories || 0}</div>
                <div className="text-sm text-gray-500 mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{totalTopics || 0}+</div>
                <div className="text-sm text-gray-500 mt-1">Topics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      {featuredTutorials && featuredTutorials.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Popular Problems</h2>
              <p className="text-gray-500">Most viewed coding challenges</p>
            </div>
            <Link href="/problems" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredTutorials.map((tutorial: Tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Categories</h2>
              <p className="text-gray-500">Explore by data structure or algorithm</p>
            </div>
            <Link href="/categories" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1">
              All categories →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.map((category: Category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 dark:bg-white/[0.02] dark:border-white/5 dark:hover:bg-white/[0.05] dark:hover:border-white/10 transition-all"
              >
                <div className="text-2xl mb-3">{category.icon || "📁"}</div>
                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors mb-1 text-sm">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {category.tutorial_count || 0} problems
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Tutorials */}
      {recentTutorials && recentTutorials.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Recent</h2>
              <p className="text-gray-500">Latest additions</p>
            </div>
            <Link href="/problems" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-1">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentTutorials.map((tutorial: Tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        </section>
      )}

      {/* Simple CTA */}
      <section className="py-24 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-transparent">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to start?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join developers who trust Letuscrack for interview prep.
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Browse All Problems →
          </Link>
        </div>
      </section>
    </div>
  );
}
