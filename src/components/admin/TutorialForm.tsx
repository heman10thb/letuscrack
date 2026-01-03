"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Category, Tag, Tutorial } from "@/types";
import { RichTextEditor } from "@/components/RichTextEditor";

interface TutorialFormProps {
    initialData?: Tutorial;
    onSubmit: (data: any) => Promise<void>;
    isSaving: boolean;
    onDelete?: () => Promise<void>;
}

function generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export function TutorialForm({ initialData, onSubmit, isSaving, onDelete }: TutorialFormProps) {
    const supabase = createClient();
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    // Basic info
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags?.map(t => t.id) || []);
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(initialData?.difficulty || "medium");
    const [problemStatement, setProblemStatement] = useState(initialData?.problem_statement || "");
    const [constraints, setConstraints] = useState(initialData?.constraints || "");
    const [inputFormat, setInputFormat] = useState(initialData?.input_format || "");
    const [outputFormat, setOutputFormat] = useState(initialData?.output_format || "");
    const [approach, setApproach] = useState(initialData?.approach || "");
    const [status, setStatus] = useState<"draft" | "published">(initialData?.status || "draft");

    // Solutions (with per-solution complexity)
    const [pythonCode, setPythonCode] = useState(initialData?.solutions?.python?.code || "");
    const [pythonExplanation, setPythonExplanation] = useState(initialData?.solutions?.python?.explanation || "");
    const [pythonTime, setPythonTime] = useState(initialData?.solutions?.python?.time_complexity || "");
    const [pythonSpace, setPythonSpace] = useState(initialData?.solutions?.python?.space_complexity || "");

    const [jsCode, setJsCode] = useState(initialData?.solutions?.javascript?.code || "");
    const [jsExplanation, setJsExplanation] = useState(initialData?.solutions?.javascript?.explanation || "");
    const [jsTime, setJsTime] = useState(initialData?.solutions?.javascript?.time_complexity || "");
    const [jsSpace, setJsSpace] = useState(initialData?.solutions?.javascript?.space_complexity || "");

    const [javaCode, setJavaCode] = useState(initialData?.solutions?.java?.code || "");
    const [javaExplanation, setJavaExplanation] = useState(initialData?.solutions?.java?.explanation || "");
    const [javaTime, setJavaTime] = useState(initialData?.solutions?.java?.time_complexity || "");
    const [javaSpace, setJavaSpace] = useState(initialData?.solutions?.java?.space_complexity || "");

    const [cppCode, setCppCode] = useState(initialData?.solutions?.cpp?.code || "");
    const [cppExplanation, setCppExplanation] = useState(initialData?.solutions?.cpp?.explanation || "");
    const [cppTime, setCppTime] = useState(initialData?.solutions?.cpp?.time_complexity || "");
    const [cppSpace, setCppSpace] = useState(initialData?.solutions?.cpp?.space_complexity || "");

    // Examples
    const [examples, setExamples] = useState(initialData?.examples || [{ input: "", output: "", explanation: "" }]);

    // Diagram
    const [diagramChart, setDiagramChart] = useState((initialData as any)?.diagram?.chart || "");
    const [diagramTitle, setDiagramTitle] = useState((initialData as any)?.diagram?.title || "");
    const [diagramExplanation, setDiagramExplanation] = useState((initialData as any)?.diagram?.explanation || "");

    // Search states
    const [topicSearch, setTopicSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");
    const [showTopicDropdown, setShowTopicDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const topicRef = useRef<HTMLDivElement>(null);
    const categoryRef = useRef<HTMLDivElement>(null);

    // Active solution tab
    const [activeLanguage, setActiveLanguage] = useState<"python" | "javascript" | "java" | "cpp">("python");

    useEffect(() => {
        async function fetchData() {
            const { data: catData } = await supabase.from("categories").select("*").order("name");
            if (catData) setCategories(catData);
            const { data: tagData } = await supabase.from("tags").select("*").order("name");
            if (tagData) setTags(tagData);
        }
        fetchData();
    }, [supabase]);

    useEffect(() => {
        if (!initialData) {
            setSlug(generateSlug(title));
        }
    }, [title, initialData]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (topicRef.current && !topicRef.current.contains(e.target as Node)) setShowTopicDropdown(false);
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategoryDropdown(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const toggleTag = (tagId: string) => setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    const filteredTags = tags.filter(tag => tag.name.toLowerCase().includes(topicSearch.toLowerCase()));
    const filteredCategories = categories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()));

    const createNewTopic = async () => {
        if (!topicSearch.trim()) return;
        const { data } = await supabase.from("tags").insert({ name: topicSearch.trim(), slug: generateSlug(topicSearch) }).select().single();
        if (data) { setTags([...tags, data]); setSelectedTags([...selectedTags, data.id]); setTopicSearch(""); }
    };

    const createNewCategory = async () => {
        if (!categorySearch.trim()) return;
        const { data } = await supabase.from("categories").insert({ name: categorySearch.trim(), slug: generateSlug(categorySearch) }).select().single();
        if (data) { setCategories([...categories, data]); setCategoryId(data.id); setCategorySearch(""); setShowCategoryDropdown(false); }
    };

    const addExample = () => setExamples([...examples, { input: "", output: "", explanation: "" }]);
    const removeExample = (i: number) => examples.length > 1 && setExamples(examples.filter((_, idx) => idx !== i));
    const updateExample = (index: number, field: string, value: string) => {
        const updated = [...examples];
        updated[index] = { ...updated[index], [field]: value };
        setExamples(updated);
    };

    const selectedCategory = categories.find(c => c.id === categoryId);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const solutions: Record<string, { code: string; explanation: string; time_complexity: string; space_complexity: string }> = {};
        if (pythonCode) solutions.python = { code: pythonCode, explanation: pythonExplanation, time_complexity: pythonTime, space_complexity: pythonSpace };
        if (jsCode) solutions.javascript = { code: jsCode, explanation: jsExplanation, time_complexity: jsTime, space_complexity: jsSpace };
        if (javaCode) solutions.java = { code: javaCode, explanation: javaExplanation, time_complexity: javaTime, space_complexity: javaSpace };
        if (cppCode) solutions.cpp = { code: cppCode, explanation: cppExplanation, time_complexity: cppTime, space_complexity: cppSpace };

        const validExamples = examples.filter((ex) => ex.input || ex.output);
        const diagram = diagramChart ? { chart: diagramChart, title: diagramTitle || null, explanation: diagramExplanation || null } : null;

        const formData = {
            title, slug, description, category_id: categoryId || null, difficulty,
            problem_statement: problemStatement, constraints: constraints || null,
            input_format: inputFormat || null, output_format: outputFormat || null,
            examples: validExamples, solutions,
            approach: approach || null, diagram, status,
            selectedTags
        };

        await onSubmit(formData);
    };

    // ADAPTIVE CLASSES
    const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500";
    const labelClass = "block text-xs font-medium text-gray-700 dark:text-zinc-400 mb-1.5";
    const containerClass = "p-5 rounded-xl bg-white border border-gray-200 dark:bg-zinc-900/50 dark:border-zinc-800";
    const headingClass = "text-sm font-semibold text-gray-900 dark:text-white mb-3";

    const languages = [
        { id: "python", label: "Python", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
        { id: "javascript", label: "JS", color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
        { id: "java", label: "Java", color: "bg-orange-500/20 text-orange-600 dark:text-orange-400" },
        { id: "cpp", label: "C++", color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
    ];

    const getCode = () => activeLanguage === "python" ? pythonCode : activeLanguage === "javascript" ? jsCode : activeLanguage === "java" ? javaCode : cppCode;
    const setCode = (v: string) => activeLanguage === "python" ? setPythonCode(v) : activeLanguage === "javascript" ? setJsCode(v) : activeLanguage === "java" ? setJavaCode(v) : setCppCode(v);

    // Changing setters to handle RichText change
    const getExpl = () => activeLanguage === "python" ? pythonExplanation : activeLanguage === "javascript" ? jsExplanation : activeLanguage === "java" ? javaExplanation : cppExplanation;
    const setExpl = (v: string) => activeLanguage === "python" ? setPythonExplanation(v) : activeLanguage === "javascript" ? setJsExplanation(v) : activeLanguage === "java" ? setJavaExplanation(v) : setCppExplanation(v);

    // Per-solution complexity getters/setters
    const getTimeComplexity = () => activeLanguage === "python" ? pythonTime : activeLanguage === "javascript" ? jsTime : activeLanguage === "java" ? javaTime : cppTime;
    const setTimeComplexity = (v: string) => activeLanguage === "python" ? setPythonTime(v) : activeLanguage === "javascript" ? setJsTime(v) : activeLanguage === "java" ? setJavaTime(v) : setCppTime(v);
    const getSpaceComplexity = () => activeLanguage === "python" ? pythonSpace : activeLanguage === "javascript" ? jsSpace : activeLanguage === "java" ? javaSpace : cppSpace;
    const setSpaceComplexity = (v: string) => activeLanguage === "python" ? setPythonSpace(v) : activeLanguage === "javascript" ? setJsSpace(v) : activeLanguage === "java" ? setJavaSpace(v) : setCppSpace(v);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-gray-200 dark:border-zinc-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white text-lg">←</Link>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xl font-bold bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none border-b border-transparent focus:border-cyan-500 pb-1"
                                placeholder="Enter problem title..."
                                required
                            />
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-zinc-500">Slug:</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="text-xs text-gray-400 dark:text-zinc-400 bg-transparent focus:outline-none font-mono"
                                    placeholder="auto-generated-slug"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white text-sm">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                        <button onClick={handleFormSubmit} disabled={isSaving || !title} className="px-5 py-2 bg-cyan-600 dark:bg-cyan-500 text-white dark:text-black font-semibold rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50 text-sm">
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                        {onDelete && (
                            <button onClick={onDelete} disabled={isSaving} className="px-5 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 text-sm">
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Two Column Layout: 60/40 */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-5 gap-6">
                    {/* Left Column - 60% (3/5) */}
                    <div className="col-span-3 space-y-6">
                        {/* Problem Statement with TipTap */}
                        <div className={containerClass}>
                            <h3 className={headingClass}>Problem Statement</h3>
                            <RichTextEditor content={problemStatement} onChange={setProblemStatement} placeholder="Describe the problem..." />

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className={labelClass}>Input Format</label>
                                    <RichTextEditor content={inputFormat} onChange={setInputFormat} placeholder="Input format..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Output Format</label>
                                    <RichTextEditor content={outputFormat} onChange={setOutputFormat} placeholder="Output format..." />
                                </div>
                            </div>
                        </div>

                        {/* Constraints */}
                        <div className={containerClass}>
                            <h3 className={headingClass}>Constraints</h3>
                            <RichTextEditor content={constraints} onChange={setConstraints} placeholder="- 1 <= n <= 10^5..." />
                        </div>

                        {/* Examples */}
                        <div className={containerClass}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className={headingClass}>Examples</h3>
                                <button type="button" onClick={addExample} className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">+ Add</button>
                            </div>
                            {examples.map((ex, i) => (
                                <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-zinc-800/50 dark:border-zinc-700 mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-500 dark:text-zinc-500">Example {i + 1}</span>
                                        {examples.length > 1 && <button type="button" onClick={() => removeExample(i)} className="text-xs text-red-500 dark:text-red-400">×</button>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-medium">Input</label>
                                            <RichTextEditor
                                                content={ex.input}
                                                onChange={(val) => updateExample(i, "input", val)}
                                                className="min-h-[100px] font-mono text-xs"
                                                placeholder="Input..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-medium">Output</label>
                                            <RichTextEditor
                                                content={ex.output}
                                                onChange={(val) => updateExample(i, "output", val)}
                                                className="min-h-[100px] font-mono text-xs"
                                                placeholder="Output..."
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <label className={labelClass}>Explanation (optional)</label>
                                        <RichTextEditor
                                            content={ex.explanation || ""}
                                            onChange={(val) => updateExample(i, "explanation", val)}
                                            placeholder="Explanation..."
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Solutions with tabs */}
                        <div className={containerClass}>
                            <h3 className={headingClass}>Solutions</h3>
                            <div className="flex gap-1 mb-3">
                                {languages.map((lang) => (
                                    <button key={lang.id} type="button" onClick={() => setActiveLanguage(lang.id as typeof activeLanguage)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${activeLanguage === lang.id ? lang.color : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700"}`}>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                            <textarea value={getCode()} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm mb-2" rows={12} placeholder="Enter code..." />

                            {/* Solution Complexity */}
                            <div className="grid grid-cols-2 gap-3 pt-3">
                                <div>
                                    <label className={labelClass}>Time Complexity</label>
                                    <input type="text" value={getTimeComplexity()} onChange={(e) => setTimeComplexity(e.target.value)} className={inputClass} placeholder="O(n)" />
                                </div>
                                <div>
                                    <label className={labelClass}>Space Complexity</label>
                                    <input type="text" value={getSpaceComplexity()} onChange={(e) => setSpaceComplexity(e.target.value)} className={inputClass} placeholder="O(1)" />
                                </div>
                            </div>

                            {/* Solution Explanation - TipTap */}
                            <div className="pt-3">
                                <label className={labelClass}>Explanation</label>
                                <RichTextEditor content={getExpl()} onChange={setExpl} placeholder="Explain the solution..." />
                            </div>
                        </div>

                        {/* Approach with TipTap */}
                        <div className={containerClass}>
                            <h3 className={headingClass}>Approach</h3>
                            <RichTextEditor content={approach} onChange={setApproach} placeholder="Explain the intuition and approach..." />
                        </div>
                    </div>

                    {/* Right Column - 40% (2/5) */}
                    <div className="col-span-2 space-y-6">
                        {/* Meta */}
                        <div className={`${containerClass} space-y-4`}>
                            <h3 className={headingClass}>Details</h3>

                            <div ref={categoryRef} className="relative">
                                <label className={labelClass}>Category</label>
                                <div className={`${inputClass} cursor-pointer flex items-center justify-between`} onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
                                    <span className={selectedCategory ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-zinc-500"}>{selectedCategory?.name || "Select..."}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                                {showCategoryDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
                                            <input type="text" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded text-gray-900 dark:text-white text-sm" placeholder="Search..." autoFocus />
                                        </div>
                                        <div className="max-h-40 overflow-y-auto">
                                            {filteredCategories.map((cat) => (
                                                <button key={cat.id} type="button" onClick={() => { setCategoryId(cat.id); setShowCategoryDropdown(false); setCategorySearch(""); }} className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 ${categoryId === cat.id ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400" : "text-gray-900 dark:text-white"}`}>{cat.name}</button>
                                            ))}
                                            {categorySearch && !filteredCategories.find(c => c.name.toLowerCase() === categorySearch.toLowerCase()) && (
                                                <button type="button" onClick={createNewCategory} className="w-full px-3 py-2 text-left text-sm text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-zinc-700">+ Create &quot;{categorySearch}&quot;</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Difficulty</label>
                                <div className="flex gap-2">
                                    {(["easy", "medium", "hard"] as const).map((d) => (
                                        <button key={d} type="button" onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize ${difficulty === d ? d === "easy" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/50" : d === "medium" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50" : "bg-red-500/20 text-red-600 dark:text-red-400 ring-1 ring-red-500/50" : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-500"}`}>{d}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description (SEO)</label>
                                <RichTextEditor content={description} onChange={setDescription} className="min-h-[100px]" />
                            </div>
                        </div>

                        {/* Topics */}
                        <div ref={topicRef} className={`${containerClass} relative`}>
                            <h3 className={headingClass}>Topics</h3>
                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {selectedTags.map((id) => {
                                        const t = tags.find(t => t.id === id);
                                        return t ? <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded text-xs">{t.name}<button type="button" onClick={() => toggleTag(id)}>×</button></span> : null;
                                    })}
                                </div>
                            )}
                            <input type="text" value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)} onFocus={() => setShowTopicDropdown(true)} className={inputClass} placeholder="Search topics..." />
                            {showTopicDropdown && (topicSearch || filteredTags.length > 0) && (
                                <div className="absolute left-5 right-5 mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                                    {filteredTags.filter(t => !selectedTags.includes(t.id)).map((tag) => (
                                        <button key={tag.id} type="button" onClick={() => { toggleTag(tag.id); setTopicSearch(""); }} className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700">{tag.name}</button>
                                    ))}
                                    {topicSearch && !tags.find(t => t.name.toLowerCase() === topicSearch.toLowerCase()) && (
                                        <button type="button" onClick={createNewTopic} className="w-full px-3 py-2 text-left text-sm text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-zinc-700 border-t border-gray-200 dark:border-zinc-700">+ Create &quot;{topicSearch}&quot;</button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Diagram */}
                        <div className={`${containerClass} space-y-3`}>
                            <h3 className={headingClass}>Visual Diagram <span className="text-gray-500 dark:text-zinc-500 font-normal">(Optional)</span></h3>
                            <input type="text" value={diagramTitle} onChange={(e) => setDiagramTitle(e.target.value)} className={inputClass} placeholder="Title..." />
                            <textarea value={diagramChart} onChange={(e) => setDiagramChart(e.target.value)} className={`${inputClass} font-mono`} rows={6} placeholder={"flowchart TD\n    A --> B"} />
                            <div className="mt-2">
                                <label className={labelClass}>Explanation</label>
                                <RichTextEditor content={diagramExplanation} onChange={setDiagramExplanation} placeholder="Explanation..." className="min-h-[100px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
