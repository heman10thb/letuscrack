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
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Increment view count
    await supabase
        .from("tutorials")
        .update({ views: tutorial.views + 1 })
        .eq("id", tutorial.id);

    return NextResponse.json({ data: tutorial });
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

    const { data, error } = await supabase
        .from("tutorials")
        .update(body)
        .eq("slug", slug)
        .select()
        .single();

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
