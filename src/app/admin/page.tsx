import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    // Fetch stats
    const { count: tutorialCount } = await supabase
        .from("tutorials")
        .select("*", { count: "exact", head: true });

    const { count: publishedCount } = await supabase
        .from("tutorials")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

    const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

    // Calculate total views
    const { data: viewsData } = await supabase
        .from("tutorials")
        .select("views");

    const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;

    const { data: recentTutorials } = await supabase
        .from("tutorials")
        .select("id, title, slug, status, views, created_at, category:categories(name)")
        .order("created_at", { ascending: false })
        .limit(5);

    const handleLogout = async () => {
        "use server";
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/admin/login");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Overview of your content and performance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <form action={handleLogout}>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                        >
                            Sign Out
                        </button>
                    </form>
                    <Link
                        href="/admin/problems/new"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Tutorial
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatsCard
                    title="Total Tutorials"
                    value={tutorialCount || 0}
                    icon={
                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    }
                    change="All time"
                />
                <StatsCard
                    title="Published"
                    value={publishedCount || 0}
                    icon={
                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    change={`${Math.round(((publishedCount || 0) / (tutorialCount || 1)) * 100)}% rate`}
                />
                <StatsCard
                    title="Total Views"
                    value={totalViews.toLocaleString()}
                    icon={
                        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    }
                    change="Across all content"
                />
                <StatsCard
                    title="Categories"
                    value={categoryCount || 0}
                    icon={
                        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 011 12V7a4 4 0 014-4z" />
                        </svg>
                    }
                    change="Active topics"
                />
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <ActionCard
                    href="/admin/categories"
                    title="Categories"
                    description="Manage content taxonomy"
                    icon="📁"
                    color="text-purple-500"
                />
                <ActionCard
                    href="/admin/tags"
                    title="Tags"
                    description="Manage content labels"
                    icon="🏷️"
                    color="text-orange-500"
                />
                <ActionCard
                    href="/admin/api-keys"
                    title="API Keys"
                    description="Manage external access and docs"
                    icon="🔑"
                    color="text-emerald-500"
                />
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Recent Tutorials</h2>
                    <Link href="/admin/problems" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                                <th className="px-6 py-3 font-medium">Title</th>
                                <th className="px-6 py-3 font-medium">Category</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Views</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            {recentTutorials?.map((tutorial) => (
                                <tr key={tutorial.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{tutorial.title}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-0.5 max-w-[200px] truncate">
                                            /{tutorial.slug}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {/* @ts-expect-error - Join type */}
                                        {tutorial.category?.name || "Uncategorized"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tutorial.status === 'published'
                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                                            : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
                                            }`}>
                                            {tutorial.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-mono">
                                        {tutorial.views.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/problems/edit/${tutorial.id}`}
                                            className="text-blue-600 hover:text-blue-500 font-medium opacity-80 hover:opacity-100 transition-opacity"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!recentTutorials || recentTutorials.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No tutorials found. Create your first one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, change }: { title: string, value: number | string, icon: React.ReactNode, change: string }) {
    return (
        <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 dark:bg-white/10 rounded-lg">
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-500">{change}</span>
                </div>
            </div>
        </div>
    );
}

function ActionCard({ href, title, description, icon, color }: { href: string, title: string, description: string, icon: string, color: string }) {
    return (
        <Link
            href={href}
            className="group p-6 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
        >
            <div className="flex items-center gap-4">
                <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-white/10 group-hover:bg-white dark:group-hover:bg-white/20 transition-colors ${color}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {description}
                    </p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        </Link>
    );
}
