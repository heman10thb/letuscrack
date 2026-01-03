import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role key to bypass RLS for API key validation
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function validateApiKey(req: NextRequest): Promise<boolean> {
    const apiKey = req.headers.get('x-api-key')

    if (!apiKey) {
        return false
    }

    const supabaseAdmin = getAdminClient()

    // Check if key exists and is active
    const { data, error } = await supabaseAdmin
        .from('api_keys')
        .select('id')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single()

    if (error || !data) {
        return false
    }

    // Update last_used_at asynchronously (fire and forget)
    supabaseAdmin
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id)
        .then()

    return true
}

export function unauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing x-api-key header' },
        { status: 401 }
    )
}
