'use client';

import dynamic from 'next/dynamic';

const MermaidDiagram = dynamic(
    () => import('@/components/MermaidDiagram').then(mod => mod.MermaidDiagram),
    {
        ssr: false,
        loading: () => <div className="p-8 text-center text-gray-500">Loading diagram...</div>
    }
);

interface DiagramRendererProps {
    chart: string;
    title?: string;
    explanation?: string;
}

export function DiagramRenderer({ chart, title, explanation }: DiagramRendererProps) {
    return <MermaidDiagram chart={chart} title={title} explanation={explanation} />;
}
