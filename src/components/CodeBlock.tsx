'use client'

import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import '@/styles/prism-onedark.css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-javascript'

interface CodeBlockProps {
    code: string
    language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
    const codeRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current)
        }
    }, [code, language])

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code)
    }

    const prismLanguage = language === 'cpp' ? 'cpp' : language

    return (
        <div className="code-block-wrapper relative group">
            <button
                onClick={handleCopy}
                className="copy-button absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-1.5 z-10"
                title="Copy code"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy
            </button>
            <pre className="!m-0 !rounded-lg overflow-x-auto select-text cursor-text">
                <code ref={codeRef} className={`language-${prismLanguage} select-text`}>
                    {code}
                </code>
            </pre>
        </div>
    )
}
