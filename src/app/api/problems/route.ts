import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse } from "@/lib/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const supabase = await createClient();

    const { data: tutorials, error } = await supabase
        .from("tutorials")
        .select("*, category:categories(id, name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: tutorials });
}

export async function POST(req: Request) {
    // 1. Validate API Key
    const isValid = await validateApiKey(req as any);
    if (!isValid) {
        return unauthorizedResponse();
    }

    const supabase = createAdminClient();
    const body = await req.json();

    // 2. Validate Body (Basic)
    if (!body.title || !body.slug) {
        return NextResponse.json({ error: "Missing required fields (title, slug)" }, { status: 400 });
    }

    // 3. Insert Data
    const { selectedTags, ...tutorialData } = body;

    const { data, error } = await supabase
        .from("tutorials")
        .insert([tutorialData])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Insert Tags if present
    if (selectedTags && selectedTags.length > 0 && data) {
        const tagInserts = selectedTags.map((tagId: string) => ({
            tutorial_id: data.id,
            tag_id: tagId
        }));

        const { error: tagError } = await supabase
            .from("tutorial_tags")
            .insert(tagInserts);

        if (tagError) {
            console.error("Error inserting tags:", tagError);
            // We don't fail the whole request if tags fail, but we log it
        }
    }

    return NextResponse.json({ data }, { status: 201 });
}
