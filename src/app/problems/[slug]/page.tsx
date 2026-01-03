import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs, CodeBlock, SolutionTabs } from "@/components";
import { DiagramRenderer } from "@/components/DiagramRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

interface TutorialPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TutorialPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tutorial } = await supabase
        .from("tutorials")
        .select("title, description")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (!tutorial) {
        return { title: "Tutorial Not Found" };
    }

    return {
        title: tutorial.title,
        description: tutorial.description || `Learn how to solve: ${tutorial.title}`,
    };
}

export default async function TutorialPage({ params }: TutorialPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tutorial } = await supabase
        .from("tutorials")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (!tutorial) {
        notFound();
    }

    const { data: tutorialTags } = await supabase
        .from("tutorial_tags")
        .select("tags(id, name, slug)")
        .eq("tutorial_id", tutorial.id);

    const tags: { id: string; name: string; slug: string }[] = [];
    tutorialTags?.forEach((tt) => {
        // @ts-expect-error - Supabase returns nested object
        if (tt.tags) tags.push(tt.tags);
    });

    supabase.from("tutorials").update({ views: tutorial.views + 1 }).eq("id", tutorial.id).then(() => { });

    const difficultyStyles = {
        easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
        medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
        hard: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    };

    const solutions = tutorial.solutions || {};
    const languages = Object.keys(solutions).filter(lang => solutions[lang]?.code);
    const isHtml = (str: string) => /<[a-z][\s\S]*>/i.test(str);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: tutorial.title,
        description: tutorial.description,
        image: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png` : undefined,
        author: { '@type': 'Organization', name: 'Letuscrack' },
        publisher: { '@type': 'Organization', name: 'Letuscrack', logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png` } },
        datePublished: tutorial.created_at,
        dateModified: tutorial.updated_at,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/problems/${slug}` }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-zinc-900 dark:to-black overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative">
                    {/* Custom Breadcrumbs for dark header */}
                    <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                        <Link href="/" className="hover:text-white transition-colors flex-shrink-0">Home</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 flex-shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
                        <Link href="/problems" className="hover:text-white transition-colors">Problems</Link>
                        {tutorial.category && (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 flex-shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
                                <Link href={`/categories/${tutorial.category.slug}`} className="hover:text-white transition-colors truncate max-w-[150px]">{tutorial.category.name}</Link>
                            </>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 flex-shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
                        <span className="text-gray-200 truncate max-w-[200px] font-medium">{tutorial.title}</span>
                    </nav>

                    <div className="mt-4 mb-4">
                        {/* Badges Row */}
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                            {tutorial.category && (
                                <Link href={`/categories/${tutorial.category.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                    {tutorial.category.name}
                                </Link>
                            )}
                            <span className={`text-sm font-bold px-3 py-1.5 rounded-lg capitalize border ${tutorial.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                tutorial.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                    'bg-red-500/20 text-red-300 border-red-500/30'
                                }`}>
                                {tutorial.difficulty}
                            </span>
                            <div className="flex items-center gap-4 ml-auto text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                    {tutorial.views.toLocaleString()} views
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                            {tutorial.title}
                        </h1>

                        {/* Description */}
                        {tutorial.description && (
                            <p className="mt-4 text-lg text-gray-300 max-w-3xl leading-relaxed">
                                {tutorial.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <main className="flex-1 min-w-0 space-y-6">

                        {/* ========== SECTION 1: UNDERSTAND THE PROBLEM ========== */}
                        <section id="understand" className="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden scroll-mt-24">
                            <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border-b border-gray-200 dark:border-zinc-800">
                                <h2 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                    Understand the Problem
                                </h2>
                            </div>
                            <div className="p-5 space-y-6">
                                {/* Problem Statement */}
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Problem Statement</h3>
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed overflow-x-auto">
                                        {isHtml(tutorial.problem_statement) ? (
                                            <div className="prose dark:prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tutorial.problem_statement }} />
                                        ) : (
                                            <p className="whitespace-pre-wrap">{tutorial.problem_statement}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Constraints */}
                                {tutorial.constraints && (
                                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-500/5 border border-orange-200/50 dark:border-orange-500/20">
                                        <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                                            Constraints
                                        </h4>
                                        <div className="text-sm text-gray-700 dark:text-gray-400 overflow-x-auto">
                                            {isHtml(tutorial.constraints) ? (
                                                <div className="prose dark:prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: tutorial.constraints }} />
                                            ) : (
                                                <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
                                                    {tutorial.constraints.split('\n').filter(Boolean).map((line: string, i: number) => (
                                                        <li key={i}>{line.replace(/^- /, '')}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Examples */}
                                {tutorial.examples && tutorial.examples.length > 0 && (
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Examples</h3>
                                        <div className="space-y-3">
                                            {tutorial.examples.map((ex: { input: string; output: string; explanation?: string }, i: number) => (
                                                <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 overflow-hidden">
                                                    <div className="text-xs font-bold text-gray-500 dark:text-zinc-400 mb-3">Example {i + 1}</div>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <div className="min-w-0">
                                                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Input</div>
                                                            <div className="overflow-x-auto">
                                                                {isHtml(ex.input) ? (
                                                                    <div className="prose dark:prose-invert prose-sm max-w-none p-2 bg-white dark:bg-zinc-900 rounded" dangerouslySetInnerHTML={{ __html: ex.input }} />
                                                                ) : (
                                                                    <CodeBlock code={ex.input} language="text" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Output</div>
                                                            <div className="overflow-x-auto">
                                                                {isHtml(ex.output) ? (
                                                                    <div className="prose dark:prose-invert prose-sm max-w-none p-2 bg-white dark:bg-zinc-900 rounded" dangerouslySetInnerHTML={{ __html: ex.output }} />
                                                                ) : (
                                                                    <CodeBlock code={ex.output} language="text" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {ex.explanation && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                                                            <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Explanation</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {isHtml(ex.explanation) ? (
                                                                    <div className="prose dark:prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: ex.explanation }} />
                                                                ) : (
                                                                    <p>{ex.explanation}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ========== SECTION 2: SOLUTION ========== */}
                        {languages.length > 0 && (
                            <section id="solution" className="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden scroll-mt-24">
                                <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border-b border-gray-200 dark:border-zinc-800">
                                    <h2 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                        Solution
                                    </h2>
                                </div>
                                <div className="p-5">
                                    {/* Code */}
                                    <div className="overflow-x-auto">
                                        <SolutionTabs solutions={solutions} languages={languages} />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ========== SECTION 3: VISUAL (Optional) ========== */}
                        {tutorial.diagram && (
                            <section id="visual" className="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden scroll-mt-24">
                                <div className="px-5 py-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 border-b border-gray-200 dark:border-zinc-800">
                                    <h2 className="text-sm font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wide">
                                        Visual Explanation
                                    </h2>
                                </div>
                                <div className="p-5 overflow-x-auto">
                                    <DiagramRenderer chart={tutorial.diagram.chart} title={tutorial.diagram.title} explanation={tutorial.diagram.explanation} />
                                </div>
                            </section>
                        )}

                        {/* Topics */}
                        {tags.length > 0 && (
                            <div id="topics" className="flex flex-wrap gap-2 scroll-mt-24">
                                {tags.map((tag, i) => (
                                    <Link key={i} href={`/topics/${tag.slug}`} className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700">
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-zinc-800">
                            <Link href="/problems" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                All Problems
                            </Link>
                            {tutorial.category && (
                                <Link href={`/categories/${tutorial.category.slug}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    More {tutorial.category.name}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </Link>
                            )}
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="hidden lg:block lg:w-72 shrink-0">
                        <div className="sticky top-24 space-y-4">

                            {/* Quick Info Card */}
                            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                                    Quick Info
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty</span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${difficultyStyles[tutorial.difficulty as keyof typeof difficultyStyles]}`}>
                                            {tutorial.difficulty}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Views</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                            {tutorial.views.toLocaleString()}
                                        </span>
                                    </div>
                                    {languages.length > 0 && (
                                        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Available in</span>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {languages.map((lang) => (
                                                    <span key={lang} className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 capitalize">
                                                        {lang === 'javascript' ? 'JS' : lang === 'cpp' ? 'C++' : lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table of Contents */}
                            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                                    On This Page
                                </h3>
                                <nav className="space-y-0.5">
                                    <a href="#understand" className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        Understand
                                    </a>
                                    {languages.length > 0 && (
                                        <a href="#solution" className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                            Solution
                                        </a>
                                    )}
                                    {tutorial.diagram && (
                                        <a href="#visual" className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-pink-50 hover:text-pink-700 dark:hover:bg-pink-500/10 dark:hover:text-pink-400 transition-colors">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                            Visual
                                        </a>
                                    )}
                                    {tags.length > 0 && (
                                        <a href="#topics" className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                            Topics
                                        </a>
                                    )}
                                </nav>
                            </div>

                            {/* Share / Actions */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/5 dark:to-blue-500/5 border border-cyan-200/50 dark:border-cyan-500/10 shadow-sm">
                                <h3 className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                    Related
                                </h3>
                                <div className="space-y-2">
                                    {tutorial.category && (
                                        <Link href={`/categories/${tutorial.category.slug}`} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                            More {tutorial.category.name}
                                        </Link>
                                    )}
                                    <Link href="/problems" className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                                        All Problems
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
