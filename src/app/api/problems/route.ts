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
    const { data, error } = await supabase
        .from("tutorials")
        .insert([body])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
}
