import { createClient } from "@/lib/supabase/server";
import { TutorialCard, Breadcrumbs } from "@/components";
import { Tutorial } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

interface LevelPageProps {
    params: Promise<{ level: string }>;
}

const levelInfo = {
    easy: {
        name: "Easy",
        description: "Great for beginners. Build your foundation with these straightforward problems.",
        icon: "🌱",
        color: "emerald",
    },
    medium: {
        name: "Medium",
        description: "Intermediate challenges. Most common difficulty in technical interviews.",
        icon: "⚡",
        color: "amber",
    },
    hard: {
        name: "Hard",
        description: "Advanced problems for experienced developers. Test your limits.",
        icon: "🔥",
        color: "red",
    },
};

export async function generateMetadata({ params }: LevelPageProps): Promise<Metadata> {
    const { level } = await params;
    const info = levelInfo[level as keyof typeof levelInfo];

    if (!info) {
        return { title: "Level Not Found" };
    }

    return {
        title: `${info.name} Problems`,
        description: info.description,
    };
}

export default async function LevelPage({ params }: LevelPageProps) {
    const { level } = await params;
    const info = levelInfo[level as keyof typeof levelInfo];

    if (!info) {
        notFound();
    }

    const supabase = await createClient();

    const { data: tutorials } = await supabase
        .from("tutorials")
        .select("*, category:categories(*)")
        .eq("status", "published")
        .eq("difficulty", level)
        .order("published_at", { ascending: false });

    const colorClasses = {
        emerald: {
            badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
            box: "border-emerald-500/10 bg-emerald-500/[0.02]",
        },
        amber: {
            badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
            box: "border-amber-500/10 bg-amber-500/[0.02]",
        },
        red: {
            badge: "bg-red-500/15 text-red-400 border-red-500/30",
            box: "border-red-500/10 bg-red-500/[0.02]",
        },
    };

    const colors = colorClasses[info.color as keyof typeof colorClasses];

    return (
        <div className="relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-20 right-20 w-64 h-64 border rounded-2xl rotate-12 ${colors.box}`}></div>
                <div className={`absolute bottom-40 left-10 w-40 h-40 border rounded-xl -rotate-6 ${colors.box}`}></div>
            </div>

            <div className="relative max-w-6xl mx-auto px-6 py-12">
                <Breadcrumbs items={[{ label: "Levels", href: "/levels" }, { label: info.name }]} />

                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl">{info.icon}</span>
                        <div>
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded border mb-2 ${colors.badge}`}>
                                {info.name} Level
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">{info.name} Problems</h1>
                        </div>
                    </div>
                    <p className="text-gray-500 max-w-xl">{info.description}</p>
                    <p className="text-sm text-gray-600 mt-3">{tutorials?.length || 0} problems</p>
                </div>

                {tutorials && tutorials.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {tutorials.map((t: Tutorial) => (
                            <TutorialCard key={t.id} tutorial={t} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-5xl mb-6">{info.icon}</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No {info.name.toLowerCase()} problems yet</h3>
                        <p className="text-gray-500 mb-6">Check back soon!</p>
                        <Link href="/levels" className="text-sm text-cyan-400 hover:text-cyan-300">
                            ← Browse all levels
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
