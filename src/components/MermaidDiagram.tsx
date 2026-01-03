'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from './ThemeProvider' // Assuming ThemeProvider exports useTheme

interface MermaidDiagramProps {
    chart: string
    title?: string
    explanation?: string
}

export function MermaidDiagram({ chart, title, explanation }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<string | null>(null)
    const { theme } = useTheme() // Get current theme

    useEffect(() => {
        // Re-initialize mermaid when theme changes
        // Note: Mermaid isn't great at dynamic re-initialization, but render() often picks up config.
        // We might need to use 'base' theme for custom variables.

        const isDark = theme === 'dark'

        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'base', // Use 'base' for light mode to allow customization or 'default'
            themeVariables: isDark ? {
                primaryColor: '#1e40af',
                primaryTextColor: '#e4e4e7',
                primaryBorderColor: '#3b82f6',
                lineColor: '#60a5fa',
                secondaryColor: '#1e3a5f',
                tertiaryColor: '#111113',
                background: '#111113',
                mainBkg: '#1c1c1f',
                nodeBorder: '#3b82f6',
                clusterBkg: '#1c1c1f',
                clusterBorder: '#3b82f6',
                titleColor: '#e4e4e7',
                edgeLabelBackground: '#1c1c1f',
            } : {
                // Light theme variables (Soft Blue/Gray scheme)
                primaryColor: '#e0f2fe',     // Light Blue
                primaryTextColor: '#0f172a', // Slate 900
                primaryBorderColor: '#3b82f6', // Blue 500
                lineColor: '#64748b',       // Slate 500
                secondaryColor: '#f1f5f9',   // Slate 100
                tertiaryColor: '#ffffff',
                background: '#ffffff',
                mainBkg: '#ffffff',
                nodeBorder: '#94a3b8',
                clusterBkg: '#f8fafc',
                clusterBorder: '#cbd5e1',
                titleColor: '#0f172a',
                edgeLabelBackground: '#ffffff',
            },
            flowchart: {
                curve: 'basis',
                padding: 15,
            },
        })

        const renderDiagram = async () => {
            if (containerRef.current && chart) {
                try {
                    containerRef.current.innerHTML = ''
                    const id = `mermaid-${Math.random().toString(36).slice(2)}`
                    // Mermaid render returns { svg }
                    const { svg } = await mermaid.render(id, chart)
                    containerRef.current.innerHTML = svg
                    setError(null)
                } catch (err) {
                    console.error('Mermaid render error:', err)
                    setError('Failed to render diagram')
                }
            }
        }

        renderDiagram()
    }, [chart, theme]) // Re-render when chart OR theme changes

    if (!chart) return null

    return (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden dark:bg-white/[0.02] dark:border-white/5 dark:shadow-none transition-colors">
            {title && (
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 dark:bg-transparent dark:border-white/5">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300">{title}</h3>
                </div>
            )}

            <div className="p-4 bg-white dark:bg-transparent">
                {error ? (
                    <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg dark:text-red-400 dark:bg-red-500/10">
                        {error}
                    </div>
                ) : (
                    <div
                        ref={containerRef}
                        className="flex justify-center overflow-x-auto [&_svg]:max-w-full"
                    />
                )}
            </div>

            {explanation && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.01]">
                    <p className="text-sm text-gray-600 dark:text-gray-500">{explanation}</p>
                </div>
            )}
        </div>
    )
}
