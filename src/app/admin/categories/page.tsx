"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Category } from "@/types";

export default function AdminCategoriesPage() {
    const supabase = createClient();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form for new/edit category
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        const { data } = await supabase
            .from("categories")
            .select("*")
            .order("display_order", { ascending: true });
        if (data) setCategories(data);
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
        setDescription("");
        setIcon("");
        setEditingId(null);
    }

    function startEdit(category: Category) {
        setEditingId(category.id);
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description || "");
        setIcon(category.icon || "");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const categoryData = {
            name,
            slug: slug || generateSlug(name),
            description: description || null,
            icon: icon || null,
        };

        if (editingId) {
            // Update
            await supabase
                .from("categories")
                .update(categoryData)
                .eq("id", editingId);
        } else {
            // Insert
            await supabase.from("categories").insert(categoryData);
        }

        resetForm();
        fetchCategories();
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this category?")) return;

        await supabase.from("categories").delete().eq("id", id);
        fetchCategories();
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
                    <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
                    <p className="text-gray-600">Add and edit tutorial categories</p>
                </div>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Add/Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-4">
                    {editingId ? "Edit Category" : "Add New Category"}
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
                            placeholder="e.g., Arrays & Strings"
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
                            placeholder="arrays-strings"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Brief description..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl"
                            placeholder="📊"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : editingId ? "Update Category" : "Add Category"}
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

            {/* Categories List */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">All Categories ({categories.length})</h2>
                </div>

                {categories.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {categories.map((category) => (
                            <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{category.icon || "📁"}</span>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {category.tutorial_count} tutorials • /{category.slug}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => startEdit(category)}
                                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
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
                        No categories yet. Add your first one above!
                    </div>
                )}
            </div>
        </div>
    );
}
