'use client'

import { useState } from 'react'
import { CodeBlock } from './CodeBlock'
import { Solutions, LANGUAGE_NAMES } from '@/types'

interface LanguageTabsProps {
    solutions: Solutions
}

export function LanguageTabs({ solutions }: LanguageTabsProps) {
    const availableLanguages = Object.keys(solutions).filter(
        (lang) => solutions[lang]?.code
    )
    const [activeTab, setActiveTab] = useState(availableLanguages[0] || 'python')

    if (availableLanguages.length === 0) {
        return (
            <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                No solutions available yet.
            </div>
        )
    }

    const currentSolution = solutions[activeTab]

    return (
        <div className="language-tabs">
            {/* Tab buttons */}
            <div className="flex border-b border-gray-200 mb-0 overflow-x-auto">
                {availableLanguages.map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === lang
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                            }`}
                    >
                        {LANGUAGE_NAMES[lang] || lang}
                    </button>
                ))}
            </div>

            {/* Code block */}
            <CodeBlock code={currentSolution?.code || ''} language={activeTab} />

            {/* Explanation */}
            {currentSolution?.explanation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Explanation
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {currentSolution.explanation}
                    </p>
                </div>
            )}
        </div>
    )
}
