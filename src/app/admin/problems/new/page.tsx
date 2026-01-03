"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { TutorialForm } from "@/components/admin/TutorialForm";

export default function NewTutorialPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (formData: any) => {
        setLoading(true);
        setError("");

        try {
            const { data: tutorial, error: insertError } = await supabase.from("tutorials").insert({
                ...formData,
                // selectedTags is handled separately
                selectedTags: undefined, // remove from spread if it exists in spread logic? 
                // Actually we need to explicitly pick fields if formData has extras.
                // TutorialForm passes { title, ..., selectedTags }
                // We should destructure.
                published_at: formData.status === "published" ? new Date().toISOString() : null,
            })
                // Wait, insert returns select?
                .select()
                .single();

            if (insertError) throw insertError;

            if (tutorial && formData.selectedTags && formData.selectedTags.length > 0) {
                await supabase.from("tutorial_tags").insert(
                    formData.selectedTags.map((tagId: string) => ({
                        tutorial_id: tutorial.id,
                        tag_id: tagId
                    }))
                );
            }

            router.push("/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Note: TutorialForm passes specific structure.
    // However, Supabase insert requires exact column match.
    // I should filter formData inside handleSubmit.

    // Improved handleSubmit:
    const handleCleanSubmit = async (data: any) => {
        setLoading(true);
        setError("");

        const { selectedTags, ...tutorialData } = data;

        try {
            const { data: tutorial, error: insertError } = await supabase.from("tutorials").insert({
                ...tutorialData,
                published_at: tutorialData.status === "published" ? new Date().toISOString() : null,
            }).select().single();

            if (insertError) throw insertError;

            if (tutorial && selectedTags && selectedTags.length > 0) {
                await supabase.from("tutorial_tags").insert(
                    selectedTags.map((tagId: string) => ({
                        tutorial_id: tutorial.id,
                        tag_id: tagId
                    }))
                );
            }

            router.push("/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            // Scroll to top or show error?
            // Since TutorialForm handles UI, maybe pass error back?
            // But TutorialForm doesn't have error prop aside from internal checks?
            // We can render error here.
        } finally {
            setLoading(false);
        }
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
            <TutorialForm onSubmit={handleCleanSubmit} isSaving={loading} />
        </div>
    );
}
