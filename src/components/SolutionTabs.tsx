'use client'

import { useState } from 'react'
import { CodeBlock } from './CodeBlock'

interface Solution {
    code: string
    explanation?: string
    time_complexity?: string
    space_complexity?: string
}

interface SolutionTabsProps {
    solutions: Record<string, Solution>
    languages: string[]
}

const langNames: Record<string, string> = {
    python: "Python",
    javascript: "JavaScript",
    java: "Java",
    cpp: "C++",
    typescript: "TypeScript",
    go: "Go",
    rust: "Rust",
}

export function SolutionTabs({ solutions, languages }: SolutionTabsProps) {
    const [activeLang, setActiveLang] = useState(languages[0])
    const solution = solutions[activeLang]

    if (!solution) return null

    const isHtml = (str: string) => /<[a-z][\s\S]*>/i.test(str)

    return (
        <div>
            {/* Language badges */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                {languages.map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap border ${lang === activeLang
                            ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:border-white/5 dark:hover:bg-white/10 dark:hover:text-white"
                            }`}
                    >
                        {langNames[lang] || lang}
                    </button>
                ))}
            </div>

            {/* Code block with syntax highlighting */}
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                <CodeBlock code={solution.code} language={activeLang} />
            </div>

            {/* Complexity badges */}
            {(solution.time_complexity || solution.space_complexity) && (
                <div className="flex flex-wrap gap-3 mt-4">
                    {solution.time_complexity && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span className="text-xs text-blue-700 dark:text-blue-400">Time:</span>
                            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{solution.time_complexity}</span>
                        </div>
                    )}
                    {solution.space_complexity && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 dark:text-purple-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                            <span className="text-xs text-purple-700 dark:text-purple-400">Space:</span>
                            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{solution.space_complexity}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Explanation */}
            {solution.explanation && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100 dark:bg-indigo-500/5 dark:border-indigo-500/10">
                    <div className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">
                        <span className="text-indigo-700 dark:text-indigo-400 font-medium block mb-1">Approach:</span>
                        {isHtml(solution.explanation) ? (
                            <div className="prose dark:prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: solution.explanation }} />
                        ) : (
                            <p className="whitespace-pre-wrap">{solution.explanation}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

