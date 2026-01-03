"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateTutorial(id: string, data: any) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("tutorials")
        .update({
            ...data,
            // Ensure status logic is safeguarded
            published_at: data.status === "published" && !data.published_at ? new Date().toISOString() : data.published_at
        })
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/problems");
    revalidatePath("/problems");
    revalidatePath(`/problems/${data.slug}`);

    return { success: true };
}

export async function deleteTutorial(id: string) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("tutorials")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/problems");
    revalidatePath("/problems");
}
