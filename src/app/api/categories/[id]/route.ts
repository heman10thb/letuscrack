import { NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse } from "@/lib/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
    const isValid = await validateApiKey(req as any);
    if (!isValid) {
        return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("categories")
        .update(body)
        .eq("id", id)
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

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
}
