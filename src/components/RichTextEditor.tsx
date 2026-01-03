'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...', className = '' }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        // Make sure we re-render if content changes externally?
        // TipTap warns about this. But for initial load it's fine.
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: `prose dark:prose-invert prose-sm max-w-none focus:outline-none px-4 py-3 text-gray-900 dark:text-gray-100 ${className || 'min-h-[200px]'}`,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return <div className="min-h-[200px] bg-gray-50 border border-gray-200 dark:bg-zinc-800/10 dark:border-white/10 rounded-lg animate-pulse" />;
    }

    // Adaptive classes
    const activeBtnClass = "bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white";
    const inactiveBtnClass = "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10";
    const dividerClass = "w-px h-4 bg-gray-200 dark:bg-white/10 mx-1";

    return (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.02] overflow-hidden focus-within:ring-1 focus-within:ring-cyan-500 transition-colors">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.01]">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('bold') ? activeBtnClass : inactiveBtnClass}`}
                    title="Bold"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('italic') ? activeBtnClass : inactiveBtnClass}`}
                    title="Italic"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="4" x2="10" y2="4" />
                        <line x1="14" y1="20" x2="5" y2="20" />
                        <line x1="15" y1="4" x2="9" y2="20" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('code') ? activeBtnClass : inactiveBtnClass}`}
                    title="Inline Code"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                    </svg>
                </button>
                <div className={dividerClass} />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded transition-colors text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? activeBtnClass : inactiveBtnClass}`}
                    title="Heading 2"
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-2 rounded transition-colors text-xs font-bold ${editor.isActive('heading', { level: 3 }) ? activeBtnClass : inactiveBtnClass}`}
                    title="Heading 3"
                >
                    H3
                </button>
                <div className={dividerClass} />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? activeBtnClass : inactiveBtnClass}`}
                    title="Bullet List"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <circle cx="3" cy="6" r="1" fill="currentColor" />
                        <circle cx="3" cy="12" r="1" fill="currentColor" />
                        <circle cx="3" cy="18" r="1" fill="currentColor" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? activeBtnClass : inactiveBtnClass}`}
                    title="Numbered List"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="10" y1="6" x2="21" y2="6" />
                        <line x1="10" y1="12" x2="21" y2="12" />
                        <line x1="10" y1="18" x2="21" y2="18" />
                        <text x="2" y="8" fontSize="8" fill="currentColor">1</text>
                        <text x="2" y="14" fontSize="8" fill="currentColor">2</text>
                        <text x="2" y="20" fontSize="8" fill="currentColor">3</text>
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded transition-colors ${editor.isActive('codeBlock') ? activeBtnClass : inactiveBtnClass}`}
                    title="Code Block"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <polyline points="9 9 6 12 9 15" />
                        <polyline points="15 9 18 12 15 15" />
                    </svg>
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
