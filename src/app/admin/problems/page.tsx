import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TutorialsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>;
}) {
    const supabase = await createClient();
    const params = await searchParams; // Await searchParams properly
    const page = Number(params?.page) || 1;
    const search = params?.q || "";
    const itemsPerPage = 20;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");

    // Build query
    let query = supabase
        .from("tutorials")
        .select("id, title, slug, status, views, difficulty, created_at, category:categories(name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (search) {
        query = query.ilike("title", `%${search}%`);
    }

    const { data: tutorials, count } = await query;
    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tutorials</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your comprehensive library of {count} tutorials
                    </p>
                </div>
                <Link
                    href="/admin/problems/new"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 self-start sm:self-auto"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Tutorial
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <form className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="search"
                        name="q"
                        defaultValue={search}
                        placeholder="Search tutorials..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </form>
            </div>

            {/* Tutorials Table */}
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Title / Slug</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Stats</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            {tutorials?.map((video) => (
                                <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 max-w-sm">
                                        <div className="font-medium text-gray-900 dark:text-white truncate" title={video.title}>
                                            {video.title}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-0.5 truncate">
                                            /{video.slug}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {/* @ts-expect-error - Supabase join types */}
                                        {video.category?.name || <span className="text-gray-400 italic">No Category</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                        <div>{video.views.toLocaleString()} views</div>
                                        <div className={`mt-1 capitalize ${video.difficulty === 'easy' ? 'text-emerald-500' :
                                            video.difficulty === 'medium' ? 'text-amber-500' : 'text-red-500'
                                            }`}>{video.difficulty}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${video.status === 'published'
                                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20'
                                            : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
                                            }`}>
                                            {video.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/problems/${video.slug}`}
                                                target="_blank"
                                                className="text-gray-400 hover:text-white transition-colors"
                                                title="View Live"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                    <polyline points="15 3 21 3 21 9"></polyline>
                                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                                </svg>
                                            </Link>
                                            <Link
                                                href={`/admin/problems/edit/${video.id}`}
                                                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors font-medium text-xs"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!tutorials || tutorials.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No tutorials found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <Link
                            href={page > 1 ? `?page=${page - 1}&q=${search}` : "#"}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${page > 1
                                ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                : "text-gray-400 pointer-events-none"
                                }`}
                        >
                            Previous
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Page {page} of {totalPages}
                        </span>
                        <Link
                            href={page < totalPages ? `?page=${page + 1}&q=${search}` : "#"}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${page < totalPages
                                ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                                : "text-gray-400 pointer-events-none"
                                }`}
                        >
                            Next
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
