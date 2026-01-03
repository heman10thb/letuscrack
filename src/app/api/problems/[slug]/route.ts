import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tutorial, error } = await supabase
        .from("tutorials")
        .select(`
            *,
            category:categories(*),
            tags:tutorial_tags(
                tag:tags(*)
            )
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Transform tags to flat array
    const flattenedTutorial = {
        ...tutorial,
        tags: tutorial.tags?.map((t: any) => t.tag) || []
    };

    // Increment view count (fire and forget)
    supabase
        .from("tutorials")
        .update({ views: tutorial.views + 1 })
        .eq("id", tutorial.id)
        .then(() => { });

    return NextResponse.json({ data: flattenedTutorial });
}

import { validateApiKey, unauthorizedResponse } from "@/lib/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(req: Request, { params }: RouteParams) {
    const isValid = await validateApiKey(req as any);
    if (!isValid) {
        return unauthorizedResponse();
    }

    const { slug } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const { selectedTags, ...tutorialData } = body;

    const { data: updatedData, error } = await supabase
        .from("tutorials")
        .update(tutorialData)
        .eq("slug", slug)
        .select();

    const data = updatedData ? updatedData[0] : null;

    if (!error && data && selectedTags !== undefined) {
        // Sync tags: Delete existing and insert new
        // 1. Delete existing
        await supabase
            .from("tutorial_tags")
            .delete()
            .eq("tutorial_id", data.id);

        // 2. Insert new if any
        if (selectedTags.length > 0) {
            const tagInserts = selectedTags.map((tagId: string) => ({
                tutorial_id: data.id,
                tag_id: tagId
            }));

            const { error: tagError } = await supabase
                .from("tutorial_tags")
                .insert(tagInserts);

            if (tagError) console.error("Error inserting tags:", tagError);
        }
    }

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function DELETE(req: Request, { params }: RouteParams) {
    const isValid = await validateApiKey(req as any);
    if (!isValid) {
        return unauthorizedResponse();
    }

    const { slug } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("tutorials")
        .delete()
        .eq("slug", slug);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
}
