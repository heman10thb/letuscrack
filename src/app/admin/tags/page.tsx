"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Tag } from "@/types";

export default function AdminTagsPage() {
    const supabase = createClient();

    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    useEffect(() => {
        fetchTags();
    }, []);

    async function fetchTags() {
        const { data } = await supabase
            .from("tags")
            .select("*")
            .order("name", { ascending: true });
        if (data) setTags(data);
        setLoading(false);
    }

    function generateSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }

    function resetForm() {
        setName("");
        setSlug("");
        setEditingId(null);
    }

    function startEdit(tag: Tag) {
        setEditingId(tag.id);
        setName(tag.name);
        setSlug(tag.slug);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const tagData = {
            name,
            slug: slug || generateSlug(name),
        };

        if (editingId) {
            await supabase
                .from("tags")
                .update(tagData)
                .eq("id", editingId);
        } else {
            await supabase.from("tags").insert(tagData);
        }

        resetForm();
        fetchTags();
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this tag?")) return;

        await supabase.from("tags").delete().eq("id", id);
        fetchTags();
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Tags</h1>
                    <p className="text-gray-600">Add and edit topic tags</p>
                </div>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Add/Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-4">
                    {editingId ? "Edit Tag" : "Add New Tag"}
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!editingId) setSlug(generateSlug(e.target.value));
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Two Pointers"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            placeholder="two-pointers"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : editingId ? "Update Tag" : "Add Tag"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Tags List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">All Tags ({tags.length})</h2>
                </div>

                {tags.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {tags.map((tag) => (
                            <div key={tag.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <h3 className="font-medium text-gray-900">{tag.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {tag.tutorial_count} tutorials • /{tag.slug}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(tag)}
                                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tag.id)}
                                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No tags yet. Add your first one above!
                    </div>
                )}
            </div>
        </div>
    );
}
