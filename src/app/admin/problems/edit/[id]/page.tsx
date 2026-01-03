"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TutorialForm } from "@/components/admin/TutorialForm";
import { Tutorial } from "@/types";
import { deleteTutorial } from "../../actions"; // We can reuse delete

interface EditTutorialPageProps {
    params: Promise<{ id: string }>;
}

export default function EditTutorialPage({ params }: EditTutorialPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [tutorial, setTutorial] = useState<Tutorial | null>(null);

    useEffect(() => {
        async function fetchData() {
            // Fetch tutorial with tags
            // Assuming M2M relation is setup, or we fetch manually
            const { data, error } = await supabase
                .from("tutorials")
                .select("*, tags(*)")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching tutorial:", error);
                setError("Failed to load tutorial");
            } else {
                setTutorial(data as any); // Cast because Supabase types might differ slightly on joins
            }
            setLoading(false);
        }

        fetchData();
    }, [id, supabase]);

    const handleUpdate = async (formData: any) => {
        setSaving(true);
        setError("");

        const { selectedTags, ...tutorialData } = formData;

        try {
            // Update tutorial fields
            const { error: updateError } = await supabase
                .from("tutorials")
                .update({
                    ...tutorialData,
                    updated_at: new Date().toISOString(),
                    // published_at logic? Keep existing if not changing?
                    // TutorialForm passes status.
                    published_at: tutorialData.status === "published"
                        ? (tutorial?.published_at || new Date().toISOString())
                        : null,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            // Update tags
            // Strategy: Delete all existing and insert new (simple but works)
            if (selectedTags) {
                // Delete existing
                await supabase.from("tutorial_tags").delete().eq("tutorial_id", id);

                // Insert new
                if (selectedTags.length > 0) {
                    await supabase.from("tutorial_tags").insert(
                        selectedTags.map((tagId: string) => ({
                            tutorial_id: id,
                            tag_id: tagId
                        }))
                    );
                }
            }

            router.push("/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this tutorial? This action cannot be undone.")) {
            return;
        }
        setSaving(true);
        try {
            await deleteTutorial(id);
            router.push("/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!tutorial) {
        return <div className="p-8 text-white">Tutorial not found</div>;
    }

    return (
        <div>
            {error && (
                <div className="max-w-7xl mx-auto px-6 mt-4">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                </div>
            )}
            <TutorialForm
                initialData={tutorial}
                onSubmit={handleUpdate}
                isSaving={saving}
                onDelete={handleDelete} // Pass delete handler
            />
        </div>
    );
}
