import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About",
    description: "Learn about Letuscrack - your coding interview preparation resource.",
};

export default function AboutPage() {
    const features = [
        { icon: "🎯", title: "Curated Problems", desc: "Hand-picked problems from real interviews." },
        { icon: "💡", title: "Clear Explanations", desc: "Step-by-step approach breakdowns." },
        { icon: "🔄", title: "Multiple Languages", desc: "Python, Java, C++, JavaScript solutions." },
        { icon: "📊", title: "Complexity Analysis", desc: "Time and space complexity for every solution." },
    ];

    return (
        <div className="relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-32 right-32 w-64 h-64 border border-white/5 rounded-2xl rotate-12 bg-white/[0.01]"></div>
                <div className="absolute bottom-40 left-10 w-48 h-48 border border-cyan-500/10 rounded-xl -rotate-6 bg-cyan-500/[0.02]"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-20">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        About Letuscrack
                    </h1>
                    <p className="text-lg text-gray-400 max-w-xl mx-auto">
                        We&apos;re building the clearest, most practical coding interview preparation resource.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-20 py-10 border-y border-white/5">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">100+</div>
                        <div className="text-sm text-gray-500">Problems</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">4</div>
                        <div className="text-sm text-gray-500">Languages</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">24</div>
                        <div className="text-sm text-gray-500">Categories</div>
                    </div>
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-5 mb-20">
                    {features.map((f) => (
                        <div key={f.title} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="text-2xl mb-4">{f.icon}</div>
                            <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500">{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Mission */}
                <div className="text-center mb-20">
                    <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                    <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
                        Technical interviews shouldn&apos;t be a mystery. With clear explanations and pattern recognition,
                        anyone can succeed at coding interviews.
                    </p>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/problems"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Start Practicing →
                    </Link>
                </div>
            </div>
        </div>
    );
}
